"""Command-line entry point: ``python -m sodf_pipeline <command>``.

Commands:

* ``describe``: list the sheet's tabs and named ranges (no cell values).
* ``build --output FILE``: read the sheet, run the placeholder transform,
  validate, and write an envelope file. Needs Google credentials only.
* ``write --input FILE``: re-validate an envelope file and write it to the
  Contentful entry as a draft. Needs the Contentful token only.

Configuration comes from environment variables (see README.md).
"""

from __future__ import annotations

import argparse
import json
import os
import sys
from pathlib import Path
from typing import Any, Sequence

from . import contentful, sheets, transform, validate
from .errors import PipelineError

ENVELOPE_TITLE = "State of Digital Fluency data"
MAX_WARNINGS = 50
MAX_SYMBOL_LENGTH = 255


def _env(name: str, default: str = "") -> str:
    return os.environ.get(name, default).strip()


def _ranges_from_env() -> list[str]:
    return [r.strip() for r in _env("SODF_RANGES").split(",") if r.strip()]


def _header_row_from_env() -> int:
    raw = _env("SODF_HEADER_ROW", "2")
    try:
        return int(raw)
    except ValueError as exc:
        raise PipelineError(f"SODF_HEADER_ROW must be an integer, got '{raw}'.") from exc


def _run_url() -> str | None:
    server, repo, run_id = (
        _env("GITHUB_SERVER_URL"),
        _env("GITHUB_REPOSITORY"),
        _env("GITHUB_RUN_ID"),
    )
    if server and repo and run_id:
        return f"{server}/{repo}/actions/runs/{run_id}"
    return None


def build_envelope(extract: sheets.SheetExtract, payload: dict[str, Any]) -> dict[str, Any]:
    warnings = [w[:MAX_SYMBOL_LENGTH] for w in extract.warnings[:MAX_WARNINGS]]
    return {
        "meta": {
            "title": ENVELOPE_TITLE,
            "schemaVersion": payload["schemaVersion"],
            "dataAsOf": extract.read_at[:10],
            "sourceSpreadsheetId": extract.spreadsheet_id,
            # POC: the read time stands in for a revision. A true Drive revision
            # ID needs a Drive metadata scope; decide in planning whether it's
            # worth widening the scope.
            "sourceRevision": f"read:{extract.read_at}",
            "warnings": warnings,
            "runUrl": _run_url(),
        },
        "payload": payload,
    }


def check_envelope(envelope: dict[str, Any]) -> None:
    """Validate the envelope file before it goes anywhere near Contentful."""
    if not isinstance(envelope, dict) or set(envelope) != {"meta", "payload"}:
        raise PipelineError("Envelope must have exactly 'meta' and 'payload'.")
    validate.validate_payload(envelope["payload"])
    meta = envelope["meta"]
    required = ("title", "schemaVersion", "dataAsOf", "sourceSpreadsheetId", "sourceRevision")
    for key in required:
        value = meta.get(key)
        if not isinstance(value, str) or not value or len(value) > MAX_SYMBOL_LENGTH:
            raise PipelineError(f"Envelope meta '{key}' must be a non-empty string.")
    if meta["schemaVersion"] != envelope["payload"]["schemaVersion"]:
        raise PipelineError("Envelope meta schemaVersion does not match the payload.")
    warnings = meta.get("warnings", [])
    if not isinstance(warnings, list) or len(warnings) > MAX_WARNINGS or any(
        not isinstance(w, str) or len(w) > MAX_SYMBOL_LENGTH for w in warnings
    ):
        raise PipelineError("Envelope meta 'warnings' must be a short list of strings.")
    run_url = meta.get("runUrl")
    if run_url is not None and not (
        isinstance(run_url, str) and run_url.startswith("https://github.com/")
    ):
        raise PipelineError("Envelope meta 'runUrl' must be a GitHub URL or null.")


def _write_step_summary(lines: list[str]) -> None:
    path = _env("GITHUB_STEP_SUMMARY")
    if path:
        with open(path, "a", encoding="utf-8") as handle:
            handle.write("\n".join(lines) + "\n")


