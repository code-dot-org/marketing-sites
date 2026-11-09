"""Which parts of the sheet the pipeline reads.

These describe the sheet's structure, which the transform depends on, so they
are versioned and reviewed with the code rather than set in GitHub settings.
Each entry is a named range or A1 range, with ``@N`` giving the 1-based row
*within that range* that holds the column machine names.

Locally you can try other ranges without editing this file by setting
``DIGITAL_FLUENCY_RANGES`` (comma-separated, same syntax). The GitHub workflow
does not pass that variable, so CI always uses these.
"""

SHEET_RANGES: tuple[str, ...] = (
    # Row 1: group labels ("Policy Tiers (1-10)", ...). Row 2: machine names.
    "'State Data 2026'!A:AL@2",
    # Row 1: "Policy Tier", "Points", "Meaning". No separate machine-name row.
    "'Reference - Tiers'!A:C@1",
)

# Used for an override range that has no @N suffix.
DEFAULT_HEADER_ROW = 2
