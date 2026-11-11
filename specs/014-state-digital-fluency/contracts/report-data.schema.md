# Contract: `reportData.data` (pipeline → site)

The shape is defined in [data-model.md](../data-model.md) and lives in `src/modules/stateOfDigitalFluency/types.ts`.

## Writer (pipeline)

- The only writer is the spec 013 Python pipeline, which writes only after its JSON Schema check passes. The shape in data-model.md is our request for that schema.
- It may add fields at any time.
- It must not rename or remove a field the site displays until the site no longer reads it. That change ships first.

## Reader (site): tolerant rules

First, `reportShape.ts` checks the structure (`meta`, `national`, and `states[]` with `postal` and `name`). If that fails, the page throws, the last good page keeps serving, and an error is logged. Then `readReport.ts` turns the raw JSON into page view models:

- Unknown fields are ignored.
- A missing or `null` value displays as "Not reported", never 0 and never an error.
- `national` figures that are missing display as "Not reported". The site doesn't compute national figures itself.
- Score parts and ranks are shown as stored. The site never re-scores.
- Text is rendered as plain text (React text nodes, `white-space: pre-line`), never as HTML.
- `meta.trendsAvailable.*` false hides the matching change figures.
- Draft-only: `warnings.items` render in a notice at the top of each page, only when `draftMode()` is enabled.

## Routes that read it

| Route                                      | Uses                                                                                                                                                      |
| ------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `/state-of-digital-fluency`                | `national.*`, every state's `score.band`, `score.total`, `ranks.score`, `access.latest`, `participation.totalPct` and `participation.gender` (map island) |
| `/state-of-digital-fluency/rankings`       | Every state's `score`, `access` and `participation`, plus `ranks`                                                                                         |
| `/state-of-digital-fluency/[state]`        | One state record, plus the national benchmarks and all states' totals for the ranked bars                                                                 |
| `/state-of-digital-fluency/[state]/report` | Same as the state page, plus `national.policyCounts` and `national.access.series`                                                                         |
| `sitemap.xml`                              | Whether the entry exists, plus `states[].slug`                                                                                                            |

Each page passes its client islands only the fields they render, never the whole object.
