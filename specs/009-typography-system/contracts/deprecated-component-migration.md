# Contract: Deprecated Component Migration

**Feature**: [spec.md](../spec.md) · **Plan**: [plan.md](../plan.md) · **Research**: [research.md](../research.md) §R8 · **Spec**: FR-012 / US2 / SC-006

Per-file migration recipes for the **code.org-only** deprecated components that currently hardcode typography (font-family / font-size / font-weight / line-height) and bypass the canonical role tokens. Each recipe states what to change and what to verify.

## Scope rule

In scope for this spec: components in `apps/marketing/src/components/contentful/corporateSite/**` and `apps/marketing/src/components/contentful/activityCatalog/**` that hardcode type and render on code.org marketing pages.

Out of scope (deferred follow-up): atomic / shared components in `packages/component-library/` and `apps/marketing/src/components/contentful/{card,video}/` that ship to BOTH tenants. Migrating those risks csforall visual drift; gate each file behind a csforall Applitools diff = 0 in a separate spec.

## Migration patterns

Two strategies, picked per call site:

- **Pattern A — Replace with MUI variant**: when the hardcoded value visibly approximates a Heading or Paragraph default, replace the markup with `<Heading visualAppearance="...">` or `<Paragraph visualAppearance="...">`. Inherits the canonical default automatically.
- **Pattern B — Replace literal with CSS variable**: when the call site is inside a `.module.scss` file and rewriting the markup is impractical, replace the literal `font-size: <rem>` with `font-size: var(--font-size-<track>-<size>)` from the extended `packages/component-library-styles/typography.module.scss`. Same `font-weight` swap to `var(--mui-typography-h{N}-fontWeight)` or to the existing `font.$semi-bold-font-weight` etc. mixin.

## Per-file recipes

### `corporateSite/yourSchool/yourSchool.module.scss`

| Line | Current                     | Migration                                                                                                                                                                                        |
| ---- | --------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| L143 | `font-size: 2rem`           | **Pattern B**: `font-size: var(--font-size-display-md)` if it's a stat/heading label; verify alignment with Heading h4 (2.25rem) — if visual intent matches h4, use Pattern A on the parent JSX. |
| L173 | `font-size: 1.25rem`        | **Pattern B**: `font-size: var(--font-size-text-xl)`                                                                                                                                             |
| L232 | `font-size: 0.875rem`       | **Pattern B**: `font-size: var(--font-size-text-sm)`                                                                                                                                             |
|      | `line-height: 1.4` / `1.54` | Drop unitless line-heights and let the Text/Display token's line-height flow via MUI variants — OR keep explicit if a tight design value is intended. Mark in PR review.                         |

### `corporateSite/adoptionMap/adoptionMap.module.scss`

| Line | Current                                    | Migration                                                           |
| ---- | ------------------------------------------ | ------------------------------------------------------------------- |
| L31  | `font-size: 0.75rem`                       | **Pattern B**: `font-size: var(--font-size-text-xs)`                |
| L96  | `font-size: 0.75rem`                       | **Pattern B**: `font-size: var(--font-size-text-xs)`                |
| L48  | `font-weight: font.$semi-bold-font-weight` | **No change** — already routes through the font.scss mixin (= 600). |
|      | `line-height: 1.64`                        | Drop or keep at PR review.                                          |

### `corporateSite/adoptionMap/adoptionMap.scss`

| Line | Current             | Migration                                                                                                                                                                  |
| ---- | ------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| L18  | `font-size: 1.5rem` | **Pattern B**: `font-size: var(--font-size-text-2xl)` (= 1.5rem; same value, semantic naming).                                                                             |
| L19  | `line-height: 0.55` | **Likely a typo** per fork-agent flag. Confirm with original author; if a bug, fix to a sensible unitless value (e.g. `1.2`) or drop and let the token's line-height flow. |

### `corporateSite/afeEligibility/afeEligibility.module.scss`

| Line | Current               | Migration                                                                                                                                                                                                                                                                                                         |
| ---- | --------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| L26  | `font-size: 1rem`     | **Pattern B**: `font-size: var(--font-size-text-md)`                                                                                                                                                                                                                                                              |
| L148 | `font-size: 0.625rem` | **Below Text xs (0.75rem)** — out-of-scale value. Recommend clamping to `var(--font-size-text-xs)` per the spec's "no sub-1rem heading" rule (this call site is body-tier, but consistency favors the scale). Document the visible ~20% growth in the PR. Alternative: introduce a Text-xxs token in a follow-up. |
| L147 | `font-weight: 500`    | **Pattern B**: replace literal with the SCSS mixin `@include font.main-font-medium;` OR keep `500`. Equivalent.                                                                                                                                                                                                   |

