import unittest
from datetime import datetime, timezone

from digital_fluency import sheets
from digital_fluency.errors import PipelineError
from tests.fakes import FakeResponse, FakeSession

# Synthetic data shaped like the sheet: human labels in row 1, machine names in row 2.
VALUES = [
    ["State", "Policy tier", "Access %"],
    ["state_code", "policy_tier", "access_pct"],
    ["AA", "tier_1", 0.5],
    ["BB", "tier_2", 0.75],
]


class ParseTableTest(unittest.TestCase):
    def test_maps_by_header_name(self):
        table = sheets.parse_table("Scores", "'Scores'!A1:C4", VALUES, header_row=2)
        self.assertEqual(table.columns, ["state_code", "policy_tier", "access_pct"])
        self.assertEqual(
            table.rows[0], {"state_code": "AA", "policy_tier": "tier_1", "access_pct": 0.5}
        )

    def test_inserting_a_column_does_not_shift_values(self):
        shifted = [
            ["State", "New", "Policy tier", "Access %"],
            ["state_code", "new_col", "policy_tier", "access_pct"],
            ["AA", "x", "tier_1", 0.5],
            ["BB", "y", "tier_2", 0.75],
        ]
        before = sheets.parse_table("S", "S", VALUES, 2).rows
        after = sheets.parse_table("S", "S", shifted, 2).rows
        for b, a in zip(before, after):
            for key, value in b.items():
                self.assertEqual(a[key], value)

    def test_blank_header_columns_are_ignored(self):
        values = [["code", "", "tier"], ["AA", "junk", "tier_1"]]
        table = sheets.parse_table("S", "S", values, header_row=1)
        self.assertEqual(table.columns, ["code", "tier"])
        self.assertEqual(table.rows, [{"code": "AA", "tier": "tier_1"}])

    def test_ragged_rows_fill_missing_cells_with_none(self):
        values = [["code", "tier"], ["AA"]]
        table = sheets.parse_table("S", "S", values, header_row=1)
        self.assertEqual(table.rows, [{"code": "AA", "tier": None}])

    def test_blank_rows_are_skipped(self):
        values = [["code"], [""], [], ["AA"]]
        table = sheets.parse_table("S", "S", values, header_row=1)
        self.assertEqual(table.rows, [{"code": "AA"}])

    def test_duplicate_headers_fail(self):
        values = [["code", "code"], ["AA", "BB"]]
        with self.assertRaisesRegex(PipelineError, "duplicate header"):
            sheets.parse_table("S", "S", values, header_row=1)

    def test_missing_header_row_fails(self):
        with self.assertRaisesRegex(PipelineError, "expected a header in row 2"):
            sheets.parse_table("S", "S", [["only one row"]], header_row=2)

    def test_empty_header_row_fails(self):
        with self.assertRaisesRegex(PipelineError, "no header names"):
            sheets.parse_table("S", "S", [["", ""], ["a", "b"]], header_row=1)


class ReadSheetTest(unittest.TestCase):
    def _read(self, session, ranges=("Scores",)):
        return sheets.read_sheet(
            spreadsheet_id="sheet-123",
            ranges=list(ranges),
            header_row=2,
            session_factory=lambda _qp: session,
            now=lambda: datetime(2026, 11, 9, 12, 0, 0, tzinfo=timezone.utc),
        )

    def test_reads_named_ranges_in_one_batch_call(self):
        session = FakeSession(
            [FakeResponse(200, {"valueRanges": [{"range": "'Scores'!A1:C4", "values": VALUES}]})]
        )
        extract = self._read(session)
        self.assertEqual(extract.read_at, "2026-11-09T12:00:00Z")
        self.assertEqual(len(extract.tables[0].rows), 2)
        params = session.calls[0]["params"]
        self.assertIn(("ranges", "Scores"), params)
        self.assertIn("values:batchGet", session.calls[0]["url"])

    def test_missing_named_range_fails_with_message(self):
        session = FakeSession(
            [FakeResponse(400, {"error": {"message": "Unable to parse range: Nope"}})]
        )
        with self.assertRaisesRegex(PipelineError, "Unable to parse range: Nope"):
            self._read(session, ranges=("Nope",))

    def test_permission_error_includes_sharing_hint(self):
        session = FakeSession([FakeResponse(403, {"error": {"message": "denied"}})])
        with self.assertRaisesRegex(PipelineError, "shared"):
            self._read(session)

    def test_empty_range_is_a_warning_not_an_error(self):
        session = FakeSession(
            [FakeResponse(200, {"valueRanges": [{"range": "S", "values": VALUES[:2]}]})]
        )
        extract = self._read(session)
        self.assertEqual(extract.warnings, ["Range 'Scores' has headers but no data rows."])

    def test_per_range_header_row_override(self):
        tiers = [["Policy Tier", "Points"], ["no", 0], ["in_progress", 0.5]]
        session = FakeSession(
            [
                FakeResponse(
                    200,
                    {
                        "valueRanges": [
                            {"range": "'State Data'!A1:C4", "values": VALUES},
                            {"range": "'Tiers'!A1:B3", "values": tiers},
                        ]
                    },
                )
            ]
        )
        extract = self._read(session, ranges=("'State Data'!A:C", "'Tiers'!A:B@1"))
        self.assertIn(("ranges", "'Tiers'!A:B"), session.calls[0]["params"])
        self.assertEqual(extract.tables[0].columns, ["state_code", "policy_tier", "access_pct"])
        self.assertEqual(extract.tables[1].rows[1], {"Policy Tier": "in_progress", "Points": 0.5})
        self.assertEqual(extract.tables[1].name, "'Tiers'!A:B")

    def test_bad_range_spec_fails(self):
        with self.assertRaisesRegex(PipelineError, "Bad header row"):
            sheets.parse_range_spec("Range@x", 2)

    def test_requires_spreadsheet_and_ranges(self):
        with self.assertRaises(PipelineError):
            sheets.read_sheet("", ["S"], session_factory=lambda _qp: FakeSession([]))
        with self.assertRaises(PipelineError):
            sheets.read_sheet("id", [], session_factory=lambda _qp: FakeSession([]))


class DescribeTest(unittest.TestCase):
    def test_lists_tabs_and_named_ranges_only(self):
        session = FakeSession(
            [
                FakeResponse(
                    200,
                    {
                        "properties": {"title": "Synthetic sheet"},
                        "sheets": [{"properties": {"title": "Scores"}}],
                        "namedRanges": [{"name": "b_range"}, {"name": "a_range"}],
                    },
                )
            ]
        )
        result = sheets.describe_spreadsheet(session, "sheet-123")
        self.assertEqual(result["namedRanges"], ["a_range", "b_range"])
        self.assertNotIn("values", session.calls[0]["params"]["fields"])


if __name__ == "__main__":
    unittest.main()
