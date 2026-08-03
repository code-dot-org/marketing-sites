# Quickstart: Sitewide Typography System

**Feature**: [spec.md](./spec.md) · **Plan**: [plan.md](./plan.md) · **Data model**: [data-model.md](./data-model.md) · **Contracts**: [contracts/](./contracts/)

This guide walks an engineer through implementing the feature locally, verifying it works, and getting it to the point where `/speckit.tasks` can be run.

## TL;DR

1. Branch is already created: `009-typography-system` (off `008-brand-buttons`).
2. Build the token module + theme rewrite first (one PR). Verify Storybook on code.org and **CSforAll baselines diff to zero**.
3. Refactor `Heading.tsx` and `Paragraph.tsx` (same PR or follow-up). Verify.
4. Migrate deprecated corporate-site components (one PR per directory or grouped).
5. Update stories + accept Applitools baselines.

## Step 1 — Build the token module

Create three new files under `apps/marketing/src/themes/code.org/typography/`:

```
typography/
├── tokens.ts          # SCALE_DISPLAY, SCALE_TEXT, WEIGHTS, ROLE_TOKENS (data-model.md + contracts/role-tokens.md + contracts/scale-tokens.md)
├── fontStack.ts       # NOTO_SANS_CHAIN, createCodeOrgFontStack (contracts/font-fallback-chain.md)
└── buildTypography.ts # (theme) → MUI typography options (contracts/role-tokens.md §"Computed MUI variant output")
```

Copy the locked values from [`contracts/role-tokens.md`](./contracts/role-tokens.md) and [`contracts/scale-tokens.md`](./contracts/scale-tokens.md) verbatim.

`buildTypography` should:

- Loop over `ROLE_TOKENS`.
- For each role, look up the desktop cell in `SCALE_DISPLAY` or `SCALE_TEXT` per `track`.
- Emit `{fontFamily, fontWeight: WEIGHTS[token.weight], fontSize, lineHeight, letterSpacing?, ...stepMediaQueries}`.
- For each `(breakpoint, sizeToken)` in `steps`, emit `[theme.breakpoints.down(breakpoint)]: {fontSize, lineHeight}` (and `letterSpacing` if different).
- Run the three invariants (floor, hierarchy, scale completeness) and throw with a descriptive message if any fail.

Add a Jest snapshot test for `buildTypography(createTheme())` output — diff-friendly.

## Step 2 — Rewrite the theme

`apps/marketing/src/themes/code.org/index.ts`:

```ts
'use client';
import {createTheme} from '@mui/material';

import {STYLE_OVERRIDES} from './styleOverrides';
import {createCodeOrgFontStack} from './typography/fontStack';
import {GEIST_FONT} from './constants/fonts';
import {buildTypography} from './typography/buildTypography';

const theme = createTheme({
  cssVariables: true,
  components: STYLE_OVERRIDES,
  shape: {borderRadius: 4},
  typography: buildTypography({
    defaultFontFamily: createCodeOrgFontStack(GEIST_FONT),
  }),
});

export default theme;
```

Delete the inline `h1`–`h6` / `body1`–`body4` / `overline` blocks — they all flow through `buildTypography` now.

**Do NOT modify** `themes/common/constants.tsx` or `themes/csforall/`.

## Step 3 — Refactor Heading.tsx and Paragraph.tsx

Apply the diffs in [`contracts/heading-component-props.md`](./contracts/heading-component-props.md) and [`contracts/paragraph-component-props.md`](./contracts/paragraph-component-props.md).

- `Heading.tsx`: delete `HEADING_RESPONSIVE_SIZE`, remove the hardcoded `font-family: 'Space Grotesk'`, remove default `lineHeight: 1`, remove default `fontWeight: 500`, remove `fontKerning: 'normal'` default. Only emit `sx.fontSize` / `sx.lineHeight` / `sx.fontWeight` / `sx.fontKerning` / `sx.textTransform` / `sx.zIndex` when overrides are explicitly set.
- `Paragraph.tsx`: stop emitting `fontWeight: 400` when `!isStrong`; let the variant's Medium flow through. Replace `fontWeight: 600` literal with `WEIGHTS.semibold` import.

## Step 4 — Update SCSS primitives

`packages/component-library-styles/typography.module.scss` — extend the `:root` block to add the full 8-token Text + Display scales (see [`data-model.md`](./data-model.md) §9). Keep the existing `--font-size-body-*` variables with their existing resolved values.

Verify with `yarn storybook` on `apps/design-system-storybook` that any consumer of `--font-size-body-*` is visually unchanged.

## Step 5 — Migrate deprecated components

