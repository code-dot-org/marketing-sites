# Contract: Heading Component (React + Contentful API after refactor)

**Feature**: [spec.md](../spec.md) · **Plan**: [plan.md](../plan.md) · **Data model**: [data-model.md](../data-model.md) §8 / §8a / §8c · **Spec amendment**: 2026-06-23 — orthogonal Heading Level / Visual Appearance fields

**Files**:

- `apps/marketing/src/components/contentful/heading/Heading.tsx`
- `apps/marketing/src/components/contentful/heading/HeadingContentfulDefinition.ts`
- `apps/marketing/src/components/contentful/heading/resolveHeadingStyles.ts` (NEW helper)

## Goal of the refactor

Replace the existing single `visualAppearance` field's dual role (semantic level AND visual size) with a deterministic three-step style-resolution chain:

1. **Heading Level** (existing `visualAppearance` field, displayName "Heading Level") — sets the semantic tag (`<h1>`–`<h6>`) and seeds the canonical role token.
2. **Visual Appearance** (NEW `appearance` field) — when non-`default`, overrides the size + weight + line-height + letter-spacing + per-breakpoint steps with a chosen Display cell's role token. Family stays Display; semantic tag stays whatever Heading Level chose.
3. **Individual override fields** — top precedence; each set field overrides only its corresponding dimension.

The internal name `visualAppearance` is preserved (no Contentful migration); the field is now logically the heading-level selector.

## Contentful ComponentDefinition delta

`HeadingContentfulDefinition.ts` — add ONE new variable `appearance`. The existing `visualAppearance` field shape is unchanged.

```ts
// Add after the existing `visualAppearance` block:
appearance: {
  displayName: 'Visual Appearance',
  type: 'Text',
  defaultValue: 'default',
  group: 'style',
  description:
    'Override the size, weight, line-height, and letter-spacing while keeping the chosen Heading Level\'s semantic tag (<h1>..<h6>). "Default" inherits the canonical style for the chosen Heading Level.',
  validations: {
    in: [
      {value: 'default', displayName: 'Default (from level)'},
      {value: 'display-4xl', displayName: 'Display 4xl'},
      {value: 'display-3xl', displayName: 'Display 3xl'},
      {value: 'display-2xl', displayName: 'Display 2xl'},
      {value: 'display-xl', displayName: 'Display xl'},
      {value: 'display-lg', displayName: 'Display lg'},
      {value: 'display-md', displayName: 'Display md'},
      {value: 'display-sm', displayName: 'Display sm'},
      {value: 'display-xs', displayName: 'Display xs'},
    ],
  },
},
```

No content-type schema migration required — this is a ComponentDefinition variable addition, code-side, per Constitution V and spec 008 precedent. Studio editors see the new "Visual Appearance" dropdown immediately after deploy.

## React props (after refactor)

```ts
type HeadingLevelValue =
  | 'heading-xxl'   // → <h1>, seed role h1 (Display 2xl Semibold)
  | 'heading-xl'    // → <h2>, seed role h2 (default)
  | 'heading-lg'    // → <h3>, seed role h3
  | 'heading-md'    // → <h4>, seed role h4
  | 'heading-sm'    // → <h5>, seed role h5
  | 'heading-xs';   // → <h6>, seed role h6

type HeadingAppearanceValue =
  | 'default'
  | 'display-4xl'
  | 'display-3xl'
  | 'display-2xl'
  | 'display-xl'
  | 'display-lg'
  | 'display-md'
  | 'display-sm'
  | 'display-xs';

export type HeadingProps = {
  children: ReactNode;

  /** Existing field — Studio displayName "Heading Level". Drives <h*> semantic tag + seed role token. */
  visualAppearance: HeadingLevelValue;

  /** NEW field — Studio displayName "Visual Appearance". Overrides size+style only; never the semantic tag. */
  appearance?: HeadingAppearanceValue;

  /** Brand color (resolved through contrast-switch per spec 006). */
  color?: BrandColor;

  /** ClassName forwarded by Contentful. */
  className?: string;

  /** Individual overrides — top precedence. Unchanged from current code. */
  fontSize?: number;          // rem
  lineHeight?: number;        // unitless
  fontWeight?: '500' | '700'; // Studio-validated weight enum (unchanged for this spec; 4-weight ladder deferred)
  colorOverride?: string;     // hex; wins over the contrast switch
  fontKerning?: 'auto' | 'normal' | 'none';
  textTransform?: 'none' | 'uppercase' | 'lowercase' | 'capitalize';
  zIndex?: string;

  removeMarginBottom?: boolean;
};
```

