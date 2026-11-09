"""Test doubles for HTTP sessions. All data in tests is synthetic."""

from __future__ import annotations

from typing import Any


class FakeResponse:
    def __init__(self, status_code: int, body: Any = None, headers: dict | None = None):
        self.status_code = status_code
        self._body = body if body is not None else {}
        self.headers = headers or {}
        self.text = str(self._body)

    def json(self) -> Any:
        return self._body


class FakeSession:
    """Returns queued responses in order and records every call."""

    def __init__(self, responses: list[FakeResponse]):
        self._responses = list(responses)
        self.calls: list[dict[str, Any]] = []

    def _next(self, method: str, url: str, **kwargs) -> FakeResponse:
        self.calls.append({"method": method, "url": url, **kwargs})
        if not self._responses:
            raise AssertionError(f"Unexpected {method} {url}")
        return self._responses.pop(0)

    def get(self, url: str, **kwargs) -> FakeResponse:
        return self._next("GET", url, **kwargs)

    def request(self, method: str, url: str, **kwargs) -> FakeResponse:
        return self._next(method, url, **kwargs)
