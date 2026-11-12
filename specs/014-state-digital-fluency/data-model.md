# Data Model: State of Digital Fluency report

## Contentful: `reportData` (confirmed via MCP on 2026-11-09, Code.org `master`)

| Field      | ID          | Type   | Required | Validation                                      |
| ---------- | ----------- | ------ | -------- | ----------------------------------------------- |
| Title      | `title`     | Symbol | yes      | display field                                   |
| Report key | `reportKey` | Symbol | yes      | unique, `^[a-z0-9-]+$`                          |
| Data as of | `dataAsOf`  | Date   | yes      |                                                 |
| Data       | `data`      | Object | yes      | `ReportData` below                              |
| Warnings   | `warnings`  | Object | no       | `ValidationIssue[]` wrapped as `{items: [...]}` |
| Source run | `sourceRun` | Symbol | no       | `^https://github\.com/`                         |

There is one entry, with ID and `reportKey` both `state-of-digital-fluency`. It's written and published only by the spec 013 pipeline. This spec reads it.

### Entry lifecycle

```text
(absent) ──preview──▶ draft ──production──▶ published
                         ▲                      │
                         └──────preview─────────┘   (published + changed)
```

- **Preview**: creates the entry, or updates it at the current `sys.version`. It never publishes.
- **Production**: publishes only when an unpublished change exists (`sys.version > (sys.publishedVersion ?? 0) + 1`) and `sys.updatedBy` is the workflow's user.
- **Public pages**: return 404 until `publishedVersion` exists (the launch gate).

## `ReportData` (the `data` field)

This is the shape the site needs, handed to spec 013 as a request for its payload JSON Schema. Types live in `apps/marketing/src/modules/stateOfDigitalFluency/types.ts`. The pipeline writes them, and the site checks the structure, then reads fields tolerantly (see [contracts/report-data.schema.md](./contracts/report-data.schema.md)).

- Percentages are on a 0–100 scale with one decimal place.
- `null` always means "not reported". `0` always means a real zero.

```ts
type PolicyKey =
  | 'plan_guidance'
  | 'standards'
  | 'sea_position'
  | 'data_reporting'
  | 'diploma_req'
  | 'counts_grad'
  | 'require_offer'
  | 'pd_funding'
  | 'credentialing'
  | 'preservice';
type Tier =
  | 'no'
  | 'in_progress'
  | 'historic'
  | 'emerging'
  | 'developing'
  | 'transformative';
type TierLabel = 'Transformative' | 'Developing' | 'Emerging';
type Band = '81-100' | '51-80' | '0-50';
type YearKey = string; // '2025_26'

interface YearValue {
  year: YearKey;
  value: number | null;
}

interface ReportData {
  meta: {
    builtAt: string; // ISO; also the envelope's dataAsOf
    currentYear: YearKey; // newest access year header
    years: YearKey[]; // all access years, ascending
    participationYearLabel: string; // '2025–26' (follows currentYear)
    cohortYearLabel: string; // config constant (research R7)
    blankIndexRule: 'hold-back' | 'rescale';
    trendsAvailable: {
      access: boolean;
      participation: boolean;
      score: boolean;
      tierHistory: boolean;
    };
  };
  national: {
    averageScore: Figure; // mean of state totals
    bandCounts: Record<Band | 'notScored', number>;
    access: Figure & {series: YearValue[]}; // US row, else mean
    participation: Figure; // US row, else mean
    gender: {female: Figure; male: Figure}; // US row; male = 100 - female if absent
    policyCounts: Record<PolicyKey, number>; // states at developing or transformative
  };
  states: StateRecord[]; // 51, sorted by name
}

interface Figure {
  value: number | null;
  source: 'sheet' | 'mean';
  statesCovered: number;
}

interface StateRecord {
  postal: string; // 'AL'
  slug: string; // 'al' (URL segment)
  name: string;
  lastUpdated: string; // YYYY-MM-DD; sheet value, else the publish date
  policies: Record<PolicyKey, Tier | null>;
  access: {
    series: YearValue[];
    latest: number | null;
    latestYear: YearKey | null;
    change: number | null;
  };
  participation: {
    totalPct: number | null;
    change: number | null; // null until participation year columns exist
    gender: {
      male: number | null;
      female: number | null;
      other: number | null;
    } | null;
  };
  seniorCohort: {totalPct: number | null; femalePct: number | null};
  leadership: {
    taskforce: boolean | null;
    csedweek: 'full' | 'partial' | 'no' | null;
  };
  narratives: {
    // plain text; '\n' preserved
    aiPolicyIntent: string | null; // sheet 'overview'
    aiPolicyRecommendation: string | null; // sheet 'strengths'
    accessNarrative: string | null; // sheet 'gaps'
    participationNarrative: string | null; // sheet 'next_steps'
  };
  momentum: Record<PolicyKey, {lastRiseYear: YearKey | null; points: number}>;
  score: {
    policy: number | null; // /45
    access: number | null; // /12
    participation: number | null; // /18
    momentum: number; // /15
    leadership: number | null; // /10
    total: number | null; // null under hold-back when an index input is blank
    complete: boolean; // every index input reported
    tierLabel: TierLabel | null;
    band: Band | null;
    change: number | null; // null until score history exists
  };
  ranks: {
    score: number | null;
    access: number | null;
    participation: number | null;
  };
}
```

## `ValidationIssue`

```ts
interface ValidationIssue {
  severity: 'error' | 'warning';
  row: number | null; // sheet row (1-based)
  column: string | null; // row-2 header
  postal: string | null;
  code: string; // e.g. 'missing_header', 'invalid_tier', 'out_of_range'
  message: string; // plain English, shown in the menu
}
```

## Scoring rules (requested of spec 013; the site never re-scores)

These are ported from `build_json_from_xlsx.py`. Exceptions are marked; full detail is in research R7.

| Component          | Rule                                                                                                                                                                                 |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Policy (45)        | `round1(sum(TIER_POINTS[t]) / 50 * 45)`. Points: no 0, in*progress 0.5, historic 1, emerging 2, developing 3.5, transformative 5. `null` if any tier is not reported *(exception)\_. |
| Access (12)        | `round1(12 * (latest / 100) ** 1.5)` on the latest reported year. `null` if none _(exception)_.                                                                                      |
| Participation (18) | `round1(18 * min(pct / 25, 1) ** 1.5)`. `null` if blank _(exception)_.                                                                                                               |
| Leadership (10)    | Taskforce 6, plus csedweek full 4 or partial 2. `null` if either is not reported _(exception: the code treats blanks as false or `no`)_. The live sheet has no blanks here.          |
| Momentum (15)      | Per policy: transformative 1.5. `data_reporting` that isn't `no`: 1.5. Otherwise, the last rise from tier year columns: 1.5 at 0–1 years, 1.0 at 2, 0.5 at 3. Capped at 15.          |
| Total              | Hold back: the sum, if `complete`, else `null`. Rescale: `sum(reported) / sum(max of reported) * 100`.                                                                               |
| Tier label         | `total >= 81` Transformative, `>= 51` Developing, otherwise Emerging.                                                                                                                |
| Band               | `>= 81` '81-100', `>= 51` '51-80', otherwise '0-50'.                                                                                                                                 |
| Ranks              | Stable sort by value, descending; not shared; `null` values unranked and listed last.                                                                                                |

`round1` rounds half to even, matching Python's `round(x, 1)`.
