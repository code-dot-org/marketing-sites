# Quickstart: Brand Color System Initialization

**Feature**: 006-brand-color-system-init
**Audience**: Engineer picking up implementation, reviewer validating a slice has shipped correctly, or QA reproducing the user stories.

## Prerequisites

- Local dev environment per repo README: Node + Yarn installed, `yarn install` at repo root, Turborepo available.
- A working multi-tenant local dev URL setup: `http://code.org.marketing-sites.localhost:3001` and `http://csforall.marketing-sites.localhost:3001` resolvable (per existing `apps/marketing` README).
- Storybook running locally for the marketing layer: from repo root, `yarn workspace marketing-storybook dev` (confirm exact script name in `apps/marketing-storybook/package.json`).

## Verify User Story 1 — Palette visible in dropdowns

1. Open Storybook at the local URL emitted by the dev script.
2. Navigate to the Heading story. Open the `color` control in the Storybook controls panel.
3. **Expect**: dropdown lists all 22 brand color values (`black`, `white`, plus 5 families × 4 shades), in addition to any legacy entries kept for backward compatibility.
4. Pick `purplePrimary`. **Expect**: the heading renders at `#4C42CF`.
5. Repeat for Paragraph, Text Link, Simple List, and the Container/Section stories — confirm the same 22 options appear and render.
6. Open the local marketing app at a page that uses any of these components. Open Contentful Studio (preview environment), edit a Heading entry, and confirm the same 22 options appear in the color dropdown.

If a component renders a stale six-entry dropdown, the consumer has bypassed `BRAND_COLOR_OPTIONS` and inlined its own list — fix at the source.

## Verify User Story 2 — Contrast switch applied

The matrix below covers every row of the rule table. Each row corresponds to one Storybook story or one preview-page combination.

| Setup                                                                        | Expected rendered text color                                              |
| ---------------------------------------------------------------------------- | ------------------------------------------------------------------------- |
| Heading `color = "black"` inside a Section `background = "purpleDark"`       | `#FFFFFF` (white)                                                         |
| Heading `color = "black"` inside a Section `background = "purplePrimary"`    | `#FFFFFF`                                                                 |
| Heading `color = "white"` inside a Section `background = "purpleDark"`       | `#FFFFFF` (passthrough — already contrasting)                             |
| Heading `color = "purpleMid"` inside a Section `background = "purpleLight"`  | `#1F1976` (Purple Dark — text family shifts to its `*-dark` shade)        |
| Heading `color = "greenLight"` inside a Section `background = "purpleLight"` | `#003F25` (Green Dark — cross-family shift to text's own family `*-dark`) |
| Heading `color = "purpleMid"` inside a Section `background = "purpleMid"`    | `#4C42CF` (Purple Primary — text family shifts to `*-primary`)            |
| Heading `color = "pinkLight"` on a Section `background = "white"`            | `#E62378` (Pink Primary — shift to `*-primary` on white background)       |
| Heading `color = "white"` inside a Section `background = "purpleLight"`      | `#000000` (Black — white text on any light background flips to black)     |
| Heading `color = "white"` on a Section `background = "white"`                | `#000000`                                                                 |
| Heading `color = "purpleDark"` inside a Section `background = "purpleLight"` | `#1F1976` (passthrough — text already dark on light background)           |
| Heading `color = "purplePrimary"` on a Section `background = "white"`        | `#4C42CF` (passthrough)                                                   |

**Verify nested resolution**: Place a Container with `background = "purpleLight"` inside a Section with `background = "purpleDark"`. A Heading with `color = "purpleMid"` placed inside the Container renders `Purple Dark` (the Container background wins).

**Verify "no enclosing background"**: A Heading with `color = "purpleMid"` rendered at the page root (no Section/Container ancestor) renders `Purple Primary` — the page root defaults to `tone='mid'`, `family='white'`, equivalent to a white background.

## Verify User Story 3 — `colorOverride` short-circuits the switch

1. In Storybook, open the Heading story.
2. Set the Section background to `purpleLight`.
3. Set the Heading `color` to `white`.
4. Set the Heading `colorOverride` to `#FFFFFF`.
5. **Expect**: heading renders white on the light background (the override defeats the switch). Without the override, FR-010 would force it to black.
6. Repeat with Paragraph.

If `colorOverride` is empty or unset, the switch applies normally.

## Verify Existing-Content Pass-Through (SC-003)

1. Pick three current production marketing pages that use Heading/Paragraph with existing color values (e.g. `purple`, `primary`).
2. Render them in the preview environment before and after this feature ships.
3. **Expect**: pixel-identical output, with one exception — any usage of the Primary font default on a Dark/Primary/Black section background switches from rendering `neutral-black` (current bug) to rendering white. This is the only intentional visible change.

## Verify csforall is unchanged (Tenant Scope)

This feature targets the code.org tenant. csforall must render unchanged.

1. Visit `http://csforall.marketing-sites.localhost:3001` on a representative page that includes the custom Section.
2. **View page source on a Section element**: confirm **NO `data-bg-tone` attribute** is rendered. csforall background values (`brandPrimary`, `brandSecondary`, etc.) are not in the new CodeAI token set, so the value-space guard suppresses the attribute.
3. **Pixel-diff representative csforall pages against `main`**: should be identical.
4. **Open a csforall Heading entry in Contentful Studio**: the dropdown WILL show the new 22 brand options. This is expected under soft isolation. Confirm csforall content does not select any of them and that existing csforall entries continue to render with their previous color values.
5. **Inspect the CSS payload on a csforall page**: the new `--codeai-{family}-{shade}` variable declarations are present in the loaded SCSS. This is expected — they are inert because no csforall component references them.

## Verify Rich Text behavior (FR-016)

1. Open a Rich Text story in Storybook.
2. Render it inside a Section with `background = "purpleDark"`.
3. **Expect**: body text renders white (resolved through the contrast switch as if its authored color were black).
4. Render the same Rich Text inside a Section with `background = "purpleLight"`.
5. **Expect**: body text renders black.
6. Confirm inline links inside the Rich Text retain their existing link color (not routed through the brand-color switch).

## Run the test suite

- **Unit**: `yarn workspace marketing test` (or the workspace's `test` script) — exercises every row of `ContrastSwitchRule` against the fixtures embedded in `contracts/contrast-switch-rule.schema.json`. Add new test cases there if new rows are introduced.
- **Lint + typecheck**: `yarn lint && yarn typecheck` from the marketing workspace.
- **Storybook visual regression**: push the branch and let the existing `marketing/storybook-eyes` CI step run. New stories will surface diffs that require baseline acceptance in the Applitools dashboard — this is expected, not a failure.
- **Marketing Storybook CI**: confirm the `marketing-storybook` workflow passes per `apps/marketing-storybook/` configuration.

## Pre-commit reminder

Run `yarn prettier` (or `prettier --check`) on all touched workspaces before `git commit`. The repo's pre-commit hook is non-executable in this clone, and the project's memory notes that CI's prettier check has failed twice in the past on missed formatting.

## Out-of-scope reminders (do NOT do these in this slice)

- Do not migrate Overline to the shared manifest.
- Do not consolidate the CS for All / Corporate Section background lists.
- Do not add color options to Button, Divider, or any component that does not already expose one.
- Do not introduce a nested MUI ThemeProvider.
- Do not change SEO metadata, cache headers, or routing.
- Do not perform Contentful writes; do not change Contentful field types.