`appearance` is optional in React props because legacy entries (those that pre-date this feature) lack the field; default to `'default'` at the prop-defaulting layer.

## Behavioral contract

`resolveHeadingStyles({visualAppearance, appearance, fontSize, lineHeight, fontWeight, fontKerning, textTransform})` returns `{semanticTag, variantTag, sx}` per data-model §8c. The Heading component then renders:

```tsx
<Typography
  className={className}
  component={semanticTag}     // <h1>..<h6> from Heading Level
  variant={variantTag}        // h1..h6 variant (carries family + per-breakpoint styles)
  gutterBottom={!removeMarginBottom}
  sx={{...sxFromResolve, ...colorSx, ...zIndexSx}}
>
  {children}
</Typography>
```

### Variant binding mapping (step 2 of the chain)

When `appearance` is non-`default`, the variant binding for MUI determines which set of styles flows in:

| `appearance`   | `variantTag`     | Notes                                                          |
| -------------- | ---------------- | -------------------------------------------------------------- |
| `default`      | matches level    | Use the seed role's variant tag (h1..h6 from `visualAppearance`). |
| `display-2xl`  | `h1`             | Same cell as canonical H1 → use h1 variant.                    |
| `display-xl`   | `h2`             | Same cell as canonical H2 → use h2 variant.                    |
| `display-lg`   | `h3`             | Same cell as canonical H3 → use h3 variant.                    |
| `display-md`   | `h4`             | Same cell as canonical H4 → use h4 variant.                    |
| `display-sm`   | `h5`             | Same cell as canonical H5 → use h5 variant.                    |
| `display-xs`   | `h6`             | Same cell as canonical H6 → use h6 variant.                    |
| `display-4xl`  | `h1` + inline sx | No canonical level matches; use h1 variant for the family + emit inline `sx.fontSize`/`lineHeight`/`letterSpacing` + per-breakpoint media queries for Display 4xl. |
| `display-3xl`  | `h1` + inline sx | Same as above for Display 3xl.                                  |

For the 2 extra cells (`display-4xl`, `display-3xl`) the variant binding falls back to `h1` (any heading variant would work — picking h1 keeps the Display-track font-family inheritance) and the inline sx provides the full style payload.

For all 6 cells that match a canonical level, the variant binding picks up MUI's per-breakpoint media queries automatically — no inline sx for size/weight/line-height is emitted.

### Individual override behavior

Each individual override is applied **after** step 2's cell is settled. They are dimension-scoped:

- `fontSize` set → `sx.fontSize = '${fontSize}rem'`. Other dimensions (weight, line-height, family, letter-spacing) still come from step 2's cell.
- `fontWeight` set → `sx.fontWeight = Number(fontWeight)`. Other dimensions from step 2.
- `lineHeight` set → `sx.lineHeight = lineHeight`. Other dimensions from step 2.
- `fontKerning` set → `sx.fontKerning = fontKerning`.
- `textTransform !== 'none'` → `sx.textTransform = textTransform`.
- `colorOverride` set → `sx.color = colorOverride` (wins over contrast switch).
- `zIndex` set → `sx.position = 'relative'; sx.zIndex = zIndex`.

When no individual overrides are set AND `appearance = 'default'`, the rendered `sx` MUST be empty (or contain only the contrast-switch color) so MUI's variant defaults flow through unchanged — this is the FR-011 back-compat guarantee.

### Resolution table (canonical examples)

| `visualAppearance` | `appearance`     | Individual overrides       | Result                                                                  |
| ------------------ | ---------------- | -------------------------- | ----------------------------------------------------------------------- |
| `heading-xxl`      | (unset)          | (none)                     | `<h1>` + canonical H1 cell (Display 2xl Semibold, H1 breakpoint steps)   |
| `heading-xxl`      | `default`        | (none)                     | Same as above — `default` is the sentinel for "use seed."                |
| `heading-xl`       | `display-2xl`    | (none)                     | `<h2>` + Display 2xl cell (Display 2xl Semibold, Display 2xl steps)      |
| `heading-xxl`      | `display-lg`     | (none)                     | `<h1>` + Display lg cell                                                  |
| `heading-xl`       | `display-4xl`    | (none)                     | `<h2>` + Display 4xl cell (variant=h1 for family, inline sx for size)    |
| `heading-lg`       | `default`        | `fontSize=5`               | `<h3>` + canonical H3 cell with `font-size: 5rem` override               |
| `heading-xl`       | `display-xl`     | `fontWeight='700'`         | `<h2>` + Display xl cell with `font-weight: 700` override                |

## Diff from today

`Heading.tsx`:

