"""Write the validated envelope into one Contentful entry as a draft.

Safety properties:

* Only the configured entry ID is touched, and only if it already belongs to
  the configured envelope content type (or does not exist yet, in which case
  it is created with that type). A mistyped entry ID can't overwrite a page.
* The entry is never published. Publishing stays a human step in Contentful.
* The token comes from the environment and is never logged.
"""

from __future__ import annotations

import time
from dataclasses import dataclass
from typing import Any, Callable
from urllib.parse import quote

from .errors import PipelineError

CMA_BASE = "https://api.contentful.com"
CMA_CONTENT_TYPE = "application/vnd.contentful.management.v1+json"
REQUEST_TIMEOUT_SECONDS = 30
MAX_RATE_LIMIT_RETRIES = 3
MAX_RATE_LIMIT_WAIT_SECONDS = 10

# Field IDs of the proposed envelope content type
# (see contentful/sodf-envelope.content-type.json).
ENVELOPE_FIELDS = (
    "title",
    "payload",
    "schemaVersion",
    "dataAsOf",
    "sourceSpreadsheetId",
    "sourceRevision",
    "warnings",
    "runUrl",
)


@dataclass(frozen=True)
class ContentfulTarget:
    space_id: str
    environment_id: str
    entry_id: str
    content_type_id: str
    locale: str = "en-US"

    def entry_url(self) -> str:
        return (
            f"{CMA_BASE}/spaces/{quote(self.space_id, safe='')}"
            f"/environments/{quote(self.environment_id, safe='')}"
            f"/entries/{quote(self.entry_id, safe='')}"
        )

    def web_url(self) -> str:
        return (
            f"https://app.contentful.com/spaces/{self.space_id}"
            f"/environments/{self.environment_id}/entries/{self.entry_id}"
        )


@dataclass(frozen=True)
class WriteResult:
    action: str  # "created" or "updated"
    version: int
    published_version: int | None
    web_url: str


def build_fields(envelope: dict[str, Any], locale: str) -> dict[str, Any]:
    """Map an envelope file to localized Contentful fields."""
    meta = envelope["meta"]
    values = {
        "title": meta["title"],
        "payload": envelope["payload"],
        "schemaVersion": meta["schemaVersion"],
        "dataAsOf": meta["dataAsOf"],
        "sourceSpreadsheetId": meta["sourceSpreadsheetId"],
        "sourceRevision": meta["sourceRevision"],
        "warnings": meta.get("warnings") or [],
        "runUrl": meta.get("runUrl") or None,
    }
    return {key: {locale: value} for key, value in values.items() if value is not None}


def _request(session, method: str, url: str, sleep: Callable[[float], None], **kwargs):
    for attempt in range(MAX_RATE_LIMIT_RETRIES + 1):
        response = session.request(method, url, timeout=REQUEST_TIMEOUT_SECONDS, **kwargs)
        if response.status_code != 429 or attempt == MAX_RATE_LIMIT_RETRIES:
            return response
        reset = response.headers.get("X-Contentful-RateLimit-Reset", "1")
        try:
            wait = float(reset)
        except ValueError:
            wait = 1.0
        sleep(min(max(wait, 1.0), MAX_RATE_LIMIT_WAIT_SECONDS))
    return response  # pragma: no cover


def _error(response, what: str) -> PipelineError:
    try:
        body = response.json()
        message = body.get("message") or body.get("sys", {}).get("id", "")
    except ValueError:
        message = response.text[:500]
    hint = ""
    if response.status_code in (401, 403):
        hint = (
            " Check that CONTENTFUL_MANAGEMENT_TOKEN is set and that its role can"
            " create/edit entries of the envelope content type in this environment."
        )
    return PipelineError(
        f"Contentful error while {what} (HTTP {response.status_code}): {message}.{hint}"
    )


def write_draft(
    target: ContentfulTarget,
    envelope: dict[str, Any],
    token: str,
    session=None,
    sleep: Callable[[float], None] = time.sleep,
) -> WriteResult:
    """Create or update the envelope entry's draft. Never publishes."""
    if not token:
        raise PipelineError("CONTENTFUL_MANAGEMENT_TOKEN is not set.")
    for name, value in (
        ("CONTENTFUL_SPACE_ID", target.space_id),
        ("CONTENTFUL_ENVIRONMENT_ID", target.environment_id),
        ("CONTENTFUL_ENTRY_ID", target.entry_id),
        ("CONTENTFUL_CONTENT_TYPE_ID", target.content_type_id),
    ):
        if not value:
            raise PipelineError(f"{name} is not set.")

    if session is None:
        import requests

        session = requests.Session()

    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": CMA_CONTENT_TYPE,
    }
    url = target.entry_url()
    body = {"fields": build_fields(envelope, target.locale)}

    existing = _request(session, "GET", url, sleep, headers=headers)
    if existing.status_code == 404:
        response = _request(
            session,
            "PUT",
            url,
            sleep,
            headers={**headers, "X-Contentful-Content-Type": target.content_type_id},
            json=body,
        )
        if response.status_code not in (200, 201):
            raise _error(response, "creating the envelope entry")
        action = "created"
    elif existing.status_code == 200:
        sys = existing.json().get("sys", {})
        actual_type = sys.get("contentType", {}).get("sys", {}).get("id")
        if actual_type != target.content_type_id:
            raise PipelineError(
                f"Refusing to write: entry '{target.entry_id}' has content type "
                f"'{actual_type}', expected '{target.content_type_id}'."
            )
        if sys.get("archivedVersion"):
            raise PipelineError(
                f"Refusing to write: entry '{target.entry_id}' is archived."
            )
        response = _request(
            session,
            "PUT",
            url,
            sleep,
            headers={**headers, "X-Contentful-Version": str(sys["version"])},
            json=body,
        )
        if response.status_code == 409:
            raise PipelineError(
                "Contentful version conflict: the entry changed while this run was"
                " writing. Re-run the pipeline."
            )
        if response.status_code != 200:
            raise _error(response, "updating the envelope entry")
        action = "updated"
    else:
        raise _error(existing, "reading the envelope entry")

    sys = response.json().get("sys", {})
    return WriteResult(
        action=action,
        version=sys.get("version", 0),
        published_version=sys.get("publishedVersion"),
        web_url=target.web_url(),
    )
