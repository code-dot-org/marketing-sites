import unittest

from digital_fluency import cli, contentful, transform
from digital_fluency.errors import PipelineError
from tests.fakes import FakeResponse, FakeSession
from tests.test_build import synthetic_extract

TARGET = contentful.ContentfulTarget(
    space_id="space1",
    environment_id="sandbox",
    entry_id="digitalFluencyData",
    content_type_id="stateOfDigitalFluencyData",
)


def envelope():
    extract = synthetic_extract()
    return cli.build_envelope(extract, transform.build_payload(extract))


def entry_sys(version=3, content_type="stateOfDigitalFluencyData", **extra):
    return {
        "sys": {
            "version": version,
            "contentType": {"sys": {"id": content_type}},
            **extra,
        }
    }


class WriteDraftTest(unittest.TestCase):
    def write(self, session):
        return contentful.write_draft(
            TARGET, envelope(), token="t0ken", session=session, sleep=lambda _s: None
        )

    def test_updates_existing_entry_with_version_and_never_publishes(self):
        session = FakeSession(
            [FakeResponse(200, entry_sys(version=3)), FakeResponse(200, entry_sys(version=4))]
        )
        result = self.write(session)
        self.assertEqual(result.action, "updated")
        put = session.calls[1]
        self.assertEqual(put["method"], "PUT")
        self.assertEqual(put["headers"]["X-Contentful-Version"], "3")
        self.assertEqual(
            put["json"]["fields"]["sourceSpreadsheetId"], {"en-US": "sheet-123"}
        )
        for call in session.calls:
            self.assertNotIn("/published", call["url"])
        self.assertEqual(len(session.calls), 2)

    def test_creates_entry_with_content_type_when_missing(self):
        session = FakeSession([FakeResponse(404), FakeResponse(201, entry_sys(version=1))])
        result = self.write(session)
        self.assertEqual(result.action, "created")
        self.assertEqual(
            session.calls[1]["headers"]["X-Contentful-Content-Type"],
            "stateOfDigitalFluencyData",
        )

    def test_refuses_entry_of_another_content_type(self):
        session = FakeSession([FakeResponse(200, entry_sys(content_type="experienceLayout"))])
        with self.assertRaisesRegex(PipelineError, "Refusing to write"):
            self.write(session)
        self.assertEqual(len(session.calls), 1)

    def test_refuses_archived_entry(self):
        session = FakeSession([FakeResponse(200, entry_sys(archivedVersion=2))])
        with self.assertRaisesRegex(PipelineError, "archived"):
            self.write(session)

    def test_auth_failure_has_hint_and_hides_token(self):
        session = FakeSession([FakeResponse(403, {"message": "Forbidden"})])
        with self.assertRaises(PipelineError) as ctx:
            self.write(session)
        self.assertIn("role", str(ctx.exception))
        self.assertNotIn("t0ken", str(ctx.exception))

    def test_retries_on_rate_limit(self):
        session = FakeSession(
            [
                FakeResponse(429, headers={"X-Contentful-RateLimit-Reset": "1"}),
                FakeResponse(200, entry_sys()),
                FakeResponse(200, entry_sys(version=4)),
            ]
        )
        self.assertEqual(self.write(session).action, "updated")

    def test_version_conflict_is_reported(self):
        session = FakeSession([FakeResponse(200, entry_sys()), FakeResponse(409)])
        with self.assertRaisesRegex(PipelineError, "conflict"):
            self.write(session)

    def test_requires_token_and_target(self):
        with self.assertRaisesRegex(PipelineError, "TOKEN"):
            contentful.write_draft(TARGET, envelope(), token="", session=FakeSession([]))
        blank = contentful.ContentfulTarget("", "env", "id", "type")
        with self.assertRaisesRegex(PipelineError, "SPACE_ID"):
            contentful.write_draft(blank, envelope(), token="x", session=FakeSession([]))


if __name__ == "__main__":
    unittest.main()
