# Research: State of Digital Fluency report

Sources:

- The prototype at `AOwen-Code/codeai-digital-sciences-report` HEAD `497afed`, read only. Citations below use `B:` for lines in `scripts/build_json_from_xlsx.py`.
- The marketing-sites codebase at `origin/main` `f97bdee3`.
- Contentful MCP, Code.org space `90t6bu6vlf76`, read on 2026-11-09.
- The live sheet "CodeAI Digital Sciences — State Data 2026" (`1wLL-OK3d5a1xYPIJIWxVzeZTUEQ2GOcnuzn6Pgy-Crg`, owned by the Policy team), read on 2026-11-09. Ignore the older copy `15NI5D…`: it has no national row and no male/other gender columns.

## Ownership after 2026-11-09

Dee adopted Infrastructure's Python pipeline (spec 013, PR #223). The sections below split as follows:

- **Handed to spec 013**: R0–R2 and R7–R9 are findings and recommendations for the pipeline, which owns sheet reading, validation, scoring, writing, publishing and the sheet trigger. R9 is replaced by the decisions listed under it.
- **Owned by this spec (014)**: R3–R6 and R10.

## R0. Live sheet profile (2026-11-09)

- **Tabs**: `State Data 2026`, `kam_scratch` and `Reference - Tiers`. The data tab has 38 columns, with section headers in row 1 and machine names in row 2.
- **Rows**:
  - Row 3 is `National`/`US`. Only its access, `hs_total_pct` and gender values are filled.
  - Rows 4–54 are the 51 jurisdictions, with no duplicate postals.
  - Row 55 is a footnote ("Valid policy tier values: …") with no postal, so it's skipped, as in the prototype.
- **Tiers**: all values are valid, with no blanks and no `emerging_historic`.
- **Access**: `2025_26` is blank for 28 states, so their latest reported year is older.
- **Participation**: `hs_total_pct` is blank for 11 states (AK, CA, CO, DE, DC, ME, MI, MT, NH, OK, SD). These are the only blank index inputs. Under the default "hold back" rule, those 11 states have no overall score or rank. Under "rescale", they're scored out of 82. Today's prototype scores them 0 for participation.
- **Narratives**: real copy up to 955 characters, using `•` bullet lines and `1.` numbered lines separated by `\n`. They render as plain text with line breaks kept (`white-space: pre-line`).
- **`last_updated`**: values like `2026-11-4` (no zero padding). Parse `YYYY-M-D`.
- **HS breakdown and most cohort columns**: empty. Only `cohort_total` and `cohort_female_pct` have data.

When the prototype's code disagrees with the methodology document, the code wins. Blank-as-null and year-column trends are the two deliberate exceptions.

## R1. Reading the sheet

- **Decision**:
  - Read the first tab named `State Data` or starting with `State Data `, as the prototype does (B:185). The tab name doesn't need to stay fixed.
  - Find columns by their row-2 header names. Data starts at row 3.
  - The row whose `Postal` is `US` is the national row; the other 51 rows are states.
  - Access year columns are the headers that match `^\d{4}_\d{2}$`.
  - Tier and participation year columns, once added, use `<field>_YYYY_YY`.
  - Auth: `google-github-actions/auth@v2` writes Application Default Credentials for either a key or keyless sign-in. `google-auth-library` `GoogleAuth({scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly']})` then calls `values.get` with `valueRenderOption=UNFORMATTED_VALUE`.
- **Rationale**:
  - The prototype reads by position (B:204), so inserting a column breaks it. Header names are already machine names.
  - Matching the tab by prefix means a yearly rename like `State Data 2027` still works.
  - The same code covers both of Infrastructure's sign-in options.
- **Alternatives**:
  - `googleapis`: too heavy for one call.
  - Exporting the xlsx from Apps Script: rejected, because nothing may push data in.
