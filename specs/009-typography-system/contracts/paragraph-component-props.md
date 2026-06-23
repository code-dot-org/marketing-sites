# Contract: Paragraph Component (React + Contentful API after refactor)

**Feature**: [spec.md](../spec.md) · **Plan**: [plan.md](../plan.md) · **Data model**: [data-model.md](../data-model.md) §8b / §8c · **Spec amendment**: 2026-06-23 — widened `visualAppearance` enum

**Files**:

- `apps/marketing/src/components/contentful/paragraph/Paragraph.tsx`
- `apps/marketing/src/components/contentful/paragraph/ParagraphContentfulDefinition.ts`
- `apps/marketing/src/components/contentful/paragraph/resolveParagraphStyles.ts` (NEW helper)

## Goal of the refactor

Widen the existing `visualAppearance` enum from 4 legacy values to 12 (4 legacy + 8 new Text cells), each carrying its canonical role-token default. The component continues to honor `isStrong` / `isItalic` / `colorOverride` / `textTransform` / `sx` as top-precedence individual overrides.

## Contentful ComponentDefinition delta

`ParagraphContentfulDefinition.ts` — widen the existing `visualAppearance.validations.in` array. defaultValue and field shape unchanged.

```ts
visualAppearance: {
  displayName: 'Visual Appearance',
  type: 'Text',
  defaultValue: 'body-two',                   // unchanged
  group: 'style',
  validations: {
    in: [
      // Legacy values — keep for back-compat. Rendered styles unchanged.
      {value: 'body-one', displayName: 'Body L'},
      {value: 'body-two', displayName: 'Body M'},
      {value: 'body-three', displayName: 'Body S'},
      {value: 'body-four', displayName: 'Body XS'},
      // New Text scale, largest-first within the new cells.
      {value: 'text-4xl', displayName: 'Text 4xl'},
      {value: 'text-3xl', displayName: 'Text 3xl'},
      {value: 'text-2xl', displayName: 'Text 2xl'},
      {value: 'text-xl',  displayName: 'Text xl'},
      {value: 'text-lg',  displayName: 'Text lg'},
      {value: 'text-md',  displayName: 'Text md'},
      {value: 'text-sm',  displayName: 'Text sm'},
      {value: 'text-xs',  displayName: 'Text xs'},
    ],
  },
},
```

No content-type schema migration. Studio sees the 12 enum values immediately after deploy.

## React props (after refactor)

```ts
type ParagraphVisualAppearanceValue =
  // Legacy
  | 'body-one' // → Text lg Medium (Medium = body-one's legacy weight)
  | 'body-two' // → Text md Medium (LOCKED body default)
  | 'body-three' // → Text sm Regular
  | 'body-four' // → Text xs Regular
  // New
  | 'text-4xl' // → Text 4xl Medium
  | 'text-3xl' // → Text 3xl Medium
  | 'text-2xl' // → Text 2xl Medium
  | 'text-xl' // → Text xl Medium
  | 'text-lg' // → Text lg Medium
  | 'text-md' // → Text md Medium
  | 'text-sm' // → Text sm Regular
  | 'text-xs'; // → Text xs Regular

type ParagraphProps = {
  children: ReactNode;
  visualAppearance?: ParagraphVisualAppearanceValue;
  isStrong?: boolean;
  isItalic?: boolean;
  color?: BrandColor | LegacyParagraphColor;
  colorOverride?: string;
  textTransform?: 'none' | 'uppercase' | 'lowercase' | 'capitalize';
  className?: string;
  removeMarginBottom?: boolean;
  sx?: React.CSSProperties;
};
```

`visualAppearance` default stays `'body-two'`.

## Behavioral contract

`resolveParagraphStyles({visualAppearance, isStrong, isItalic})` returns `{variantTag, sx}` per data-model §8c. The component then renders:

```tsx
<Typography
  className={classNames(legacyClassName, className)}
  variant={variantTag}
  gutterBottom={!removeMarginBottom}
  sx={{
    ...resolvedSx,
    ...(inlineColor && {color: inlineColor}),
    ...(textTransform !== 'none' && {textTransform}),
    ...userSx,
  }}
>
  {children}
</Typography>
```

### Variant binding mapping

| `visualAppearance` | `variantTag` | Inline sx needed?                                                     |
| ------------------ | ------------ | --------------------------------------------------------------------- |
| `body-one`         | `body1`      | No — body1 variant = Text lg Medium.                                  |
| `body-two`         | `body2`      | No — body2 variant = Text md Medium (locked).                         |
| `body-three`       | `body3`      | No — body3 variant = Text sm Regular.                                 |
| `body-four`        | `body4`      | No — body4 variant = Text xs Regular.                                 |
| `text-4xl`         | `body1`      | Yes — override size + line-height + letter-spacing inline (Text 4xl). |
| `text-3xl`         | `body1`      | Yes — override size + line-height inline.                             |
| `text-2xl`         | `body1`      | Yes — override size + line-height inline.                             |
| `text-xl`          | `body1`      | Yes — override size + line-height inline.                             |
| `text-lg`          | `body1`      | No — body1 variant already = Text lg Medium.                          |
| `text-md`          | `body2`      | No — body2 variant already = Text md Medium.                          |
| `text-sm`          | `body3`      | No — body3 variant already = Text sm Regular.                         |
| `text-xs`          | `body4`      | No — body4 variant already = Text xs Regular.                         |