### `corporateSite/stateGapMap/StateGapMapPanel.tsx`

| Line | Current            | Migration                                                                                                                                                                                                             |
| ---- | ------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| L41  | `fontWeight={700}` | **Pattern A**: wrap text in `<Paragraph isStrong>` (Semibold = 600) **OR** keep `fontWeight={700}` if the design genuinely calls for Bold. Decision per call site — if Bold is correct, document in the migration PR. |

### `activityCatalog/activitiesHero.tsx`

| Line | Current                                                                                   | Migration                                                                                                                                                                                                                                                                                                                          |
| ---- | ----------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| L29  | `fontSize: {xs: 36, md: 50}` **in px** — invalid in MUI `sx` (defaults to px when number) | **Pattern A**: replace with `<Heading visualAppearance="heading-xxl">` (H1) which now resolves to Display 2xl (72px desktop, 60px tablet, 48px mobile) — visually larger but on the canonical ladder. If the prior 50px max is a hard requirement, use `<Heading ... fontSize={3.125}>` (3.125rem = 50px). Coordinate with design. |
| L30  | `fontWeight: 800`                                                                         | **Extra Bold (800) is not in the 4-weight ladder.** Drop to `fontWeight: 700` (Bold) unless design specifically requires 800. Document the change in PR review.                                                                                                                                                                    |

### `activityCatalog/facetBar/facetBar.tsx` (L126)

| Current           | Migration                                                                                                                                  |
| ----------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| `fontWeight: 600` | **Pattern A**: if a label, use `<Paragraph isStrong>`; if a heading, use `<Heading>` and let the variant carry it. Decision per call site. |
| `fontWeight: 700` | Same — use Heading variant if heading, else keep `700`.                                                                                    |

### `activityCatalog/facetDrawer/facetDrawer.tsx` (L47, L100)

Same as facetBar — replace with `<Paragraph isStrong>` / `<Heading>` per semantic role.

### `contentful/video/videoComponents/styledMuiComponents/index.ts` (L84)

| Current            | Migration                                                                                                                                                                                                      |
| ------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `fontSize: '3rem'` | **Pattern B inside styled component**: route to `theme.typography.h3.fontSize` (= 3rem / Display lg). Use the MUI `styled` `({theme}) => ({...})` form to consume the token. Eliminates the hardcoded literal. |

### `contentful/card/Card.tsx` (L155)

| Current               | Migration                                                                                                                                                                                     |
| --------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `fontWeight="bolder"` | **Pattern A**: replace with `<Paragraph isStrong>` (= 600) which is consistent across browsers. `"bolder"` is browser-relative — produces different rendered weights depending on the parent. |

## Hero Banner

The spec calls out Hero Banner as a US2 / FR-012 target. The fork-agent inventory did NOT surface a `heroBanner.module.scss` or equivalent in this pass. **Action in `/speckit.tasks`**: run `find apps/marketing/src/components -iname '*hero*'` and either:

- Add the discovered file to this recipe table with concrete line-by-line migrations.
- Mark Hero Banner as "no longer present in the code.org code.org-only scope; remove from FR-012 scope" if no current code.org file matches.

## Validation per migration

For each migrated file:

1. **Storybook check**: open the corresponding story (if any) in `apps/marketing-storybook` and verify the rendered output still looks reasonable (Storybook-eyes baseline will diff; manual acceptance OK if intentional).
2. **JSDOM unit test** (if a `__tests__` directory exists): add a smoke test asserting the rendered element no longer has any inline `font-size: <px>` style.
3. **Live preview check**: load the affected page in `http://code.org.marketing-sites.localhost:3001/...` and verify no broken layout. Worth doing once per migrated file.
4. **CSforAll regression check**: confirm the same file does NOT render on csforall. (All files in this contract are under `corporateSite/` or `activityCatalog/` which are code.org-only entry types.) If a file DOES render on csforall (e.g. a shared util pulled in transitively), STOP and treat the migration as out-of-scope per the opt-in rule.

## Acceptance criteria (across all migrated files — SC-006)

- Zero remaining `font-size: <px or rem literal>` declarations in migrated files that conflict with the role tokens.
- Zero remaining `font-weight: <numeric literal>` declarations in migrated files that don't match a canonical weight (regular/medium/semibold/bold).
- Editing any role token (e.g. H1) in `apps/marketing/src/themes/code.org/typography/tokens.ts` updates the rendered output of every migrated file that uses the equivalent variant — verified by Storybook playground or a manual visual change to the token followed by a rebuild.

## Out of contract

- Shared atomic component-library migrations — separate spec.
- Migrating any csforall-only file — DO NOT TOUCH.
- Rewriting the deprecated component's logic, layout, or features — typography-only scope.