- **Header mapping** (row-2 names, B:53-58, B:397-400):

  | Group                    | Headers                                                                                                                                                    |
  | ------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
  | Identity                 | `State Name`, `Postal`                                                                                                                                     |
  | Policy tiers             | `plan_guidance`, `standards`, `sea_position`, `data_reporting`, `diploma_req`, `counts_grad`, `require_offer`, `pd_funding`, `credentialing`, `preservice` |
  | Access by year           | `2019_20` … `2025_26`                                                                                                                                      |
  | Participation and gender | `hs_total_pct`, `hs_male_pct`, `hs_female_pct`, `hs_other_pct`                                                                                             |
  | Leadership               | `taskforce`, `csedweek`                                                                                                                                    |
  | Narratives               | `overview`, `strengths`, `gaps`, `next_steps`                                                                                                              |
  | Other                    | `last_updated`                                                                                                                                             |
  | Senior cohort            | `cohort_total`, `cohort_female_pct` (the only cohort columns with data)                                                                                    |

  Narratives are stored as `ai_policy_intent`, `ai_policy_recommendation`, `access_narrative` and `participation_narrative`, the code's mapping. The empty HS breakdown and other cohort columns are read if present and ignored otherwise.

## R2. Normalisation and validation

- **Decision**:

  | Input                                                                | Result                                                                                                                                                                                        |
  | -------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
  | Blank, `-`, `—`, `N/A`, `NA`, `TBD` (case-insensitive) in any column | Not reported (null). Deliberate change: the code turns a blank tier into `no` (B:280) and a blank `hs_total_pct` into a fatal error (B:310).                                                  |
  | Tier values                                                          | Normalised with `strip().lower().replace(' ', '_')`. An unknown value, including `emerging_historic`, is a **warning** and becomes not reported. The approved plan wins over the code's `no`. |
  | Numeric columns that aren't numbers or are outside 0–100             | `hs_total_pct`: **blocking**, as in the code. Other columns: warning and not reported, as in the code (B:293-339).                                                                            |
  | `taskforce`                                                          | `yes/y/true/1` or `no/n/false/0`. Anything else is a warning and not reported.                                                                                                                |
  | `csedweek`                                                           | `full/f`, `partial/p` or `no/n`. Anything else is a warning and not reported.                                                                                                                 |
  | Narratives and other text                                            | Trimmed. Over 2,000 characters is a warning. Always rendered as plain text.                                                                                                                   |
  | `last_updated`                                                       | Parsed as a date. If blank, the publish date. The prototype always used the build date (bug, B:122-182).                                                                                      |

  New blocking checks the code lacks:

  - a missing required header
  - a missing tab
  - a duplicate or unknown postal
  - anything other than 51 states plus an optional `US` row
  - a malformed year header

- **Rationale**: "Blank means not reported" is Dee's rule. Strict parsing stops bad numbers from reaching the public site.

## R3. Charts: MUI X Charts 8.29.3

- **Decision**: Chart wraps `@mui/x-charts@8.29.3` with a fixed `width` and `height` (or a fixed aspect-ratio container), `skipAnimation` when the reader prefers reduced motion, and `disableTooltip` or no highlight in static mode. A short spike (task 1 of Phase 2) confirms:

  - it renders on the server (SVG in the HTML)
  - keyboard and screen-reader behaviour, with our own table equivalent always rendered
  - bundle cost
  - brand colours through the theme

  If the spike fails, use visx.

- **Rationale**:
  - The user accepted MUI X.
  - 9.x needs `@mui/material` ≥ 7.3. We're on 7.1.2, and 9.17.0 is under two weeks old.
- **Tradeoff (deviation from the working plan)**: MUI X Charts components are client components, so even static charts hydrate and ship the chart bundle. The plan's "chart JavaScript loads only where interactivity is on" can't hold with MUI X. We measure against the Lighthouse budget instead (SC-007, amended). Print pages render charts with interactivity off.
- **Alternatives**: first-party server SVG for static charts plus MUI X for interactive ones. Rejected: two renderers per chart type.

## R4. Map: first-party SVG (Dee, 2026-11-09)