The new `text-md`/`text-lg`/`text-sm`/`text-xs` values produce IDENTICAL rendered styles to their legacy counterparts (`body-two`/`body-one`/`body-three`/`body-four`). They exist for naming clarity — new authoring uses the descriptive `text-*` names; old entries keep their `body-*` values without re-publish.

### Individual override behavior

Unchanged from current Paragraph behavior:

- `isStrong = true` → `sx.fontWeight = WEIGHTS.semibold` (= 600). When false (default), no `fontWeight` override is emitted (variant's own weight flows through — fixes today's `400` shadow).
- `isItalic = true` → `sx.fontStyle = 'italic'`.
- `colorOverride` set → `sx.color = colorOverride` (wins over brand color + contrast switch).
- `textTransform !== 'none'` → `sx.textTransform`.
- User-provided `sx` prop spread last (escape hatch).

## Diff from today

```diff
+import {resolveParagraphStyles} from './resolveParagraphStyles';
+import {WEIGHTS} from '@/themes/code.org/typography/tokens';

 const Paragraph: React.FunctionComponent<ParagraphProps> = ({
   visualAppearance = 'body-two',
   isStrong = false,
   isItalic = false,
   color = 'black',
   colorOverride,
   textTransform = 'none',
   children,
   removeMarginBottom = false,
   className,
   sx,
 }) => {
   const legacy = isLegacyParagraphColor(color);
   const enclosingBackground = useSectionBackground();
   const inlineColor =
     colorOverride ||
     (legacy
       ? undefined
       : resolvedCssVarForBrandColor(color, enclosingBackground));
   const legacyClassName =
     legacy && !colorOverride ? `paragraph--color-${color}` : undefined;

+  const {variantTag, sx: resolvedSx} = resolveParagraphStyles({
+    visualAppearance,
+    isStrong,
+    isItalic,
+  });

   return (
     <Typography
       className={classNames(legacyClassName, className)}
-      variant={visualAppearanceToMuiTagMap[visualAppearance]}
+      variant={variantTag}
       gutterBottom={!removeMarginBottom}
       sx={{
-        fontWeight: isStrong ? 600 : 400,
-        fontStyle: isItalic ? 'italic' : 'normal',
+        ...resolvedSx,
         ...(inlineColor && {color: inlineColor}),
         ...(textTransform !== 'none' && {textTransform}),
         ...sx,
       }}
     >
       {children}
     </Typography>
   );
 };
```

`resolveParagraphStyles.ts` (NEW) — pure function returning `{variantTag, sx}` per the variant-binding table. Handles:

- Legacy values → variant + empty sx.
- New `text-*` values that match a variant's canonical default → variant + empty sx.
- New `text-*` values that need inline overrides (Text 4xl/3xl/2xl/xl) → variant=body1 + inline `sx.fontSize`/`lineHeight`/`letterSpacing`.
- `isStrong` → `sx.fontWeight = WEIGHTS.semibold`.
- `isItalic` → `sx.fontStyle = 'italic'`.

The existing `visualAppearanceToMuiTagMap` const can be deleted (replaced by the table inside `resolveParagraphStyles.ts`).

## Acceptance criteria (unit tests)

In `apps/marketing/src/components/contentful/paragraph/__tests__/Paragraph.test.tsx`:

1. **Canonical body default**: `<Paragraph>Hello</Paragraph>` renders `font-size: 1rem`, `line-height: 1.5rem`, `font-weight: 500`, family Geist + Noto Sans chain.
2. **Legacy values unchanged**: each `body-one`/`body-two`/`body-three`/`body-four` renders the SAME computed styles before vs after this feature (snapshot diff against pre-feature). This is the FR-011 back-compat guarantee.
3. **New cells render correctly**: each `text-4xl`/`text-3xl`/`text-2xl`/`text-xl`/`text-lg`/`text-md`/`text-sm`/`text-xs` renders the matching Text-track cell's font-size + line-height + letter-spacing.
4. **Naming-equivalent pairs**: `<Paragraph visualAppearance="text-md">` and `<Paragraph visualAppearance="body-two">` render byte-identical computed styles.
5. **isStrong = true** → `font-weight: 600` (Semibold).
6. **isStrong = false** (default) → `font-weight: 500` (the variant's own Medium — NOT 400; the `400` shadow is gone).
7. **colorOverride** wins over both brand color and contrast switch.
8. **Legacy color values** (`'secondary'` etc.) render with the `paragraph--color-*` class hook unchanged.

## Out of contract

- Adding a `weight` enum prop with all 4 weights to Paragraph — not in scope.
- Adding a `track` prop to render Paragraph in Display track — not in scope (Paragraph is Text-only).
- Removing `isStrong` / `isItalic` / `sx` — keep them.
- Migrating existing entries from `body-*` to `text-*` names — no migration; both names continue to validate.