Work through the table in [`contracts/deprecated-component-migration.md`](./contracts/deprecated-component-migration.md) file by file. Order: `yourSchool` → `adoptionMap` → `afeEligibility` → `stateGapMap` → `activitiesHero` → `facetBar` → `facetDrawer` → `Card.tsx` → `video/styledMuiComponents`.

For each migration:

- Open the file in Storybook (find the matching story).
- Apply the recipe (Pattern A: replace markup with `<Heading>`/`<Paragraph>`; or Pattern B: replace literal with `var(--font-size-...)`).
- Verify visually.
- Run `yarn jest` and `yarn lint` on the touched workspace.
- Run `yarn prettier --check apps/marketing` per `[[feedback_run_prettier_before_commit]]`.

Hero Banner: find the file first (`find apps/marketing/src/components -iname '*hero*'`), add to the table, migrate.

## Step 6 — Update Storybook stories

`apps/marketing-storybook/stories/`:

- **`Heading.story.tsx`** — add a "Default per level" matrix story (H1–H6 default rendering, side-by-side). Add a "Responsive ladder" story that uses `viewport` controls to show H1–H6 + body at mobile-sm / mobile / tablet / desktop / desktop-lg. Add an "Overrides" story exercising `fontSize` / `lineHeight` / `fontWeight` / `colorOverride`.
- **`Paragraph.story.tsx`** — verify each `visualAppearance` variant renders the new Text-track cell. Add a "Strong/italic" story.
- **`RichText.story.tsx`** — add a mixed h1–h6 + paragraph + inline link story to verify Rich Text inherits canonical defaults.
- **`HeroBanner.story.tsx`** (or wherever Hero Banner has a story) — add a story showing the canonical H1 token; verify after the migration in step 5.

Push the branch, let Applitools diff, accept all baselines in the dashboard.

**Critical**: any csforall-only story showing a diff is a regression. Investigate before accepting.

## Step 7 — Run the gates

```bash
yarn lint            # apps/marketing + packages/component-library-styles
yarn typecheck       # same
yarn jest            # apps/marketing
yarn prettier --check apps/marketing packages/component-library-styles
yarn storybook       # local visual smoke
```

Plus push the branch and let `marketing/storybook-eyes` run on CI. Accept baselines.

## Smoke test — Verify the chain at runtime

In any code.org page:

```bash
# Run the dev server
yarn dev

# Open http://code.org.marketing-sites.localhost:3001/
# DevTools → Elements → click any heading or paragraph
# Computed → font-family should show:
#   Space Grotesk, Noto Sans, Noto Sans Math, Noto Sans Arabic, ..., Noto Sans Thaana, sans-serif
# (or Geist primary for body / paragraph)
```

If the computed font-family ends in just `Space Grotesk, sans-serif` (no Noto Sans), the theme rewrite did not pick up `createCodeOrgFontStack`. Check `themes/code.org/index.ts` is importing from `typography/fontStack.ts`.

## Smoke test — Verify the H1 default

In Storybook, open the Heading "Default — H1" story. The rendered `<h1>` should be:

- `font-family: Space Grotesk, …, sans-serif`
- `font-size: 4.5rem` at desktop (≥ md breakpoint)
- `font-size: 3.75rem` at tablet (sm–md)
- `font-size: 3rem` at mobile (< sm)
- `font-weight: 600`
- `line-height: 5.625rem` at desktop, stepped values at smaller viewports
- `letter-spacing: -0.02em`

Use the "Responsive ladder" Storybook story or DevTools device emulation to verify.

## Smoke test — Verify CSforAll is unchanged

```bash
# Storybook on csforall surfaces
# Open http://csforall.marketing-sites.localhost:3001/... or the csforall Storybook stories
# DevTools → Computed → font-family on a heading should be:
#   Geist, sans-serif  (NOT Geist, Noto Sans, ...)
```

If csforall stories show the Noto Sans chain, the shared file change leaked into csforall — investigate `themes/common/constants.tsx` and `themes/csforall/index.ts`.

## Commit / PR

Per memory `[[feedback_no_claude_attribution]]`, `[[feedback_no_test_plan_in_pr]]`, `[[feedback_no_push_without_approval]]`, `[[feedback_concise_comments]]`:

- Commits look human-authored (no Co-Authored-By, no "Generated with Claude" footer).
- PR body is summary bullets only; **no `## Test plan` section**.
- Do NOT push without explicit user approval. Especially not to `main`.
- Keep commit messages short — focus on the "why".

## Ready for `/speckit.tasks`

After this quickstart is internalized:

- The token module / theme rewrite is one logical task group.
- The Heading.tsx + Paragraph.tsx refactor is another.
- Each deprecated component migration is its own task.
- Storybook stories + Applitools baseline acceptance is its own task.
- Hero Banner discovery + migration is a discrete task.

Run `/speckit.tasks` to generate the dependency-ordered task list.
