"""PLACEHOLDER transform: replace with the real processing and scoring.

This exists only to prove the wiring (sheet → Python → validated JSON →
Contentful). It does no scoring. It summarizes what was read: the column
machine names, row counts, and a content fingerprint per range, so you can tell
that a sheet edit made it all the way to Contentful without copying cell values
into the envelope.

To plug in the real methodology (the prototype's ``build_json_from_xlsx.py``),
replace :func:`build_payload` and update ``schema/digital-fluency-payload.schema.json`` to
match. Keep the function pure (extract in, dict out) so it stays testable.
"""

from __future__ import annotations

import hashlib
import json
from typing import Any

from .sheets import RangeTable, SheetExtract

PAYLOAD_SCHEMA_VERSION = "0.1.0-poc"


def _fingerprint(table: RangeTable) -> str:
    """SHA-256 of the range's parsed rows, stable across column reordering."""
    canonical = json.dumps(
        [dict(sorted(row.items())) for row in table.rows],
        sort_keys=True,
        separators=(",", ":"),
        default=str,
    )
    return hashlib.sha256(canonical.encode("utf-8")).hexdigest()


def build_payload(extract: SheetExtract) -> dict[str, Any]:
    """Build the JSON payload that goes inside the Contentful envelope."""
    ranges = [
        {
            "name": table.name,
            "resolvedRange": table.resolved_range,
            "columns": sorted(table.columns),
            "rowCount": len(table.rows),
            "fingerprint": _fingerprint(table),
        }
        for table in extract.tables
    ]
    return {
        "schemaVersion": PAYLOAD_SCHEMA_VERSION,
        "placeholder": True,
        "readAt": extract.read_at,
        "ranges": ranges,
        "totals": {
            "rangeCount": len(ranges),
            "rowCount": sum(r["rowCount"] for r in ranges),
        },
    }