- **Decision**: draw the states as our own SVG so we control hover, focus, selection and animation.
  - **Geography**: `us-atlas@3.0.1` `states-albers-10m.json`. It's ISC-licensed, derived from Census boundaries, already projected to Albers USA at 975×610 with Alaska and Hawaii inset, and includes DC.
  - **Generated paths**: a one-off script (`apps/marketing/scripts/generateUsStatePaths.ts`, using `topojson-client` and `d3-geo` `geoPath()` with no projection, simplified with `topojson-simplify`) writes `src/components/dataDisplay/map/usStatePaths.ts`. That file is a committed map of postal code to path `d` string. The three packages are devDeps used only to regenerate, so there's no runtime geography dependency.
  - **Server-rendered**: the full `<svg>` with one focusable `<path>` per state (`role="link"`, `aria-label` "Alabama, score 63.2, 51–80"), band fills from props, and a DC callout circle (the prototype's isn't wired up).
  - **Client island**: only the hover, focus and selected state, the tooltip position, and the callback that drives the overview's state info card and gender card (they switch to the hovered state and reset on leave, as in the prototype).
  - **Animation**: CSS transitions on fill and stroke, a raised outline on hover or focus, and a scale-up for small states. All are disabled under `prefers-reduced-motion`. A fixed `viewBox` means no layout shift between states.
  - Clicking a state opens its page in the same tab; the prototype opens a new tab.
  - The table equivalent is rendered on the server. Bands also get a non-colour cue: the score text in labels and the table, and a pattern for "Not reported".
- **Rationale**: the hover, focus and animation Dee wants are easier and lighter with our own paths than through `@mirawision/usa-map-react`. That package controls rendering, needs `window` for its tooltip, and can't render on the server without hydration work. Generating the paths from a maintained public dataset avoids hand-editing geography.
- **Alternatives**:
  - `@mirawision/usa-map-react`: used by the State Gap Map, which is left as-is.
  - A Mapbox/react-map-gl choropleth: needs a token and is heavy.
- **Bands** (index.html:66-83):

  | Score      | Label          | Colour                   |
  | ---------- | -------------- | ------------------------ |
  | 81 or more | "81 – 100"     | `#4C42CF`                |
  | 51 or more | "51 – 80"      | `#ACA8EA`                |
  | Below 51   | "0 – 50"       | `#E4E2F8`                |
  | No score   | "Not reported" | `#F0F0F0` plus a pattern |

  The tier palette (Transformative `#4C42CF`, Developing `#0099F3`, Emerging `#F46800`) is used on the rank bars, the score hero and report charts. Colour pairs are checked for AA contrast in a unit test, because the Storybook a11y addon has colour-contrast turned off.

## R5. Fetching, caching, revalidation and the launch gate

- **Decision**:
  - `getReport()` reads `draftMode()`, then calls `getContentfulClient(isDraft).getEntries({'sys.id[in]': 'state-of-digital-fluency', limit: 1})`.
    - `getEntry` sends `sys.id`, which gets no cache tag (createClient.ts:36-50).
    - It returns `null` when the client is missing, the entry is missing, or the fetch fails.
  - Routes export `revalidate = 900` to match the Experience route and the CloudFront function note. `next.config.ts` already applies `STALE_WHILE_REVALIDATE_FIFTEEN_MINUTES` by path.
  - Pages call `notFound()` when `getReport()` returns null. On the public host that's "never published" (the launch gate); on the preview host, "no draft yet".
- **Verify before relying on revalidation**: the Contentful webhook body is configured in the Contentful UI, not in the repo. Dee confirms that it sends `entryId` for `reportData` entries, or adds the type to its filter. Until then, pages still refresh within the 900 s ISR window.
- **Shape check** (spec FR-006): `reportShape.ts` (Zod) checks only the structure the pages depend on. That's `meta`, `national` and `states` as an array of objects, each with `postal` and `name`, using `.passthrough()` and with all leaf fields optional. On failure, `getReport()` logs a structured error (entry version and the failing paths) and throws. During ISR revalidation, Next keeps the last good page, and CloudFront's stale-if-error covers the rest.
- **Rationale**: Tag invalidation is the existing contract, and stale-if-error keeps pages up if Contentful fails.

