# State of Digital Fluency data pipeline (POC)

Proof of concept for the authenticated wiring behind the State of Digital
Fluency report:

```
Google Sheet ──(keyless, read-only)──▶ GitHub Actions ──▶ placeholder Python
  ──▶ JSON Schema validation ──▶ Contentful envelope entry (DRAFT, never published)
```

Spec: [`specs/013-digital-fluency-data-pipeline/`](../../specs/013-digital-fluency-data-pipeline/).
The marketing site does not read this data yet.

**Data:** state-level aggregates only. There's no personal data and there are no
student records. The placeholder transform copies **no cell values** into
Contentful: it sends column names, row counts and a SHA-256 fingerprint per range.
That's enough to prove a sheet edit reached Contentful. Tests use synthetic data
only.

## Layout

| Path                                                    | What                                                                |
| ------------------------------------------------------- | ------------------------------------------------------------------- |
| `digital_fluency/config.py`                             | Which sheet ranges to read and their header rows                    |
| `digital_fluency/sheets.py`                             | Google auth (ADC) + named-range reader; maps columns by header name |
| `digital_fluency/transform.py`                          | **Placeholder**: swap in the real scoring here                      |
| `schema/digital-fluency-payload.schema.json`            | Payload contract (POC). Changes need engineering review             |
| `digital_fluency/validate.py`                           | Schema + size validation                                            |
| `digital_fluency/contentful.py`                         | Draft-only Contentful writer with content-type guard                |
| `digital_fluency/cli.py`                                | `describe`, `build`, `write` commands                               |
| `contentful/digital-fluency-envelope.content-type.json` | **Proposed** envelope content type for a human to create            |
| `.github/workflows/digital-fluency-data-pipeline.yml`   | The on-demand pipeline                                              |
| `.github/workflows/digital-fluency-pipeline-ci.yml`     | Unit tests on PRs                                                   |

## Run locally (David: start here)

Requires Python 3.12+ and the `gcloud` CLI. You only need Viewer access to the
sheet. Your own Google login is used and no keys are involved.

```bash
cd pipelines/digital-fluency
python3 -m venv .venv && . .venv/bin/activate
pip install --require-hashes --no-deps -r requirements.txt

gcloud auth application-default login \
  --scopes=https://www.googleapis.com/auth/spreadsheets.readonly,https://www.googleapis.com/auth/cloud-platform
# Personal credentials need a project to bill Sheets API quota to. This needs
# roles/serviceusage.serviceUsageConsumer on it (README §1, "Local developers").
export GOOGLE_CLOUD_QUOTA_PROJECT=marketing-sites-gdrive

export DIGITAL_FLUENCY_SPREADSHEET_ID=<id from the sheet URL>
python -m digital_fluency describe            # lists tabs + named ranges, no values

python -m digital_fluency build --output out/envelope.json  # reads config.py ranges

# Optional, local only: try other ranges without editing config.py.
# Named or A1 ranges, comma-separated; `@N` = header row within that range.
# DIGITAL_FLUENCY_RANGES="'State Data 2026'!A:F@2" python -m digital_fluency build --output out/try.json
```

### The real sheet today (checked read-only on 2026-11-09)

"CodeAI Digital Sciences — State Data 2026" has **no named ranges yet**, so
`digital_fluency/config.py` uses A1 ranges until the Advocacy team adds them.
The ranges are in code, not GitHub settings, because the transform depends on
the sheet's structure. A range change gets reviewed with the code that reads it.

| Tab                 | Layout                                                                                          | Use                 |
| ------------------- | ----------------------------------------------------------------------------------------------- | ------------------- |
| `State Data 2026`   | Row 1: group labels. Row 2: machine names (`plan_guidance` … `cohort_female_pct`). Columns A:AL | Main data, `@2`     |
| `Reference - Tiers` | Row 1: `Policy Tier`, `Points`, `Meaning` (no separate machine row)                             | Tier → points, `@1` |
| `kam_scratch`       | Scratch                                                                                         | Don't read          |

Things to note:

- **Proposed named ranges.** Ask the Advocacy team to add `digital_fluency_state_data`
  (`'State Data 2026'!A2:AL`) and `digital_fluency_tiers` (`'Reference - Tiers'!A1:C`).
  Both start at their header row, so `config.py` would become
  `digital_fluency_state_data@1` and `digital_fluency_tiers@1`. After that,
  moving the tabs or columns won't break the read.
- **Inconsistent headers.** Columns A and B use human labels in row 2
  (`State Name`, `Postal`), not snake_case machine names.
- **Prose in the sheet.** The narrative columns (`overview`, `strengths`, `gaps`,
  `next_steps`) are the "spreadsheet as CMS" risk flagged in the spec (OD-6).
  The placeholder copies none of their text.

`build` fails, and writes nothing, if a range is missing, has no header row, or
has duplicate header names. Blank-header columns and fully blank rows are ignored.

Run the tests:

```bash
python -m unittest discover -s tests -t .
```

To replace the placeholder with real scoring, edit `transform.build_payload` and
`schema/digital-fluency-payload.schema.json` together. The reader hands you
`SheetExtract.tables[*].rows` as lists of `{machine_name: value}` dicts.

