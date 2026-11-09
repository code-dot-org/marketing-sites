# Tasks: Digital Fluency Data Pipeline — Auth Wiring POC

Scope: spec US1 (read the sheet) and US3 (validated draft in Contentful), with
placeholder Python standing in for US2.

## Phase 1: Setup

- [x] T001 Create `pipelines/digital-fluency/` with pinned Python version and hash-locked `requirements.txt`
- [x] T002 [P] Add `.github/workflows/digital-fluency-pipeline-ci.yml` running unit tests on PRs

## Phase 2: US1 — Read the sheet (P1)

- [x] T003 [US1] ADC-based read-only session and named/A1 range batch read in `digital_fluency/sheets.py`
- [x] T004 [US1] Header-name mapping, blank/duplicate handling, per-range `@N` header rows
- [x] T005 [US1] `describe` command listing tabs and named ranges
- [x] T006 [P] [US1] Tests: column insertion invariance, duplicates, missing header, API errors
- [x] T007 [US1] Workflow auth step via `google-github-actions/auth` (WIF, SHA-pinned)
- [ ] T008 [US1] **Human:** GCP pool/provider/SA/binding; share sheet as Viewer (README §1)
- [ ] T009 [US1] **Human:** create `digital-fluency-data-pipeline` environment and Google vars; merge workflow; dispatch with `write_to_contentful=false`

## Phase 3: Placeholder transform + contract

- [x] T010 Placeholder `transform.build_payload` (no cell values; fingerprints)
- [x] T011 [P] `schema/digital-fluency-payload.schema.json` (strict) and `validate.py` with size cap
- [x] T012 [P] Tests for payload, schema rejections and envelope checks

## Phase 4: US3 — Draft in Contentful (P3)

- [x] T013 [US3] Draft-only writer with content-type guard, versioning and 429 retry
- [x] T014 [US3] Proposed envelope content type JSON for human review
- [x] T015 [P] [US3] Tests: create, update, wrong type, archived, auth hint, conflict, never publishes
- [ ] T016 [US3] **Human:** create content type (sandbox first), custom role without publish, bot user, and a token with an expiry (README §2); re-read to confirm
- [ ] T017 [US3] **Human:** add Contentful vars and secret; dispatch with `write_to_contentful=true`; confirm the draft in Contentful

## Phase 5: Follow-ups (not in POC)

- [ ] T018 Ask Advocacy to add named ranges `digital_fluency_state_data`, `digital_fluency_tiers`
- [ ] T019 Tighten WIF to `repository_id` + workflow on `main`; restrict environment to `main`
- [ ] T020 CODEOWNERS for `pipelines/digital-fluency/schema/` and `digital-fluency-*.yml`
- [ ] T021 Replace placeholder with real scoring + parity check (US2, David)
- [ ] T022 Decide sheet trigger (OD-3) and publish step (OD-1)