## R6. Routes, locales and SEO

- **Decision**:
  - Routes live under `src/app/[brand]/[locale]/state-of-digital-fluency/`, with a `notFound()` brand gate for anything other than `Brand.CODE_DOT_ORG` (catalog pattern).
  - `[state]` accepts the 51 postal codes in lowercase; anything else returns `notFound()`.
  - `methodology/page.tsx` re-exports the Experience page's render with fixed paths, because the `[state]` segment would otherwise shadow the catch-all.
  - Locales (confirmed by Dee on 2026-11-09: allow all translations for all reports): like the catalog and Experience routes, every supported locale renders the English report, and LocalizeJS translates on the client. The canonical includes the locale (`getProductionCanonicalRootDomain`), and the sitemap lists every locale with hreflang through the existing `writeSitemapEntry`.
  - Sitemap: `sitemap.xml/route.ts` fetches the report (wrapped in try/catch). When the report is published, it writes the overview, rankings and 51 state URLs with the existing `writeSitemapEntry`.
  - Printable pages are `robots: {index: false, follow: true}` and stay out of the sitemap.
- **Alternative**: `/state-of-digital-fluency/states/[state]`. Rejected: the approved plan uses `/[state]`.

## R7. Scoring port

- **Decision**: Port B:69-119 exactly.
  - Policy: `sum(points)/50*45`.
  - Access: `12*(latest/100)^1.5`.
  - Participation: `18*min(pct/25,1)^1.5`.
  - Leadership: taskforce 6, plus csedweek full 4 or partial 2.
  - Momentum: capped at 15.
  - Total, and the tier label (81 or more Transformative, 51 or more Developing, otherwise Emerging).
  - Rounding: use a half-to-even `round1()` that matches Python's `round(x, 1)` on binary floats (tested against fixture values).
- **Momentum with year columns**: the code compares against a stale committed file (B:415), which is why 48 of 51 states get full points. We keep its rules but build the history from year columns:
  - A tier that is `transformative` now earns 1.5.
  - `data_reporting` that isn't `no` earns 1.5 (the "Year 1" rule fires every year, as in the code).
  - Otherwise, the most recent year a tier's points rose earns 1.5 if it was 0–1 years ago, 1.0 at 2, 0.5 at 3, and nothing after that. A later drop doesn't remove an earlier rise, as in the code (B:427).
  - Until tier year columns exist, only the first two rules apply.
- **Blank index inputs**: one setting, `BLANK_INDEX_INPUT_RULE: 'hold-back' | 'rescale'`, defaulting to `hold-back`.
  - Hold back: the state keeps its component points, but its total, tier label, rank and band are null.
  - Rescale: `total = sum(reported components) / sum(max of reported components) * 100`.
- **Ranks**: stable sort by total, descending; ties are not shared and keep sheet order (B:680). Access and participation ranks follow the same rule, with not-reported states last, unranked.
- **Year-over-year**:
  - Access change: the last two reported values in the row (B:498).
  - Score change and participation change: null until year columns exist for those fields.
- **Year labels**: "current" is the newest access year header (e.g. `2025_26` shown as "2025–26"). The participation year follows it. The senior cohort year (hard-coded 2024 in the code, B:490) is a constant in `pipeline/config.ts`. See Open items.

## R8. National figures

- **Decision**: Follow the pages' logic, computed in the pipeline. Each figure prefers the sheet's `US` row and falls back to the mean of reporting states.

  | Figure                     | Rule                                                                                                                                             |
  | -------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
  | Average score              | Mean of the states with a total, to 1 decimal place                                                                                              |
  | Band counts                | Counted from states with a total                                                                                                                 |
  | Access, latest and by year | `US` row, else mean of reporting states                                                                                                          |
  | Participation              | `US` row, else mean                                                                                                                              |
  | Gender                     | `US` row; male = 100 − female when absent. Else mean of states, using only male and female. Other categories appear only on their state's pages. |
  | Policy counts              | States at `developing` or `transformative` per policy (report page 6)                                                                            |

  Each figure records `statesCovered`. Fixed versus the prototype: the report's 0-as-missing fallbacks, the hard-coded `[37,63]` gender fallback, and the all-orange national gender pie.