## Configuration

| Variable                                         | Where                         | Notes                                                                                               |
| ------------------------------------------------ | ----------------------------- | --------------------------------------------------------------------------------------------------- |
| `DIGITAL_FLUENCY_SPREADSHEET_ID`                 | env / GitHub var              | Sheet ID. A variable, not code, so the public repo doesn't publish an internal sheet's ID           |
| `DIGITAL_FLUENCY_RANGES`                         | local only                    | Optional override of `config.py` ranges; ignored in Actions                                         |
| `GOOGLE_CLOUD_QUOTA_PROJECT`                     | local only                    | Not needed in Actions                                                                               |
| `DIGITAL_FLUENCY_GCP_WORKLOAD_IDENTITY_PROVIDER` | GitHub var                    | `projects/<number>/locations/global/workloadIdentityPools/github-actions/providers/marketing-sites` |
| `DIGITAL_FLUENCY_GCP_SERVICE_ACCOUNT`            | GitHub var                    | `digital-fluency-sheet-reader@marketing-sites-gdrive.iam.gserviceaccount.com`                       |
| `DIGITAL_FLUENCY_CONTENTFUL_SPACE_ID`            | GitHub var                    |                                                                                                     |
| `DIGITAL_FLUENCY_CONTENTFUL_ENVIRONMENT_ID`      | GitHub var                    | Start with a sandbox environment                                                                    |
| `DIGITAL_FLUENCY_CONTENTFUL_ENTRY_ID`            | GitHub var                    | The single envelope entry                                                                           |
| `DIGITAL_FLUENCY_CONTENTFUL_CONTENT_TYPE_ID`     | GitHub var                    | Default `stateOfDigitalFluencyData`                                                                 |
| `DIGITAL_FLUENCY_CONTENTFUL_MANAGEMENT_TOKEN`    | GitHub **environment secret** | Bot user's token; see below                                                                         |

Put all of these on a GitHub Environment named **`digital-fluency-data-pipeline`**.

## One-time setup

### 1. Google: Workload Identity Federation (Platform & Infrastructure)

All of this lives in the **`marketing-sites-gdrive`** project, in the
**Production** folder. It gives marketing-sites access to Google Workspace data
(Drive, Sheets). It inherits Production's org policies and folder roles, so make
sure those roles are tight. The GitHub trust has its own pool, and each job
gets its own service account. The only role people get here is quota usage for
local runs (below), which doesn't let them act as any service account.

- **Pool** `github-actions`: trusts GitHub's OIDC issuer.
- **Provider** `marketing-sites`: accepts only this repository, matched by its
  immutable repository ID `1080799522`. Renaming or transferring the repo
  can't widen it. Any workflow in the repo may use the provider.
- **Service account** `digital-fluency-sheet-reader`: no project roles, Viewer on one
  sheet. Its binding decides which workflow may act as it. During the POC that's
  any workflow in the repo; before launch, only the Digital Fluency workflow on `main`.

Keep project IAM tight. Owners, Editors and anyone with Service Account Token
Creator can act as `digital-fluency-sheet-reader` and read the sheet. Don't grant those
roles broadly in this project. Enforce the org policy that blocks
service-account key creation here (`iam.disableServiceAccountKeyCreation`, or
its managed equivalent).

```bash
PROJECT_ID=marketing-sites-gdrive
PROJECT_NUMBER=$(gcloud projects describe $PROJECT_ID --format='value(projectNumber)')
REPO_ID=1080799522
POOL=projects/$PROJECT_NUMBER/locations/global/workloadIdentityPools/github-actions
SA=digital-fluency-sheet-reader@$PROJECT_ID.iam.gserviceaccount.com
```

```bash
gcloud services enable sheets.googleapis.com iamcredentials.googleapis.com sts.googleapis.com --project=$PROJECT_ID
```

```bash
gcloud iam workload-identity-pools create github-actions --location=global --project=$PROJECT_ID \
  --display-name="GitHub Actions" \
  --description="OIDC trust for GitHub Actions workflows in code-dot-org repos"
```

```bash
gcloud iam workload-identity-pools providers create-oidc marketing-sites \
  --location=global --workload-identity-pool=github-actions --project=$PROJECT_ID \
  --display-name="code-dot-org/marketing-sites" \
  --issuer-uri="https://token.actions.githubusercontent.com" \
  --attribute-mapping="google.subject=assertion.sub,attribute.repository=assertion.repository,attribute.repository_id=assertion.repository_id,attribute.ref=assertion.ref,attribute.workflow_ref=assertion.workflow_ref" \
  --attribute-condition="assertion.repository_id=='$REPO_ID'"
```

```bash
gcloud iam service-accounts create digital-fluency-sheet-reader --project=$PROJECT_ID \
  --display-name="Digital Fluency sheet reader" \
  --description="Read-only: Viewer on the Digital Fluency Google Sheet only. No project roles."
```

POC binding: any workflow in this repo may act as the reader. Branch runs work,
so David can experiment.

