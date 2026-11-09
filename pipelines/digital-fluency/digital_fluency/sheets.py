"""Read named ranges from the report's Google Sheet.

Authentication uses Application Default Credentials (``google.auth.default``)
so the same code runs:

* locally, with an engineer's own ``gcloud auth application-default login``;
* in GitHub Actions, with the short-lived Workload Identity Federation
  credentials file written by ``google-github-actions/auth``.

Only the read-only Sheets scope is ever requested. Columns are mapped by the
machine names in the sheet's header row, never by position, so inserting or
reordering columns does not shift data.
"""

from __future__ import annotations

from dataclasses import dataclass, field
from datetime import datetime, timezone
from typing import Any, Callable, Sequence
from urllib.parse import quote

from .errors import PipelineError

SHEETS_READONLY_SCOPE = "https://www.googleapis.com/auth/spreadsheets.readonly"
SHEETS_API_BASE = "https://sheets.googleapis.com/v4/spreadsheets"
REQUEST_TIMEOUT_SECONDS = 30


@dataclass(frozen=True)
class RangeTable:
    """One named range, parsed into records keyed by header machine name."""

    name: str
    resolved_range: str
    columns: list[str]
    rows: list[dict[str, Any]]


@dataclass(frozen=True)
class SheetExtract:
    """Everything read from the sheet in one run, plus provenance."""

    spreadsheet_id: str
    read_at: str
    tables: list[RangeTable]
    warnings: list[str] = field(default_factory=list)


def authorized_session(quota_project_id: str | None = None):
    """Return a requests session authorized with read-only Sheets credentials.

    Args:
        quota_project_id: Google Cloud project to bill API quota to. Needed
            locally when using personal ``gcloud`` credentials; not needed for
            the service account in GitHub Actions.
    """
    # Imported lazily so unit tests and `--help` work without google-auth.
    import google.auth
    from google.auth.transport.requests import AuthorizedSession

    from google.auth.exceptions import DefaultCredentialsError

    try:
        credentials, _project = google.auth.default(
            scopes=[SHEETS_READONLY_SCOPE],
            quota_project_id=quota_project_id or None,
        )
    except DefaultCredentialsError as exc:
        raise PipelineError(
            "No Google credentials found. Locally, run `gcloud auth "
            "application-default login` with the spreadsheets.readonly scope "
            "(see README). In Actions, check the google-github-actions/auth step."
        ) from exc
    return AuthorizedSession(credentials)


def _raise_for_google_error(response, what: str) -> None:
    if response.status_code < 400:
        return
    try:
        message = response.json().get("error", {}).get("message", "")
    except ValueError:
        message = response.text[:500]
    hint = ""
    if response.status_code == 403:
        hint = (
            " Check that the sheet is shared (Viewer) with the identity running"
            " this pipeline, that the Sheets API is enabled, and, for local"
            " runs, that a quota project is set."
        )
    raise PipelineError(
        f"Google Sheets API error while {what} (HTTP {response.status_code}): "
        f"{message}.{hint}"
    )


def describe_spreadsheet(session, spreadsheet_id: str) -> dict[str, Any]:
    """Return the sheet title, tab names and named ranges (no cell values).

    Useful for discovering which named ranges exist before configuring a run.
    """
    url = f"{SHEETS_API_BASE}/{quote(spreadsheet_id, safe='')}"
    response = session.get(
        url,
        params={"fields": "properties.title,sheets.properties.title,namedRanges.name"},
        timeout=REQUEST_TIMEOUT_SECONDS,
    )
    _raise_for_google_error(response, "describing the spreadsheet")
    body = response.json()
    return {
        "title": body.get("properties", {}).get("title"),
        "tabs": [s["properties"]["title"] for s in body.get("sheets", [])],
        "namedRanges": sorted(n["name"] for n in body.get("namedRanges", [])),
    }


def fetch_ranges(
    session, spreadsheet_id: str, ranges: Sequence[str]
) -> list[dict[str, Any]]:
    """Fetch raw cell values for the requested ranges in one batch call.

    Returns the API's ``valueRanges`` list, in the same order as ``ranges``.
    """
    if not ranges:
        raise PipelineError("No ranges configured. Set DIGITAL_FLUENCY_RANGES.")
    url = f"{SHEETS_API_BASE}/{quote(spreadsheet_id, safe='')}/values:batchGet"
    response = session.get(
        url,
        params=[("ranges", r) for r in ranges]
        + [
            ("majorDimension", "ROWS"),
            ("valueRenderOption", "UNFORMATTED_VALUE"),
            ("dateTimeRenderOption", "FORMATTED_STRING"),
        ],
        timeout=REQUEST_TIMEOUT_SECONDS,
    )
    _raise_for_google_error(response, f"reading ranges {list(ranges)}")
    value_ranges = response.json().get("valueRanges", [])
    if len(value_ranges) != len(ranges):
        raise PipelineError(
            f"Expected {len(ranges)} ranges from the API, got {len(value_ranges)}."
        )
    return value_ranges


