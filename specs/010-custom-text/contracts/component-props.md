# Contract: CustomText React component props

`apps/marketing/src/components/contentful/customText/CustomText.tsx`

```ts
import {ReactNode} from 'react';
import {BrandColor} from '@/components/common/colors';
import {SizeToken} from '@/themes/code.org/typography/tokens';

export type CustomTextType =
  | 'custom'
  | 'subtitle'
  | 'overline'
  | 'statistic'
  | 'courseTopics'
  | 'courseLabs';

export type CustomTextTag = 'span' | 'p' | 'div' | 'label';
export type CustomTextFontTrack = 'text' | 'display';
export type CustomTextTransform =
  | 'none'
  | 'uppercase'
  | 'lowercase'
  | 'capitalize';

export type CustomTextProps = {
  /** Text content. */
  children: ReactNode;

  /** Preset that supplies all default style values. Defaults to 'custom'. */
  type?: CustomTextType;

  // --- Per-property overrides. `undefined`/'default' = use the type default. ---
  /** Semantic element override. Default tag is per-type ('span', or 'p' for subtitle). */
  htmlTag?: CustomTextTag;
  /** Text color token. Contrast-switches vs. Section bg unless a background is set. */
  color?: BrandColor;
  /** Background fill token. When set: enables the 2px border and disables contrast switch. */
  backgroundColor?: BrandColor;
  /** Border color token. Only effective when a background is present. Width is fixed 2px. */
  borderColor?: BrandColor;
  /** Theme size step on the resolved track. */
  textSize?: SizeToken;
  /** Font track → font stack (Geist vs. Space Grotesk). */
  font?: CustomTextFontTrack;
  /** Weight override. */
  fontWeight?: '400' | '500' | '600' | '700';
  /** Case transform; 'none' treated as unset. */
  textTransform?: CustomTextTransform;
  /** Leading icon (Font Awesome v6 name). Takes precedence over iconNameRight. */
  iconNameLeft?: string;
  /** Trailing icon (Font Awesome v6 name). Ignored if iconNameLeft is set. */
  iconNameRight?: string;

  /** ClassName injected by Contentful native styling (cfTextAlign/cfMaxWidth). */
  className?: string;
};
```

## Behavioral contract

- Selecting `type` alone produces a finished element; every override is optional and isolated (setting one leaves the others at their type default — FR-004).
- `htmlTag` maps to MUI `<Typography component={tag} variant="inherit">`. Default `span`; `subtitle` defaults to `p`.
- Text color: background present → `cssVarForBrandColor(color)`; otherwise `resolvedCssVarForBrandColor(color, useSectionBackground())` (FR-007).
- Background present → wrap in `<Box>` with fill + `2px solid <borderColor>`; no border-width control exists (FR-008). No background → no wrapper/border.
- At most one icon renders (left wins). Icon glyph color = `currentColor`, inheriting the resolved text color (FR-009).
- Pure render; no client data fetch; only `useSectionBackground` context consumed (same as Heading/Paragraph/Icon).

## Resolver contract

```ts
// resolveCustomTextStyles.ts — pure, unit-tested.
export const resolveCustomTextStyles: (args: {
  type: CustomTextType;
  htmlTag?: CustomTextTag;
  color?: BrandColor;
  backgroundColor?: BrandColor;
  borderColor?: BrandColor;
  textSize?: SizeToken;
  font?: CustomTextFontTrack;
  fontWeight?: '400' | '500' | '600' | '700';
  textTransform?: CustomTextTransform;
  iconNameLeft?: string;
  iconNameRight?: string;
  enclosingBackground?: import('@/components/common/colors').EnclosingBackground;
}) => {
  tag: CustomTextTag;
  sx: Record<string, unknown>;
  resolvedColor: string;
  background: {backgroundColor: string; border: string} | null;
  icon: {name: string; side: 'left' | 'right'} | null;
};
```
