# Implementation Plan: Digital Fluency Data Pipeline — Auth Wiring POC

**Branch**: `claude/quirky-wright-7lktbz` | **Date**: 2026-11-09 | **Spec**: [spec.md](./spec.md)

## Summary

Prove the authenticated path end to end before any scoring or site work:
GitHub Actions reads the **real** Google Sheet with keyless, read-only
credentials, runs **placeholder** Python, validates the result against a
repo-owned JSON Schema, and saves it to **one Contentful entry as a draft**.
This covers Workstream 1 (Sheet read) and Workstreams 3/4 (envelope + write
credential) from the handoff. David replaces the placeholder transform with
the real scoring later (Workstream 2). Site changes (Workstream 6) and the
sheet trigger (Workstream 5) are out of scope.

## Technical Context

- **Language**: Python 3.12.10 (pinned in `pipelines/digital-fluency/.python-version`).
- **Dependencies**: `google-auth`, `requests`, `jsonschema`, plus transitive
  deps, all hash-locked in `requirements.txt`. Every version is at least 14
  days old.
- **Testing**: stdlib `unittest`, synthetic data, fake HTTP sessions. No
  credentials in CI.
- **Runtime**: `workflow_dispatch` on `ubuntu-24.04`; actions pinned by SHA.
- **Affected apps/packages**: none. New `pipelines/digital-fluency/` (outside Yarn
  workspaces and Turbo) and two workflows.
- **Brands/locales/preview/draft**: no site change. The pipeline writes a
  Contentful draft only.
- **Cache/revalidation**: none now. When the site consumes the entry, fetch it
  by entry ID (spec FR-026).
- **SEO**: none.

## Constitution Check

| Gate                                    | Status                                                                                                                                                                                                 |
| --------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Availability first                      | Pass. Not on any request path. Failures leave Contentful's published state and the site untouched.                                                                                                     |
| SSR first / client boundaries           | N/A. No UI.                                                                                                                                                                                            |
| Preview/draft isolation                 | Pass. Draft-only writes; publishing stays human.                                                                                                                                                       |
| Security                                | Pass. Keyless Google auth; read-only scope; repo-restricted trust; Contentful token scoped to one content type and one environment secret, exposed only to the write step; deploy workflows untouched. |
| Privacy                                 | Pass. Aggregates only. The placeholder copies no cell values; tests are synthetic.                                                                                                                     |
| Contentful MCP read-only / human writes | Pass. Contentful MCP isn't available in this session. The content type is a **proposal** file; a human creates the type, role and bot user, then we re-read.                                           |
| Shared-package-first / MUI / WCAG       | N/A.                                                                                                                                                                                                   |

## Key Decisions (POC only)

1. **Location (OD-5, proposed):** top-level `pipelines/digital-fluency/`, with its own CI
   workflow and outside Yarn/Turbo. Revisit before launch.
2. **ADC, not a raw access token:** the auth action writes an external-account
   credentials file, and `google.auth.default(scopes=[spreadsheets.readonly])`
   uses it. The same code runs locally with `gcloud` user ADC.
3. **Split build and write steps:** the Google credential and the Contentful
   token are never in the same step, and the write step re-validates the file.
4. **Write guards:** the writer refuses entries of another content type and
   archived entries, uses optimistic versioning, and never publishes.
5. **Placeholder payload has no cell values:** it holds column names, row
   counts and fingerprints. That proves the wiring without moving narrative
   text into Contentful before OD-6 is decided.
6. **Per-range header rows (`range@N`):** the real sheet has machine names in
   row 2 of `State Data 2026` and in row 1 of `Reference - Tiers`.

## Project Structure

```text
.github/workflows/digital-fluency-data-pipeline.yml   # on-demand pipeline
.github/workflows/digital-fluency-pipeline-ci.yml     # unit tests on PRs
pipelines/digital-fluency/
├── README.md                              # setup: GCP, Contentful, GitHub
├── requirements.txt, .python-version
├── schema/digital-fluency-payload.schema.json
├── contentful/digital-fluency-envelope.content-type.json   # proposal, human applies
├── digital_fluency/{sheets,transform,validate,contentful,cli}.py
└── tests/
```

## Human Setup Required (blocks a live run)

- GCP: pool, provider, service account, binding (README §1); share the sheet
  as Viewer with the service account.
- Contentful: content type, custom role (no publish), bot user, token with an
  expiry (README §2).
- GitHub: `digital-fluency-data-pipeline` environment with its variables and secret;
  merge the workflow to `main` so it can be dispatched (README §3).