def cmd_describe(_args: argparse.Namespace) -> int:
    session = sheets.authorized_session(_env("GOOGLE_CLOUD_QUOTA_PROJECT") or None)
    spreadsheet_id = _env("SODF_SPREADSHEET_ID")
    if not spreadsheet_id:
        raise PipelineError("No spreadsheet configured. Set SODF_SPREADSHEET_ID.")
    print(json.dumps(sheets.describe_spreadsheet(session, spreadsheet_id), indent=2))
    return 0


def cmd_build(args: argparse.Namespace) -> int:
    extract = sheets.read_sheet(
        spreadsheet_id=_env("SODF_SPREADSHEET_ID"),
        ranges=_ranges_from_env(),
        header_row=_header_row_from_env(),
        quota_project_id=_env("GOOGLE_CLOUD_QUOTA_PROJECT") or None,
    )
    payload = transform.build_payload(extract)
    envelope = build_envelope(extract, payload)
    check_envelope(envelope)

    output = Path(args.output)
    output.parent.mkdir(parents=True, exist_ok=True)
    output.write_text(json.dumps(envelope, indent=2) + "\n", encoding="utf-8")

    summary = [
        "### SODF build",
        f"- Read at: `{extract.read_at}`",
        f"- Payload size: {validate.payload_size_bytes(payload)} bytes (valid)",
        "",
        "| Range | Resolved | Columns | Rows |",
        "| --- | --- | --- | --- |",
    ] + [
        f"| `{r['name']}` | `{r['resolvedRange']}` | {len(r['columns'])} | {r['rowCount']} |"
        for r in payload["ranges"]
    ]
    if extract.warnings:
        summary += ["", "**Warnings**"] + [f"- {w}" for w in extract.warnings]
    print("\n".join(summary))
    _write_step_summary(summary)
    return 0


def cmd_write(args: argparse.Namespace) -> int:
    envelope = json.loads(Path(args.input).read_text(encoding="utf-8"))
    check_envelope(envelope)
    target = contentful.ContentfulTarget(
        space_id=_env("CONTENTFUL_SPACE_ID"),
        environment_id=_env("CONTENTFUL_ENVIRONMENT_ID", "master"),
        entry_id=_env("CONTENTFUL_ENTRY_ID"),
        content_type_id=_env("CONTENTFUL_CONTENT_TYPE_ID", "stateOfDigitalFluencyData"),
        locale=_env("CONTENTFUL_LOCALE", "en-US"),
    )
    result = contentful.write_draft(
        target, envelope, token=os.environ.get("CONTENTFUL_MANAGEMENT_TOKEN", "")
    )
    state = (
        "draft only (never published)"
        if result.published_version is None
        else "published entry now has unpublished changes"
    )
    summary = [
        "### SODF Contentful write",
        f"- Entry {result.action}: [{target.entry_id}]({result.web_url})",
        f"- Version: {result.version}; state: {state}",
        "- Review on a preview host, then publish in Contentful.",
    ]
    print("\n".join(summary))
    _write_step_summary(summary)
    return 0


def main(argv: Sequence[str] | None = None) -> int:
    parser = argparse.ArgumentParser(prog="sodf_pipeline", description=__doc__.split("\n")[0])
    sub = parser.add_subparsers(dest="command", required=True)

    sub.add_parser("describe", help="List tabs and named ranges.").set_defaults(func=cmd_describe)

    build = sub.add_parser("build", help="Read the sheet and write an envelope file.")
    build.add_argument("--output", required=True, help="Path for the envelope JSON.")
    build.set_defaults(func=cmd_build)

    write = sub.add_parser("write", help="Write an envelope file to Contentful (draft).")
    write.add_argument("--input", required=True, help="Envelope JSON from `build`.")
    write.set_defaults(func=cmd_write)

    args = parser.parse_args(argv)
    try:
        return args.func(args)
    except PipelineError as exc:
        print(f"error: {exc}", file=sys.stderr)
        return 1