```diff
+import {resolveHeadingStyles} from './resolveHeadingStyles';

 const Heading: React.FunctionComponent<HeadingProps> = ({
   children,
   visualAppearance,
+  appearance = 'default',
   color = 'black',
   removeMarginBottom,
   className,
   fontSize,
   lineHeight,
   fontWeight,
   colorOverride,
   fontKerning,
   textTransform = 'none',
   zIndex,
 }) => {
-  const tag = visualAppearanceToSemanticTagMap[visualAppearance];
   const enclosingBackground = useSectionBackground();
+  const {semanticTag, variantTag, sx: resolvedSx} = resolveHeadingStyles({
+    visualAppearance,
+    appearance,
+    fontSize,
+    lineHeight,
+    fontWeight,
+    fontKerning,
+    textTransform,
+  });

   const sx = {
-    fontFamily: `"${SPACE_GROTESK_FONT}", sans-serif`,
-    fontSize:
-      fontSize !== undefined
-        ? `${fontSize}rem`
-        : HEADING_RESPONSIVE_SIZE[visualAppearance],
-    lineHeight: lineHeight ?? 1,
-    fontWeight: fontWeight ? Number(fontWeight) : 500,
+    ...resolvedSx,
     color:
       colorOverride || resolvedCssVarForBrandColor(color, enclosingBackground),
-    fontKerning: fontKerning ?? 'normal',
-    ...(textTransform !== 'none' && {textTransform}),
     ...(zIndex && {position: 'relative', zIndex}),
   };

   return (
     <Typography
       className={className}
-      component={tag}
-      variant={tag}
+      component={semanticTag}
+      variant={variantTag}
       gutterBottom={!removeMarginBottom}
       sx={sx}
     >
       {children}
     </Typography>
   );
 };
```

Delete `HEADING_RESPONSIVE_SIZE` and the `SPACE_GROTESK_FONT` import — both no longer used here.

`HeadingContentfulDefinition.ts` — add the `appearance` block per the snippet above.

`resolveHeadingStyles.ts` (NEW) — implements the procedure in data-model §8c. Pure function. Unit-tested.

## Acceptance criteria (unit tests)

In `apps/marketing/src/components/contentful/heading/__tests__/Heading.test.tsx`:

1. **Canonical default per level** (FR-011 back-compat): each of the 6 `visualAppearance` values, with no other props, renders the matching semantic tag and the matching canonical role token. Computed `font-family`, `font-size`, `font-weight`, `line-height` match the role token; no inline `clamp()` is emitted.
2. **Semantic tag orthogonality** (FR-009 step 1): for every (`visualAppearance`, `appearance`) pair, the rendered DOM tag is determined ONLY by `visualAppearance`. Example: `<Heading visualAppearance="heading-xl" appearance="display-2xl">` → `<h2>` tag (not `<h1>`).
3. **Visual Appearance override**: setting `appearance` to each of the 8 Display cells produces the matching cell's size + line-height + letter-spacing in the rendered element. Verified for both same-cell-as-level (`display-xl` for an H2) and different-cell-than-level (`display-2xl` for an H2).
4. **Display 4xl / Display 3xl path** (no canonical level match): `appearance = 'display-4xl'` on any level renders with the Display 4xl size/line-height/letter-spacing inline; family is Display.
5. **Individual override precedence**: setting `fontSize`/`fontWeight`/`lineHeight`/`fontKerning`/`textTransform`/`colorOverride` each overrides only its own dimension while the rest of the cell flows through.
6. **`appearance = 'default'` is a no-op**: `<Heading visualAppearance="heading-xxl" appearance="default">` renders identically to `<Heading visualAppearance="heading-xxl">` (no `appearance` set).
7. **Legacy entry compatibility**: an entry-prop bag without `appearance` field renders identically to the same entry with `appearance: 'default'`.
8. **Per-breakpoint steps preserved**: with `appearance = 'display-2xl'` on an H2 entry, the rendered styles include the Display 2xl per-breakpoint steps (H1's step table — same as canonical H1) at the matching media queries.

## Out of contract

- Adding a `track` prop to select Text track for a Heading entry — not in scope (Heading is always Display per design).
- Widening `fontWeight` Studio enum from `['500', '700']` to 4 cells — **deferred**. Authors who need Regular (400) or Semibold (600) pick a Visual Appearance whose canonical default already carries that weight (all Display cells = Semibold). Bold (700) and Medium (500) remain available via the individual `fontWeight` override.
- Removing the individual `fontSize` / `lineHeight` Number overrides — keep them.
- Renaming the internal `visualAppearance` field to `level` — would require a Contentful entry migration; out of scope.
