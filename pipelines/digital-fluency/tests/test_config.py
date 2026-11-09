import os
import unittest
from unittest import mock

from digital_fluency import cli, config, sheets


class ConfigTest(unittest.TestCase):
    def test_every_configured_range_has_an_explicit_header_row(self):
        for spec in config.SHEET_RANGES:
            self.assertIn("@", spec, spec)
            _name, row = sheets.parse_range_spec(spec, config.DEFAULT_HEADER_ROW)
            self.assertGreaterEqual(row, 1)

    def test_uses_config_ranges_by_default(self):
        with mock.patch.dict(os.environ, {"DIGITAL_FLUENCY_RANGES": ""}):
            self.assertEqual(cli._ranges(), list(config.SHEET_RANGES))

    def test_local_override(self):
        with mock.patch.dict(os.environ, {"DIGITAL_FLUENCY_RANGES": "a@1, b"}):
            self.assertEqual(cli._ranges(), ["a@1", "b"])


if __name__ == "__main__":
    unittest.main()
