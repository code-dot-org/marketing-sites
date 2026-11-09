"""Validate the payload against the repo-owned JSON Schema.

This runs in the pipeline before anything is written to Contentful, and again
in the write step on the file it is about to upload. The site will validate a
third time on read, because a Contentful JSON field enforces no shape.
"""

from __future__ import annotations

import json
from pathlib import Path
from typing import Any

from .errors import PipelineError

SCHEMA_PATH = Path(__file__).resolve().parent.parent / "schema" / "sodf-payload.schema.json"

# Conservative local cap so an oversized payload fails here, not in Contentful.
# Confirm Contentful's actual JSON-field and entry-size limits before raising it.
MAX_PAYLOAD_BYTES = 500_000


def load_schema(path: Path = SCHEMA_PATH) -> dict[str, Any]:
    with path.open(encoding="utf-8") as handle:
        return json.load(handle)


def payload_size_bytes(payload: dict[str, Any]) -> int:
    return len(json.dumps(payload, separators=(",", ":")).encode("utf-8"))


def validate_payload(payload: dict[str, Any], schema: dict[str, Any] | None = None) -> None:
    """Raise :class:`PipelineError` listing every violation, or return None."""
    from jsonschema import Draft202012Validator

    schema = schema if schema is not None else load_schema()
    validator = Draft202012Validator(schema)
    errors = sorted(validator.iter_errors(payload), key=lambda e: list(e.absolute_path))
    if errors:
        details = "\n".join(
            f"  - {'/'.join(str(p) for p in e.absolute_path) or '(root)'}: {e.message}"
            for e in errors[:50]
        )
        more = f"\n  ... and {len(errors) - 50} more" if len(errors) > 50 else ""
        raise PipelineError(f"Payload failed schema validation:\n{details}{more}")

    size = payload_size_bytes(payload)
    if size > MAX_PAYLOAD_BYTES:
        raise PipelineError(
            f"Payload is {size} bytes, over the {MAX_PAYLOAD_BYTES}-byte local cap."
        )