def _is_blank(value: Any) -> bool:
    return value is None or (isinstance(value, str) and value.strip() == "")


def parse_table(
    name: str,
    resolved_range: str,
    values: list[list[Any]],
    header_row: int,
) -> RangeTable:
    """Turn a range's raw rows into records keyed by header machine name.

    Args:
        name: The range name as configured (named range or A1 notation).
        resolved_range: The A1 range the API resolved it to.
        values: Raw rows from the API (ragged; trailing blanks are omitted).
        header_row: 1-based row *within the range* that holds machine names.
            Rows above it (e.g., human-readable labels) are ignored.

    Columns with a blank header are ignored, so spacer columns are harmless.
    Fully blank data rows are skipped. Duplicate headers are an error.
    """
    if header_row < 1:
        raise PipelineError(f"Header row must be 1 or greater, got {header_row}.")
    if len(values) < header_row:
        raise PipelineError(
            f"Range '{name}' ({resolved_range}) has {len(values)} row(s); "
            f"expected a header in row {header_row} of the range."
        )

    header_cells = values[header_row - 1]
    columns: list[tuple[int, str]] = []
    seen: dict[str, int] = {}
    duplicates: set[str] = set()
    for index, cell in enumerate(header_cells):
        if _is_blank(cell):
            continue
        machine_name = str(cell).strip()
        if machine_name in seen:
            duplicates.add(machine_name)
        seen[machine_name] = index
        columns.append((index, machine_name))

    if duplicates:
        raise PipelineError(
            f"Range '{name}' has duplicate header(s): {sorted(duplicates)}."
        )
    if not columns:
        raise PipelineError(
            f"Range '{name}' has no header names in row {header_row} of the range."
        )

    rows: list[dict[str, Any]] = []
    for raw in values[header_row:]:
        record = {
            machine_name: (raw[index] if index < len(raw) else None)
            for index, machine_name in columns
        }
        if all(_is_blank(v) for v in record.values()):
            continue
        rows.append(record)

    return RangeTable(
        name=name,
        resolved_range=resolved_range,
        columns=[machine_name for _, machine_name in columns],
        rows=rows,
    )


def parse_range_spec(spec: str, default_header_row: int) -> tuple[str, int]:
    """Split ``"range@N"`` into ``("range", N)``; no suffix uses the default.

    ``@`` can't appear in named ranges or A1 notation, so it is a safe
    separator. Example: ``'State Data 2026'!A:AL@2`` reads machine names from
    row 2 of that range; ``'Reference - Tiers'!A:C@1`` from row 1.
    """
    range_name, sep, row = spec.rpartition("@")
    if not sep:
        return spec.strip(), default_header_row
    try:
        return range_name.strip(), int(row)
    except ValueError as exc:
        raise PipelineError(f"Bad header row in range spec '{spec}'.") from exc


def read_sheet(
    spreadsheet_id: str,
    ranges: Sequence[str],
    header_row: int = 2,
    quota_project_id: str | None = None,
    session_factory: Callable[[str | None], Any] = authorized_session,
    now: Callable[[], datetime] = lambda: datetime.now(timezone.utc),
) -> SheetExtract:
    """Read and parse every configured range.

    Each entry in ``ranges`` is a named range or A1 range, optionally suffixed
    with ``@N`` to override ``header_row`` for that range. Fails with :class:`PipelineError` if any range is missing, empty, or has
    duplicate headers. No partial result is returned.
    """
    if not spreadsheet_id:
        raise PipelineError("No spreadsheet configured. Set DIGITAL_FLUENCY_SPREADSHEET_ID.")
    session = session_factory(quota_project_id)
    read_at = now().isoformat(timespec="seconds").replace("+00:00", "Z")
    specs = [parse_range_spec(spec, header_row) for spec in ranges]
    value_ranges = fetch_ranges(session, spreadsheet_id, [name for name, _ in specs])
    tables = [
        parse_table(
            name=name,
            resolved_range=vr.get("range", name),
            values=vr.get("values", []),
            header_row=row,
        )
        for (name, row), vr in zip(specs, value_ranges)
    ]
    warnings = [
        f"Range '{t.name}' has headers but no data rows." for t in tables if not t.rows
    ]
    return SheetExtract(
        spreadsheet_id=spreadsheet_id,
        read_at=read_at,
        tables=tables,
        warnings=warnings,
    )
