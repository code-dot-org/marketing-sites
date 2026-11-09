# Feature Specification: State of Digital Fluency Data Pipeline

**Feature Branch**: `013-sodf-data-pipeline` (developed on `claude/quirky-wright-7lktbz`)
**Created**: 2026-11-09
**Status**: Draft
**Input**: Handoff "State of Digital Fluency data pipeline (marketing-sites)",
prepared 2026-11-09 by Darin Webb (Platform & Infrastructure). Items the handoff
marks **Decided** are requirements here. Items it marks **Not decided** are
listed under [Open Decisions](#open-decisions) with options, and are not chosen
by this spec. Workstream 1 (reading the Google Sheet) is the first priority so
David Burkett can begin experimenting immediately.

## Overview

The State of Digital Fluency is a public report that scores and ranks all 50
states and DC on digital sciences education. The Advocacy team maintains the
data in a Google Sheet ("CodeAI Digital Sciences — State Data 2026"). Today the
report is an internal prototype; this feature moves the data path onto the
marketing site.

The governing principle: **the marketing site does not transform or validate
raw, unchecked input.** A separate, reviewed pipeline step reads the sheet,
processes and scores it, validates the result against a repo-owned contract,
and hands the site a verified artifact through Contentful, the same way other
content reaches the site.

```
Advocacy team edits Google Sheet
  → Sheet menu action: "Preview" (or Preview/Publish)
  → Pipeline run in marketing-sites (on-demand workflow)
      1. Authenticate to Google with short-lived, read-only, keyless credentials
      2. Read the sheet's named ranges
      3. Process + score (the prototype's existing Python methodology)
      4. Validate against the repo's report data contract
      5. Write the validated data into a Contentful envelope entry (draft)
  → Preview hosts render the draft entry (existing preview/draft path)
  → Someone publishes the entry in Contentful (tentative — see Open Decisions)
  → Existing Contentful publish webhook → site revalidation for that entry
  → Public pages re-render from the published entry
```

This spec covers the whole flow so later workstreams fit, but the stories are
ordered so each delivers value on its own, starting with reading the sheet.

## User Scenarios & Testing _(mandatory)_

### User Story 1 - Pipeline reads the sheet with read-only, keyless access (Priority: P1)

An engineer (initially David Burkett) runs the sheet reader locally with their
own Google login, and the same code runs unchanged in the repo's automation
using a dedicated read-only identity. The reader pulls the sheet's named
ranges and returns rows keyed by the machine column names in row 2, so
inserting or reordering columns in the sheet does not shift data.

**Why this priority**: Every later step depends on reading the sheet. David
needs this now to start experimenting. It is also the first place untrusted
data enters, so its access model has to be right from the start.

**Independent Test**: With the sheet shared to the reader identity, trigger the
pipeline from a branch and confirm it outputs the named ranges as structured
rows keyed by header names; separately run the same reader locally with a
personal login and get identical output. Inserting a blank column into a copy
of the sheet does not change the parsed output.

**Acceptance Scenarios**:

1. **Given** the reader identity has Viewer access to only this sheet,
   **When** the pipeline runs in automation, **Then** it obtains a
   short-lived, read-only credential with no stored long-lived key and reads
   the configured named ranges.
2. **Given** an engineer has signed in locally with a read-only Google scope,
   **When** they run the reader, **Then** it uses their local credentials with
   no code or configuration changes beyond the sheet identifier.
3. **Given** a column is inserted or reordered in a named range, **When** the
   reader runs, **Then** values are still mapped by their row-2 machine names.
4. **Given** a required named range or required header is missing or
   duplicated, **When** the reader runs, **Then** it fails with a message that
   names the missing/duplicated range or header and writes nothing downstream.
5. **Given** the pipeline runs from a repository other than
   `code-dot-org/marketing-sites`, **When** it requests Google credentials,
   **Then** the request is refused.

---

### User Story 2 - Pipeline scores the data and matches the prototype (Priority: P2)

The pipeline runs the prototype's existing processing and scoring
(`build_json_from_xlsx.py` methodology) against the sheet data, adapted only
at the input layer, and produces the report data. A parity check compares
every state's output with the prototype's output on the same data.

**Why this priority**: The site cannot publish scores until the methodology is
proven to match what the Advocacy team signed off on. Parity failure is a kill
criterion for building pages.

**Independent Test**: Run the prototype script on an export of the sheet and
the new pipeline on the live sheet at the same revision; compare per-state
output. Run the Advocacy-team sample states in CI and confirm expected scores.

**Acceptance Scenarios**:

1. **Given** the same sheet data, **When** both the prototype and the pipeline
   run, **Then** policy, access, participation and leadership points match
   exactly for all 51 jurisdictions, and every other difference is listed in a
   documented, intentional-differences record.
2. **Given** the Advocacy team's sample states with expected scores are
   checked into the repo, **When** CI runs, **Then** the pipeline reproduces
   every expected score or CI fails.
3. **Given** the scoring code and its dependencies, **When** the pipeline
   runs in automation, **Then** the language runtime and every dependency are
   pinned to exact versions.

---

### User Story 3 - Validated data lands in Contentful as a draft (Priority: P3)

After scoring, the pipeline validates the result against the repo's report
data contract and writes it into a single Contentful envelope entry as a
**draft**, along with run metadata (schema version, data-as-of date, source
sheet ID and revision, warnings, link to the run).

**Why this priority**: This is the handoff from the pipeline to the site. It
depends on US1 and US2 and on a narrowly scoped Contentful write credential
(Workstream 4), which is not yet decided.

**Independent Test**: Run the pipeline against a non-production Contentful
environment and confirm the envelope entry's draft is updated, its published
version is unchanged, and invalid data never reaches Contentful.

**Acceptance Scenarios**:

1. **Given** scored data that passes contract validation, **When** the
   pipeline writes to Contentful, **Then** the envelope entry's draft holds the
   new data and metadata, and the published version is unchanged.
2. **Given** scored data that fails validation, **When** the pipeline runs,
   **Then** nothing is written to Contentful and the run reports each
   violation.
3. **Given** the pipeline's Contentful credential, **When** it attempts to
   publish the entry or edit any other content type, **Then** Contentful
   refuses (target state; feasibility tracked in Open Decisions).

---

### User Story 4 - Advocacy team triggers a preview from the sheet (Priority: P4)

An Advocacy team member chooses "Preview" (or Preview/Publish) from a menu in
the sheet, which starts the pipeline. When it finishes, they can see the new
data on the preview site.

**Why this priority**: Gives the data owners a self-serve loop, but it carries
a repo-specific risk (the trigger could reach deploy workflows) that must be
resolved first.

**Independent Test**: From a copy of the sheet, use the menu to start the
pipeline; confirm only the pipeline workflow can be started by that path and
that a deploy workflow cannot be started by it without review.

**Acceptance Scenarios**:

1. **Given** a permitted Advocacy team member, **When** they choose Preview
   in the sheet menu, **Then** exactly one run of the pipeline workflow starts
   and the member sees confirmation with a link to the run.
2. **Given** the credential or path used by the sheet trigger, **When**
   someone tries to start `marketing-app-deploy.yml` or
   `marketing-app-deploy-to-environment.yml` with it, **Then** the deploy does
   not proceed without environment review (or the path cannot reach it at
   all).
3. **Given** the sheet's menu script, **When** it changes, **Then** the
   change comes from source reviewed in this repo and is deployed to the sheet
   by engineering.

---

### User Story 5 - Report pages read the envelope safely (Priority: P5)

Public visitors see the national overview, rankings, 51 state pages,
printable reports and methodology, rendered on the server from the published
envelope entry. Reviewers on preview hosts see the draft. The site validates
the envelope's data again on read and never renders partial or invalid data.

**Why this priority**: The visible outcome, but it depends on all prior
stories and is a larger build (pages plus five shared components: Stat, Chart,
Scale, Map, Table). It will likely be split into its own spec.

**Independent Test**: With a valid published envelope, public routes render
from cache with SWR/SIE intact; with a draft change, only preview hosts show
it; with a corrupted envelope, the site keeps serving the last good pages and
logs an alert.

**Acceptance Scenarios**:

1. **Given** a draft envelope update, **When** a reviewer opens a preview
   host, **Then** they see the draft data, and public hosts still show the
   published data.
2. **Given** someone publishes the envelope in Contentful, **When** the
   existing publish webhook fires, **Then** the cached report data is
   invalidated and public pages show the new data within the public cache
   window.
3. **Given** the envelope's data fails contract validation on read, **When**
   a page renders, **Then** no partial data is shown, the last good cached
   pages keep serving, and an alert is logged.
4. **Given** any text that came from the sheet, **When** it renders, **Then**
   it renders as plain text, never as HTML.

### Edge Cases

- **Sheet structure drift**: a named range is renamed/deleted, a header is
  renamed, a header is duplicated, or extra rows appear. The reader fails
  loudly; nothing is written downstream.
- **Blank inputs**: how blanks score ("not reported" vs. zero) is an Advocacy
  methodology decision (Open Decisions). Until decided, the pipeline must
  reproduce prototype behavior so parity holds.
- **Jurisdiction coverage**: fewer or more than 51 jurisdictions, or unknown
  codes, fail validation.
- **Concurrent runs**: two Preview clicks in quick succession must not
  interleave writes; the later run wins or the earlier is cancelled. Concurrent
  multi-editor sheet editing is out of scope.
- **Google unavailable / credential refused**: the run fails; the existing
  Contentful entry and public pages are untouched.
- **Contentful unavailable mid-write**: the run fails without publishing; the
  published entry is untouched; a re-run is safe.
- **Envelope too large**: payload exceeds Contentful JSON field or entry
  limits (estimated ~120 KB) — the run fails before writing. Limits must be
  confirmed during planning.
- **Manual edits in Contentful**: the envelope drifts from the sheet. Editing
  rights must be locked down; the next run overwrites the draft.
- **Tenants and locales**: the report is expected on the Code.org (CodeAI)
  brand only, in `en-US`. Other brands are unaffected. (Assumption; confirm in
  planning.)
- **Analytics / third-party failure**: not applicable to the pipeline; site
  pages follow existing analytics behavior.
- **Availability**: a broken pipeline or bad data never affects public pages;
  the site keeps serving the last published, validated data.
- **Preview/draft/cache boundaries**: drafts render only on preview hosts
  outside the public cache; public routes keep SWR/SIE.
- **Personal data**: the data is state-level aggregates only. No personal
  data, Student Records or school-directed data. Fixtures, tests and Storybook
  use synthetic data regardless.
- **Rendering model**: all data fetching, validation and composition stay on
  the server. Only unavoidable browser-only interaction (e.g., map hover) may
  use a minimal client boundary, justified in the page-level spec.

## Requirements _(mandatory)_

### Functional Requirements

**Workstream 1 — Reading the sheet (P1)**

- **FR-001**: The pipeline MUST authenticate to Google using short-lived,
  federated credentials issued to automation in
  `code-dot-org/marketing-sites`, with no long-lived key stored in the repo or
  its secrets. A stored key is permitted only as a documented fallback if
  federation is blocked for a reason that cannot be fixed quickly.
- **FR-002**: The Google identity used by the pipeline MUST have no project
  roles and MUST have Viewer access to only the report sheet; the requested
  access scope MUST be read-only spreadsheets.
- **FR-003**: The federation provider (in the `marketing-sites-gdrive`
  Google Cloud project, Production folder) MUST accept only the `code-dot-org/marketing-sites`
  repository, matched by its immutable repository ID. The reader service
  account's binding MUST, before launch, be limited to the pipeline workflow
  file on `main`. The pipeline MAY also be gated behind a GitHub Environment
  limited to `main`. Branch runs stay allowed during experimentation. The
  provider stays repo-wide so other workflows can use it later with their own
  service accounts.
- **FR-004**: The reader MUST use the platform's default credential discovery
  so the same code runs locally (an engineer's own read-only login) and in
  automation (the service identity) without changes.
- **FR-005**: The reader MUST read named ranges only, not the whole
  spreadsheet, and MUST map columns by the row-2 machine names, never by
  position.
- **FR-006**: The reader MUST fail with an actionable message naming the
  range or header when a required named range or header is missing or
  duplicated, and MUST NOT pass partial data downstream.
- **FR-007**: The reader MUST record the source sheet ID and the revision or
  read timestamp it read, for inclusion in the envelope metadata.

**Workstream 2 — Processing and scoring (P2)**

- **FR-008**: The pipeline MUST run the prototype's existing processing and
  scoring logic, kept in Python and recognizable against
  `build_json_from_xlsx.py`; there MUST be no TypeScript port.
- **FR-009**: Only the input layer MAY change (sheet API instead of xlsx);
  methodology changes require Advocacy team confirmation (Open Decisions).
- **FR-010**: A parity check MUST compare per-state output of the prototype
  and the pipeline on the same data; policy, access, participation and
  leadership points MUST match exactly, and any other difference MUST be
  documented as intentional.
- **FR-011**: Advocacy-team sample states with expected scores MUST live in
  the repo and run in CI.
- **FR-012**: The Python runtime and all dependencies MUST be pinned to exact
  versions, with a minimal dependency set.

**Workstream 3 — Data contract and envelope (P3)**

- **FR-013**: A JSON Schema for the report data MUST be checked into the repo,
  following the `specs/003-gap-analysis-map/contracts/` pattern, and MUST be
  strict: enums for policy tiers, numeric ranges, `maxLength` on every string,
  no HTML, no free-form URLs, `additionalProperties: false`, and exactly the
  51 jurisdictions.
- **FR-014**: Changes to the schema MUST require engineering review via
  CODEOWNERS. (The repo has no CODEOWNERS file today; adding one scoped to the
  schema and pipeline paths is in scope.)
- **FR-015**: Data MUST be validated against the schema twice: in the
  pipeline before any Contentful write, and in the site on every read.
- **FR-016**: Contentful MUST hold the data as an envelope only: one content
  type, one entry, with fields for the JSON payload, schema version,
  data-as-of date, source sheet ID and revision, run warnings, and a link to
  the pipeline run. There MUST NOT be a detailed Contentful content model for
  the report data.
- **FR-017**: The envelope content type MUST be confirmed through Contentful
  MCP (read-only) and created only after a human approves the exact proposed
  definition; the result MUST be re-read via MCP to confirm.
- **FR-018**: Editing the envelope entry in the Contentful UI MUST be limited
  so the entry cannot drift from the sheet.

**Workstream 4 — Contentful write access (P3)**

- **FR-019**: The pipeline's Contentful credential MUST be as narrow as
  achievable: target is create/edit drafts of the envelope content type only,
  no publish, stored as a GitHub Environment secret available only to the
  pipeline on `main`. The mechanism is an Open Decision.
- **FR-020**: The pipeline MUST write only the draft; it MUST NOT publish
  unless the publish step is later decided otherwise.

**Workstream 5 — Sheet trigger (P4)**

- **FR-021**: The sheet MUST offer a menu with a preview (or preview/publish)
  action that starts the pipeline workflow in `marketing-sites`.
- **FR-022**: The trigger path MUST NOT allow starting the deploy workflows
  (`marketing-app-deploy.yml`, `marketing-app-deploy-to-environment.yml`)
  without environment review. If that cannot be shown, the relay option is
  required before launch (kill criterion).
- **FR-023**: The sheet's script source MUST live in this repo and be
  deployed to the sheet by engineering.
- **FR-024**: Pipeline runs MUST be serialized so overlapping triggers cannot
  interleave writes.

**Workstream 6 — Site (P5)**

- **FR-025**: The site MUST fetch the envelope on the server with the existing
  Contentful client, honoring draft mode (preview hosts see drafts; public
  hosts see published), following the activity-catalog fetch pattern.
- **FR-026**: The site's fetch MUST be tagged so the existing publish webhook
  and `/api/revalidate` clear it, with no new endpoint or token. (See
  Integration Points: the current route only clears by entry ID and by the
  `redirect` content type, so the fetch must be by entry ID or the route
  must learn the new content type.)
- **FR-027**: On validation failure, the site MUST NOT render partial data,
  MUST keep serving the last good cached pages, and MUST log an alert.
- **FR-028**: `apps/marketing` MUST NOT contain Google credentials, Sheets
  calls, sheet parsing or scoring.
- **FR-029**: All sheet-sourced text MUST render as plain text.

**Repo-standard requirements**

- **FR-030 (affected surfaces)**: New: pipeline code (Python, location an
  Open Decision), a new workflow under `.github/workflows/`, schema contract,
  sheet script source, CODEOWNERS. Later: `apps/marketing` data module and
  routes, `apps/marketing-storybook` for the five shared components. No change
  to `packages/*` is expected for Workstreams 1–4.
- **FR-031 (validation surfaces)**: Reader unit tests with synthetic fixtures
  (header mapping, column insertion, missing/duplicate ranges/headers); scoring
  sample-state tests and parity report; schema tests (valid/invalid
  fixtures); workflow dry run on a branch; site unit tests for validate-on-read
  and fallback; Storybook coverage for new components; `yarn release:dryrun`
  for substantial changes.
- **FR-032 (accessibility, localization, tenant, observability, privacy)**:
  Report UI meets WCAG AA and uses MUI; `en-US` on the Code.org brand
  (assumption); pipeline runs surface warnings and failures in the run
  summary; on-call ownership is an Open Decision; no personal data.
- **FR-033 (runtime flows)**: No change to middleware, redirects, or existing
  cache headers. Integrations: Google Sheets (pipeline only), Contentful
  Management (pipeline only), Contentful Delivery/Preview (site, existing),
  publish webhook → `/api/revalidate` (existing).
- **FR-034 (performance/cache/SEO/security)**: Preserve SWR/SIE for public
  routes; keep preview/draft off the public cache; report routes are not
  Experience pages and need explicit sitemap, canonical, metadata and indexing
  review in the page-level spec; publish-to-live time follows the existing
  15-minute public cache unless the Advocacy team needs faster (Open
  Decisions).
- **FR-035 (component layer)**: The five shared components (Stat, Chart,
  Scale, Map, Table) belong in the higher-level marketing layer and MUST use
  MUI; specified in the page-level spec.
- **FR-036 (SSR)**: Fetch, validation and composition are server-side. Any
  client boundary is limited to unavoidable interaction and justified in the
  page-level spec.
- **FR-037 (privacy)**: No personal data, Student Records or school-directed
  data; no new collection; the only external egress is the pipeline reading
  Google and writing Contentful, both CodeAI-controlled systems. Synthetic
  data in fixtures, tests and Storybook.
- **FR-038 (Contentful MCP)**: Nothing about the envelope content type has
  been confirmed via MCP yet; all Contentful shape statements here are
  proposals. Planning MUST confirm space/environment, JSON field limits,
  custom-role availability and webhook coverage via MCP or a human.
- **FR-039 (Contentful writes)**: Creating the content type, roles, or the
  bot user requires showing the exact change to a human, human approval or
  application, and an MCP re-read.
- **FR-040 (SEO)**: Workstreams 1–4 have no SEO impact. Workstream 6 adds
  non-Experience routes that are not covered by the runtime sitemap and need
  explicit review.

## Integration Points

### Systems and Contracts

- **Upstream Inputs**: Google Sheet named ranges (row-2 machine headers);
  Google federated identity; pipeline trigger inputs (from the sheet or a
  manual run); Contentful envelope entry (site side).
- **Downstream Effects**: Contentful envelope draft; existing publish webhook
  → `/api/revalidate` → cache tag clear; report routes (later).
- **Runtime Surfaces**: new workflow in `.github/workflows/`; pipeline
  Python package and tests; schema contract; sheet script source;
  `apps/marketing` data module (later); `apps/marketing-storybook` (later).
- **Tenant / Hostname Paths**: `http://code.marketing-sites.localhost:3001`,
  `http://preview-code.marketing-sites.localhost:3001`; production preview
  hosts such as `preview-code.marketing-sites.code.org` (see
  `apps/marketing/src/config/preview.ts`). No separate preview environment.

### Data Flow Notes

- Untrusted data enters only in the pipeline; it is validated before any
  Contentful write and again on site read.
- **Failure modes**: any pipeline failure leaves Contentful's published entry
  and public pages untouched. Site-side validation failure keeps the last
  good pages and logs an alert.
- **Revalidation finding (verified in code)**: the Contentful client tags
  requests by `sys.id[in]` values and by `content_type`.
  `apps/marketing/src/app/api/revalidate/route.ts` clears tags by `entryId`
  and only special-cases the `redirect` content type. A fetch-all-by-content-
  type (like `getContentfulActivities`) is tagged by content type, not entry
  ID, so an entry-publish webhook would **not** clear it. The site must fetch
  the envelope by entry ID, or `revalidateByContentType` must add the
  envelope content type, and the webhook's payload for the new type must be
  confirmed.
- **Trigger risk (verified in code)**: `marketing-app-deploy.yml` and
  `marketing-app-deploy-to-environment.yml` both accept `workflow_dispatch`;
  the latter runs in `marketing-sites-<env>-<site>` environments. Their
  protection rules (reviewers, branch restrictions) are not visible in the
  repo and must be checked in GitHub settings.
- **Contentful**: no MCP confirmation yet; all Contentful changes will be
  human-approved and re-read via MCP.
- **SEO**: none for Workstreams 1–4; explicit review for report routes later.

### Key Entities

- **Report Sheet**: the Advocacy team's Google Sheet; named ranges with
  machine headers in row 2; source of truth for data (and, for now, state
  narratives).
- **Raw Sheet Extract**: named-range rows keyed by header name plus source
  sheet ID and revision; output of Workstream 1.
- **Scored Report Data**: per-jurisdiction scores, tiers, rankings and
  national aggregates produced by the prototype methodology; must satisfy the
  report data contract.
- **Report Data Contract**: the versioned JSON Schema in the repo; the
  boundary between untrusted input and production.
- **Report Envelope**: the single Contentful entry wrapping the validated
  data with schema version, data-as-of date, source sheet ID/revision,
  warnings and run link.
- **Pipeline Run**: one execution of the workflow; has a trigger source,
  status, warnings and link.

## Open Decisions

These are **not decided**. Planning proposes options and gets decisions from
the named owners; this spec does not pick.

| #    | Decision                                                                                                                                                                                                     | Options                                                                                                                                                                                                                                                                         | Owner                             |
| ---- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------- |
| OD-1 | Exact preview/publish step                                                                                                                                                                                   | (a) Review on preview, human clicks Publish in Contentful (David's current direction); (b) Sheet "Publish" action that publishes via a separately scoped credential; (c) Engineering-only publish                                                                               | Advocacy + David + Darin          |
| OD-2 | Contentful write credential                                                                                                                                                                                  | (a) Bot user with custom role: create/edit envelope drafts only, no publish; (b) App Framework app identity; fallback: write artifact to S3 and have the site read it (kill criterion)                                                                                          | Platform & Infrastructure         |
| OD-3 | Sheet → GitHub trigger                                                                                                                                                                                       | (a) Fine-grained token from a bot account, this repo, Actions read/write, expiring — only if deploy workflows require environment review; (b) Relay that verifies a Google identity token against a publisher allowlist and dispatches only this workflow with a GitHub App key | Platform & Infrastructure         |
| OD-4 | Scoring changes from the Nov 3 plan (blank = "not reported", momentum without tier history, hidden YoY) and what replaces the hand-committed "last data" file (e.g., sheet year columns `2019_20`…`2025_26`) | Confirm each with Advocacy; default is prototype behavior                                                                                                                                                                                                                       | Advocacy team                     |
| OD-5 | Where the Python lives and how CI runs it                                                                                                                                                                    | (a) New top-level folder (e.g., `pipelines/sodf/`) with its own CI job; (b) Under `apps/` as a Turborepo workspace with a `package.json` shim for lint/test                                                                                                                     | Engineering                       |
| OD-6 | State narratives                                                                                                                                                                                             | (a) Stay in the sheet (risk: "spreadsheet as CMS"); (b) Move to Contentful entries                                                                                                                                                                                              | Advocacy + marketing-sites owners |
| OD-7 | Publish-to-live time                                                                                                                                                                                         | Existing 15-minute cache, or CloudFront invalidation / shorter TTL for report routes                                                                                                                                                                                            | Advocacy + marketing-sites owners |
| OD-8 | On-call for the pipeline                                                                                                                                                                                     | TBD                                                                                                                                                                                                                                                                             | Platform & Infrastructure         |
| OD-9 | Google Cloud project and admin for federation setup                                                                                                                                                          | Confirm a CodeAI project exists and who has admin                                                                                                                                                                                                                               | Platform & Infrastructure         |

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: An engineer can read the sheet locally with their own login
  within 15 minutes of following the documented steps, with no keys
  exchanged.
- **SC-002**: The automated pipeline reads every required named range for
  all 51 jurisdictions using credentials that expire within 1 hour, with zero
  long-lived Google keys stored anywhere.
- **SC-003**: Inserting a column anywhere in a named range changes zero
  parsed values.
- **SC-004**: Parity: 100% of jurisdictions match the prototype exactly on
  policy, access, participation and leadership points.
- **SC-005**: 100% of invalid payloads in the test suite are rejected before
  reaching Contentful, and 100% are rejected again by the site on read.
- **SC-006**: From clicking Preview in the sheet, the new data is visible on
  a preview host within 10 minutes.
- **SC-007**: After the envelope is published, public pages show the new data
  within the public cache window (15 minutes unless OD-7 changes it).
- **SC-008**: A pipeline or data failure causes zero minutes of public-page
  downtime or partial-data rendering.
- **SC-009**: Security checklist items in the handoff are all verified before
  launch (Google scope and trust restrictions, narrow Contentful credential,
  no unreviewed deploy path from the sheet, double validation, plain-text
  rendering, preview off the public cache, synthetic fixtures).

## Assumptions

- The data is state-level aggregates only; no personal data or student
  records. Synthetic data is used in fixtures, tests and Storybook anyway.
- The Advocacy team keeps the same tabs and row-2 machine names, and defines
  named ranges for the data the pipeline reads.
- Google Workspace allows sharing the sheet with a service account address;
  to be tested with a throwaway sheet first.
- A CodeAI Google Cloud project exists with a Platform & Infrastructure
  admin (OD-9).
- The report appears on the Code.org brand in `en-US` only.
- The prototype code (`AOwen-Code/codeai-digital-sciences-report`) is private
  and not available in this session; parity work requires access to it.
- Existing cache headers, SWR/SIE, preview/draft isolation, middleware and
  redirects are unchanged.
- Rendering stays server-side; any client boundary is minimal and justified
  later.
- Multi-editor concurrent sheet editing is out of scope; the team
  coordinates.
- Workstream 6 (pages and components) will likely get its own spec once the
  data contract is stable.

## Kill Criteria and Off-ramps

| Trigger                                                                 | Off-ramp                                             |
| ----------------------------------------------------------------------- | ---------------------------------------------------- |
| Prose, links or page structure start showing up in the sheet            | Move that content into Contentful entries            |
| Advocacy team needs seamless multi-editor workflows                     | Move data entry into Contentful (or another CMS)     |
| A second report wants a sheet behind it                                 | Decide deliberately; don't copy this one             |
| The sheet's GitHub credential can reach deploy workflows without review | Build the relay before launch                        |
| Contentful can't scope the write credential acceptably                  | Write the artifact to S3 and have the site read it   |
| Parity can't match policy, access, participation and leadership points  | Stop and resolve with Advocacy before building pages |