```bash
gcloud iam service-accounts add-iam-policy-binding $SA --project=$PROJECT_ID \
  --role=roles/iam.workloadIdentityUser \
  --member="principalSet://iam.googleapis.com/$POOL/attribute.repository_id/$REPO_ID"
```

Grant the service account **no** project roles. Then share **only the report
sheet** with `digital-fluency-sheet-reader@marketing-sites-gdrive.iam.gserviceaccount.com`
as **Viewer**. Test sharing with a throwaway sheet first. Workspace policy may
block sharing with an address outside the domain.

GitHub variables for this step:

- `DIGITAL_FLUENCY_GCP_WORKLOAD_IDENTITY_PROVIDER` =
  `projects/<PROJECT_NUMBER>/locations/global/workloadIdentityPools/github-actions/providers/marketing-sites`
  (the project **number**, not the ID)
- `DIGITAL_FLUENCY_GCP_SERVICE_ACCOUNT` =
  `digital-fluency-sheet-reader@marketing-sites-gdrive.iam.gserviceaccount.com`

**Local developers** (for example, David) bill their own Sheets reads to this
project. That needs only `serviceUsageConsumer`. Don't grant Editor, Owner or
Service Account Token Creator: any of those would let the person act as the
reader.

```bash
gcloud projects add-iam-policy-binding $PROJECT_ID \
  --role=roles/serviceusage.serviceUsageConsumer \
  --member="user:<developer email>"
```

Their own login still needs Viewer (or better) on the sheet to read it.

New IAM bindings can take a few minutes to apply. An early permission error may
clear up on a retry.

### 2. Contentful: envelope type, scoped role, bot user (needs a human)

Nothing here has been created or checked through Contentful MCP. A Contentful
admin applies each step, and we re-read the result afterwards.

1. **Content type.** Review `contentful/digital-fluency-envelope.content-type.json` and
   create it, in a sandbox environment first. It's an envelope only: the JSON
   payload plus provenance fields.
2. **Custom role** "Digital Fluency pipeline writer". Under Content › Entries, allow **Read,
   Create, Edit** only where the content type is `stateOfDigitalFluencyData`.
   Do **not** allow Publish, Archive or Delete, or access to other content types
   or assets. Confirm that custom roles are on CodeAI's plan.
3. **Bot user** (a shared mailbox, not a person) with only that role. Create a
   personal access token for it **with an expiry**. Store it as the
   `DIGITAL_FLUENCY_CONTENTFUL_MANAGEMENT_TOKEN` secret on the `digital-fluency-data-pipeline`
   environment.
4. **Entry.** Create one entry of the type, or let the first run create it with
   the ID in `DIGITAL_FLUENCY_CONTENTFUL_ENTRY_ID`. Restrict who else can edit it.

Also to evaluate: whether a Contentful App Framework app identity gives a
narrower or easier-to-rotate credential than a bot user's token.

The writer has its own guards. It refuses to touch an entry of any other
content type, refuses archived entries, sends the version header to avoid lost
updates, and never calls a publish endpoint.

### 3. GitHub

1. Create the `digital-fluency-data-pipeline` environment with the variables and secret
   above. While experimenting, allow branch runs. Before launch, see below.
2. A `workflow_dispatch` workflow appears in the Actions UI (and the dispatch
   API) only after it exists on the default branch. Merge the workflow first,
   then run it from any branch:

```bash
gh workflow run digital-fluency-data-pipeline.yml --ref <branch> -f write_to_contentful=false
```

Run first with `write_to_contentful=false`, which only reads and validates and
needs no Contentful setup. Then run with `true`.

## Tighten before launch

- Swap the reader's POC binding for one limited to the Digital Fluency workflow on `main`.
  Add the new binding first, then remove the old one. Leave the provider
  repo-wide, because other workflows may use it later.

```bash
gcloud iam service-accounts add-iam-policy-binding $SA --project=$PROJECT_ID \
  --role=roles/iam.workloadIdentityUser \
  --member="principalSet://iam.googleapis.com/$POOL/attribute.workflow_ref/code-dot-org/marketing-sites/.github/workflows/digital-fluency-data-pipeline.yml@refs/heads/main"
```

```bash
gcloud iam service-accounts remove-iam-policy-binding $SA --project=$PROJECT_ID \
  --role=roles/iam.workloadIdentityUser \
  --member="principalSet://iam.googleapis.com/$POOL/attribute.repository_id/$REPO_ID"
```

- Set the `digital-fluency-data-pipeline` environment's deployment branches to `main` only.
- Add CODEOWNERS for `pipelines/digital-fluency/schema/` and the workflow files.
- Decide how the sheet's menu triggers this workflow. A token that can dispatch
  this workflow can also dispatch the deploy workflows (spec OD-3).

## Known POC limits

- `sourceRevision` holds the read time, not a Drive revision ID. A real
  revision ID would need a Drive metadata scope.
- The 500 KB payload cap is a local guess. Confirm Contentful's JSON field and
  entry size limits.
- The site doesn't consume the entry yet. When it does, fetch the entry **by
  ID** so the existing publish webhook's `revalidateTag(entryId)` clears it
  (spec FR-026).
