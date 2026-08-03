# Quickstart: Custom Text component

## What it is

A single Contentful component for any non-heading, non-body inline text (overlines, subtitles, statistics, course-topic/lab chip labels). Pick a **type** for instant defaults; override individual properties (color, background, size, font, weight, tag, icon) without losing the other defaults.

## Build order (incremental, by user story)

1. **US1 — Type + defaults**: `resolveCustomTextStyles` with `CUSTOM_TEXT_TYPE_DEFAULTS`; `CustomText.tsx` rendering `<Typography component={tag} variant="inherit" sx={...}>`; the `type` dropdown in the definition. Ship-able with all six types defaulting correctly (Subtitle → `<p>`).
2. **US2 — Overrides**: add the per-property override fields; resolver layers each over the type default (one dimension each, `default` sentinel = inherit).
3. **US3 — Background + contrast**: background/border resolution (2px fixed) + contrast-switch bypass when backgrounded; `<Box>` wrapper.
4. **US4 — Icon**: `iconNameLeft`/`iconNameRight`, left-wins, `FontAwesomeV6Icon` with `currentColor`.

## Key reuse (do not reinvent)

| Need                      | Use                                                                                                                      |
| ------------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| Polymorphic tag           | MUI `<Typography component={tag}>` (no `as` prop in this repo)                                                           |
| Size + line-height        | `SCALE_TEXT` / `SCALE_DISPLAY` cells from `themes/code.org/typography/tokens`                                            |
| Font stacks               | `CODE_ORG_TEXT_FONT_STACK` / `CODE_ORG_DISPLAY_FONT_STACK` from `…/typography/fontStack`                                 |
| Text color + contrast     | `resolvedCssVarForBrandColor(color, useSectionBackground())`; bypass with `cssVarForBrandColor(color)` when backgrounded |
| Color dropdowns           | `brandTextColorOptions(...)`, `brandColorOptionsWithDefault(...)` from `components/common/colors`                        |
| Icon glyph                | `@code-dot-org/component-library/fontAwesomeV6Icon`, color `inherit`/`currentColor`                                      |
| Definition + registration | model on `HeadingContentfulDefinition.ts`; register in `contentful/registration/code.org/index.ts`                       |

## Verify

- **Jest** (`resolveCustomTextStyles.test.ts`): each type's defaults; each override changes only its dimension; `default` sentinel restores type default; Subtitle `<p>` + tag override; contrast applied with no bg vs. bypassed with bg; icon left-wins; both-empty → no icon.
- **Storybook** (`apps/marketing-storybook`): one story per type; an override-matrix story; backgrounded/bordered + icon-left + icon-right variants; each rendered on a light and a dark mocked Section background. Run the marketing-storybook CI path + storybook-eyes; accept new visual baselines in the Applitools dashboard.
- **Studio**: after the Contentful type is human-applied, confirm the component renders in the Studio iframe with grouped fields and correct defaults.

## Gotchas

- Run `yarn prettier` on touched packages before committing (CI prettier check has bitten this repo before).
- Border width is fixed 2px — do **not** add a width field.
- The existing standalone `Overline` component is intentionally untouched; the "Overline" type only reproduces its role-token values.
- Contentful MCP must be connected and the schema human-applied before wiring the definition — planning could not confirm the live schema.