## R9. Publishing, trigger and envelope (decided 2026-11-09, owned by spec 013)

- **Pipeline**: Infrastructure's Python pipeline (`pipelines/digital-fluency/`, workflow `digital-fluency-data-pipeline.yml`), with keyless Google sign-in already set up.
- **Envelope**: the existing `reportData` type, not the proposed `stateOfDigitalFluencyData`.
  - One entry, `state-of-digital-fluency`.
  - Fields: `title`, `reportKey`, `dataAsOf`, `data` (JSON), `warnings` (JSON) and `sourceRun`.
  - No schema version. The schema is enforced in the pipeline, and the site checks only the overall shape.
- **Publishing**: the Policy team starts both modes from the sheet.
  - Preview writes a draft.
  - Production publishes that draft without re-reading the sheet. It refuses when there's no unpublished change, or when someone other than the pipeline edited the entry since the preview.
  - So the pipeline's Contentful credential needs publish rights on `reportData`, at least for the production step. This is their OD-1 option (b).
- **Trigger**: Infrastructure's relay (their OD-3 option b), which verifies the Google identity of an allowed publisher and can only dispatch this workflow, in either mode. This replaces our token-plus-deploy-guard design.
- **Site reading**: strict on the overall shape, tolerant on individual fields (spec FR-006).

## R10. Components

- **Decision**: Put them in `apps/marketing/src/components/dataDisplay/{stat,chart,scale,map,table}` with stories in `apps/marketing-storybook`.
  - Generic props (labels, values, series, a highlight key, a band function, `interactive`, `size: 'default' | 'print'`, `emptyLabel`) and nothing specific to this report.
  - The Map takes `regions: {code, label, value, fill, href}[]` over the generated US paths (R4). The State Gap Map is left alone; it's retired separately.
  - Print uses `@media print` and letter-size page containers (`8.5in × 11in`, `break-after: page`). The repo has no print styles yet, so these are scoped to the report.

## Build notes (2026-11-09, `/speckit.implement`)

Decisions made during the build that change or sharpen the sections above:

- **R3 spike result**: MUI X Charts 8.29.3 renders bars as SVG on the server only at a fixed `width` and `height` (a responsive chart renders empty until measured). Charts use a fixed design size scaled to the container by CSS (`ChartFrame`). MUI X already follows `prefers-reduced-motion`; print sets `skipAnimation`. Keyboard navigation uses `enableKeyboardNavigation`. Legend toggling is not used: legends are our own HTML. Bundle cost (first-load JS from the build): overview 149 kB, rankings 150 kB, state page 258 kB, printable report 259 kB, against 528 kB for an Experience page. MUI X accounts for most of the state page's extra ~110 kB.
- **Pie is first-party SVG, not MUI X**: MUI X's pie caused a hydration mismatch (a label coordinate differed in the last float digit between Node and the browser). A pie is a few arcs, so it's server-rendered with rounded coordinates and ships no JS.
- **Fetch failures throw (R5 changed)**: `getReport()` returns null only when there's no client or no entry. A failed fetch rethrows, because a 404 during ISR revalidation would replace the cached page during a Contentful outage; an error keeps the stale page.
- **Map links are SVG `<a>` elements**, not `role="link"` paths: focusable, Enter-to-follow and middle-click without JS. DC's shape is aria-hidden; its callout is the one focusable DC link. The client island uses event delegation, so the 19 KB (gzipped) path data never ships in JS.
- **AA fixes vs the prototype**: white text on the blue and orange score heroes was ~3:1, so those heroes use the dark tier shades; small tier-coloured text uses the dark shades too (`TIER_TEXT_COLORS`). Bars and large score numerals keep the mid shades (≥3:1). All pairs are in `dataDisplay/__tests__/contrast.test.ts`.
- **Printable page 1 omits the narratives** so the profile fits one sheet; all four narratives are on page 5 (two columns). With four 955-character narratives, page 5 can still spill to a second sheet: check with real copy in T043.
- **Senior cohort** shows the women's share as text rather than a pie, since the data has no men's share and the site doesn't derive one.
- **Theme gotchas**: the Code.org theme gives MUI `Link` a 16px bottom margin and sets absolute line-heights on body text, so report components set `m: 0` on links and relative line-heights.

