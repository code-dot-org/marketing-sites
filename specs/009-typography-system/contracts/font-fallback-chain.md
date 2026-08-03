# Contract: Font Fallback Chain (Noto Sans i18n cascade)

**Feature**: [spec.md](../spec.md) · **Plan**: [plan.md](../plan.md) · **Research**: [research.md](../research.md) §R7

## Goal

Re-introduce the 21-variant Noto Sans i18n fallback chain — present at commit `984a9f05` (2025-06-27, pre-CSforAll refactor) — into the **code.org** MUI font-family cascade, so mixed-script content (Latin + Arabic + CJK + Devanagari + …) renders in a coherent typographic style instead of the browser default. The chain is **already canonicalized in SCSS** at `packages/component-library-styles/font.scss:12-17` — this contract mirrors it to TS.

## Module shape

`apps/marketing/src/themes/code.org/typography/fontStack.ts` exports:

```ts
import {GEIST_FONT, SPACE_GROTESK_FONT} from '../constants/fonts';

/**
 * The Noto Sans i18n cascade — 20 variants covering Latin, RTL, CJK, Indic, and other scripts.
 * Mirrors $noto-sans-fonts in packages/component-library-styles/font.scss:12-17.
 * Order matters: script-specific variants come first so the browser picks them up
 * before falling through to the Latin-only generic Noto Sans.
 */
export const NOTO_SANS_CHAIN = [
  'Noto Sans',
  'Noto Sans Math',
  'Noto Sans Arabic',
  'Noto Sans Armenian',
  'Noto Sans Bengali',
  'Noto Sans SC',
  'Noto Sans TC',
  'Noto Sans Devanagari',
  'Noto Sans Georgian',
  'Noto Sans Hebrew',
  'Noto Sans JP',
  'Noto Sans Kannada',
  'Noto Sans Khmer',
  'Noto Sans KR',
  'Noto Sans Myanmar',
  'Noto Sans Sinhala',
  'Noto Sans Tamil',
  'Noto Sans Telugu',
  'Noto Sans Thai',
  'Noto Sans Thaana',
] as const;

/**
 * Compose the code.org font-family cascade for the given primary family.
 * Used for both the Text track (primary = Geist) and the Display track (primary = Space Grotesk).
 * NOT used by csforall — csforall continues to use createFontStack from themes/common/constants.tsx.
 */
export const createCodeOrgFontStack = (primary: string): string =>
  [primary, ...NOTO_SANS_CHAIN, 'sans-serif'].join(', ');
```

## Resolved stacks (this is what ends up in computed style)

**Text track**:

```
Geist, Noto Sans, Noto Sans Math, Noto Sans Arabic, Noto Sans Armenian, Noto Sans Bengali, Noto Sans SC, Noto Sans TC, Noto Sans Devanagari, Noto Sans Georgian, Noto Sans Hebrew, Noto Sans JP, Noto Sans Kannada, Noto Sans Khmer, Noto Sans KR, Noto Sans Myanmar, Noto Sans Sinhala, Noto Sans Tamil, Noto Sans Telugu, Noto Sans Thai, Noto Sans Thaana, sans-serif
```

**Display track**:

```
Space Grotesk, Noto Sans, Noto Sans Math, Noto Sans Arabic, …, Noto Sans Thaana, sans-serif
```

Both stacks differ **only in the first family**. Every other entry is identical.

## Theme integration

`apps/marketing/src/themes/code.org/index.ts`:

```ts
import {createTheme} from '@mui/material';
import {buildTypography} from './typography/buildTypography';
import {createCodeOrgFontStack} from './typography/fontStack';
import {GEIST_FONT} from './constants/fonts';
import {STYLE_OVERRIDES} from './styleOverrides';

const theme = createTheme({
  cssVariables: true,
  components: STYLE_OVERRIDES,
  shape: {borderRadius: 4},
  typography: palette =>
    buildTypography({defaultFontFamily: createCodeOrgFontStack(GEIST_FONT)}),
  //                ^ buildTypography also internally composes the Display stack
  //                  for h1–h6 via createCodeOrgFontStack(SPACE_GROTESK_FONT)
});

export default theme;
```

## What stays untouched

- `apps/marketing/src/themes/common/constants.tsx` — `createFontStack` keeps emitting `${font}, sans-serif`. CSforAll's theme keeps consuming it.
- `apps/marketing/src/themes/csforall/` — every file. No font-family changes on the csforall tenant.
- `packages/component-library-styles/font.scss` — `$noto-sans-fonts` list and weight mixins. Already canonical.
- `packages/fonts/` — entire workspace. No new `@font-face` declarations. Per-locale Noto Sans loading via `FontLoader` is unchanged.

## Acceptance criteria

**Static**:

1. `NOTO_SANS_CHAIN.length === 20`.
2. `NOTO_SANS_CHAIN[0] === 'Noto Sans'` (Latin first within the cascade).
3. `NOTO_SANS_CHAIN[NOTO_SANS_CHAIN.length - 1] === 'Noto Sans Thaana'` (last).
4. The TS chain matches the SCSS `$noto-sans-fonts` list 1:1 in name AND order (snapshot test reads `font.scss` at test time OR a comment in `fontStack.ts` cross-references the line range).
5. `createCodeOrgFontStack('Geist').startsWith('Geist, Noto Sans,')` and `.endsWith(', sans-serif')`.
6. `createCodeOrgFontStack('Space Grotesk').startsWith('Space Grotesk, Noto Sans,')` and `.endsWith(', sans-serif')`.

**Runtime**:

7. `<Heading>` computed-style includes the full chain.
8. `<Paragraph>` computed-style includes the full chain.
9. CSforAll Storybook stories show NO `Noto Sans` in their computed font-family (still bare `Geist, sans-serif` etc.) — confirms isolation.

## Notes

- **Why 20 variants here when the prior commit had 21?** The prior commit included `Figtree` as the primary (counted as 1) + 20 Noto Sans + `sans-serif` = 22 entries. This contract counts ONLY the Noto Sans portion (20) and composes the rest via `createCodeOrgFontStack`. The total stack length is 22 (1 primary + 20 Noto + 1 sans-serif) — same as the prior commit minus the Figtree→Geist swap.
- **`Noto Sans Math` placement**: kept second (right after Latin Noto Sans), matching the prior commit. Math glyphs are rare in marketing content but the chain order should match historical behavior for any edge case.
- **No `Noto Sans Hebrew` lazy-load locale mapping today**: the per-locale resolver in `packages/fonts/src/constants.ts` lists `he-IL` → `Noto Sans Hebrew`, but Hebrew is also one of the chain entries — meaning even when the per-locale resolver hasn't loaded a Hebrew variant for a non-Hebrew page, the chain still references the name. The browser falls through to a system-installed Noto Sans Hebrew if available. Same applies to Armenian, Georgian, Thaana, etc.
