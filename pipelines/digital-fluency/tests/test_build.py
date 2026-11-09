import copy
import unittest

from digital_fluency import cli, transform, validate
from digital_fluency.errors import PipelineError
from digital_fluency.sheets import RangeTable, SheetExtract


def synthetic_extract() -> SheetExtract:
    return SheetExtract(
        spreadsheet_id="sheet-123",
        read_at="2026-11-09T12:00:00Z",
        tables=[
            RangeTable(
                name="Scores",
                resolved_range="'Scores'!A1:C4",
                columns=["state_code", "policy_tier"],
                rows=[
                    {"state_code": "AA", "policy_tier": "tier_1"},
                    {"state_code": "BB", "policy_tier": "tier_2"},
                ],
            )
        ],
    )


class TransformTest(unittest.TestCase):
    def test_placeholder_payload_is_valid_and_has_no_cell_values(self):
        payload = transform.build_payload(synthetic_extract())
        validate.validate_payload(payload)
        self.assertEqual(payload["totals"], {"rangeCount": 1, "rowCount": 2})
        self.assertNotIn("tier_1", str(payload))

    def test_fingerprint_ignores_column_order_but_tracks_values(self):
        a = synthetic_extract()
        reordered = copy.deepcopy(a)
        reordered.tables[0].rows[:] = [
            {"policy_tier": r["policy_tier"], "state_code": r["state_code"]}
            for r in a.tables[0].rows
        ]
        edited = copy.deepcopy(a)
        edited.tables[0].rows[0]["policy_tier"] = "tier_3"

        fp = lambda e: transform.build_payload(e)["ranges"][0]["fingerprint"]
        self.assertEqual(fp(a), fp(reordered))
        self.assertNotEqual(fp(a), fp(edited))


class ValidateTest(unittest.TestCase):
    def setUp(self):
        self.payload = transform.build_payload(synthetic_extract())

    def test_rejects_extra_properties(self):
        self.payload["extra"] = 1
        with self.assertRaisesRegex(PipelineError, "Additional properties"):
            validate.validate_payload(self.payload)

    def test_rejects_html_in_strings(self):
        self.payload["ranges"][0]["columns"] = ["<script>"]
        with self.assertRaises(PipelineError):
            validate.validate_payload(self.payload)

    def test_rejects_wrong_schema_version(self):
        self.payload["schemaVersion"] = "9"
        with self.assertRaises(PipelineError):
            validate.validate_payload(self.payload)

    def test_rejects_oversized_payload(self):
        original = validate.MAX_PAYLOAD_BYTES
        validate.MAX_PAYLOAD_BYTES = 10
        try:
            with self.assertRaisesRegex(PipelineError, "local cap"):
                validate.validate_payload(self.payload)
        finally:
            validate.MAX_PAYLOAD_BYTES = original


class EnvelopeTest(unittest.TestCase):
    def setUp(self):
        extract = synthetic_extract()
        self.envelope = cli.build_envelope(extract, transform.build_payload(extract))

    def test_envelope_metadata(self):
        cli.check_envelope(self.envelope)
        meta = self.envelope["meta"]
        self.assertEqual(meta["dataAsOf"], "2026-11-09")
        self.assertEqual(meta["sourceSpreadsheetId"], "sheet-123")
        self.assertEqual(meta["schemaVersion"], "0.1.0-poc")

    def test_rejects_tampered_payload(self):
        self.envelope["payload"]["placeholder"] = False
        with self.assertRaises(PipelineError):
            cli.check_envelope(self.envelope)

    def test_rejects_non_github_run_url(self):
        self.envelope["meta"]["runUrl"] = "https://example.com/x"
        with self.assertRaisesRegex(PipelineError, "runUrl"):
            cli.check_envelope(self.envelope)

    def test_rejects_unexpected_top_level_keys(self):
        self.envelope["extra"] = {}
        with self.assertRaises(PipelineError):
            cli.check_envelope(self.envelope)


if __name__ == "__main__":
    unittest.main()