## Site-design rebuild (2026-11-10, Dee)

Dee asked for the site's own components and branding over prototype parity. Everything except the charts, the map and the bar/segment graphics now uses our building blocks:

- **Layout**: each page is a stack of our `Section`s (Purple Light hero, white and Gray 1 bands, Gray 1 footer). Content blocks are plain panels with the `md` radius, no border or shadow. The custom page container, cards, header bars and nav bar are gone.
- **Text**: `Heading` (one h1 per page, `heading-xxl`; h2 `heading-xl`; panel h3s use `heading-lg` with a smaller size override), `Paragraph` for body text, `CustomText` overline and statistic for labels and figures, `Link`, `Button`, `Badge` and `Divider`. `Stat` and `Scale` are rebuilt on these.
- **Client boundary**: those components read the MUI theme and the Section background context but aren't marked `'use client'`, so server components import them through `dataDisplay/brandComponents.ts` (a `'use client'` re-export). They still render on the server.
- **Colour**: only CodeAI tokens. CSS uses the `--codeai-*` variables; SVG attributes and MUI X need literal values, so `dataDisplay/codeaiColors.ts` mirrors them as hex, pinned to `primitiveColors.scss` by a test. Tiers map to colour families (Transformative purple, Developing blue, Emerging orange); the score band is the family's Dark shade, the tier Badge its light appearance. The national-average line is Gray 8 (was red); not-reported fills are Gray 1/2 with a Gray 4 stripe.
- **Labels added**: "Access and Participation" (a section h2 grouping the two panels on the state and rankings pages). Navigation moved into the hero (a back link plus buttons); button labels reuse the prototype's ("Rankings", "Methodology", "View full printable report").
- **Bundle cost**: first-load JS rose to overview 258 kB, rankings 259 kB, state page 364 kB, printable report 365 kB (from 149/150/258/259), because the components hydrate; still under an Experience page's 524 kB.
- **Printable report**: same components at print sizes; bordered panels instead of filled ones (backgrounds may not print), one h1 (page 1). All 8 pages still fit one US Letter sheet on the fixture (page 1 is closest, 1031 of 1056px).

## Prototype bugs not carried over

- `last_updated` always set to the build date.
- Momentum and change figures measured against a stale demo baseline.
- Undefined `genderVals` on `national.html` (we don't build that page).
- The report's all-orange national gender pie.
- `access_subtitle` never rendering (ours shows the per-state access narrative where the prototype intended it).
- Rankings showing "0%" instead of "Not reported".
- Pages counting policies differently: we use developing or transformative wherever counts appear, matching report page 6.

## Open items (not blocking the build)

1. **Blank index inputs** (Policy team thread): defaults to hold back. On today's sheet, that leaves 11 of 51 states without an overall score or rank (R0). This should be decided before launch.
2. **Past reports**: the prototype's archive page links to the 2017–2025 reports on Google Drive. The approved plan dropped the archive as "empty". Decide where those links live: recommended on the methodology Studio page, as content only.
3. **The printable report's deep-dive copy** (report page 5) describes the old leadership points (4/3/3/1.5) and senior-cohort participation, which don't match the code. It's carried unchanged unless the Policy team supplies new copy.
4. **Senior cohort year label**: hard-coded in the code. We keep it as a constant until the Policy team says how it should roll over.
5. **The webhook's content-type filter and `entryId` body**: Dee to confirm (R5). `reportData` in `development` is done.
6. **Pipeline-side items** (R0–R2, R7–R8, the prototype bugs list) go to spec 013's owners through the PR #223 comment.
