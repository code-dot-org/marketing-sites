# Contract: Icon React Component Props

**Feature**: 007-icon-component

This is the contract surface that `apps/marketing/src/components/contentful/icon/Icon.tsx` MUST satisfy. It is the public boundary between the Contentful entry and the rendered DOM.

---

## TypeScript signature

```ts
import {BrandColor} from '@/components/common/colors';

export type IconBackgroundFill = 'none' | 'filled' | 'outline';
export type IconBackgroundShape = 'circle' | 'square';

// Stored value for backgroundColor: any universal BrandColor, OR the literal
// Icon-local hex '#f6f6f6'. No other hex strings are accepted.
export type IconBackgroundColor = BrandColor | '#f6f6f6';

export interface IconProps {
  /** Font Awesome v6 icon name (e.g. 'lightbulb', 'github'). Required. */
  iconName: string;
  /** Icon glyph color from the universal CodeAI brand palette. */
  color?: BrandColor;
  /** Whether the icon has no shape, a solid background, or an outline. */
  backgroundFill?: IconBackgroundFill;
  /** Shape of the background or outline; square renders with rounded corners. */
  backgroundShape?: IconBackgroundShape;
  /** Background or outline color; brand token OR the Icon-local '#f6f6f6'. */
  backgroundColor?: IconBackgroundColor;
  /** Icon glyph size in CSS pixels. */
  iconSize?: number;
  /** ClassName passed by Contentful for design-tab styles. */
  className?: string;
}
```

## Defaults

| Prop              | Default           |
| ----------------- | ----------------- |
| `color`           | `'purplePrimary'` |
| `backgroundFill`  | `'none'`          |
| `backgroundShape` | `'circle'`        |
| `backgroundColor` | `'#f6f6f6'`       |
| `iconSize`        | `32`              |
| `className`       | `undefined`       |

## Behavior contract

1. **Glyph rendering**: Always renders `<FontAwesomeV6Icon iconName={iconName} iconStyle="solid" iconFamily={...} />`, where `iconFamily` is `'brands'` if `fontAwesomeV6BrandIconsMap.has(iconName)`, else `undefined`. The `<i>` carries the resolved color via inline style.
2. **Glyph color resolution**:
   - When `backgroundFill === 'none'`: `resolvedCssVarForBrandColor(color, useSectionBackground())` — contrast switch applies identically to Heading / Paragraph.
   - When `backgroundFill === 'filled'` or `'outline'`: `cssVarForBrandColor(color)` — no contrast switch; the author's chosen color passes through. The fill/outline color is the icon's local background, so resolving against the enclosing Section is incorrect (see R1 in research.md).
3. **Wrapper**: Rendered only when `backgroundFill !== 'none'`. When rendered, it is a single `<span>` styled via MUI `sx` on `Box`:
   - `display: 'inline-flex', alignItems: 'center', justifyContent: 'center'`
   - `width: iconSize * 1.75`, `height: iconSize * 1.75`
   - `borderRadius: backgroundShape === 'circle' ? '50%' : '25%'`
   - When `filled`: `backgroundColor: <resolved bg color>` and `border: 'none'`
   - When `outline`: `border: '3px solid <resolved bg color>'` and `backgroundColor: 'transparent'`
4. **Background color resolution**:
   - If `backgroundColor === '#f6f6f6'` → use `'#f6f6f6'` literal.
   - Otherwise → `cssVarForBrandColor(backgroundColor as BrandColor)`.
   - Background color is NOT routed through the contrast switch (author chose it explicitly; per spec edge case "Contrast switch interaction").
5. **No outer margin**: Neither the `<i>` nor the wrapper `<span>` has any inherent margin. Authors who need spacing rely on parent layout.
6. **`backgroundFill === 'none'`**: `backgroundShape` and `backgroundColor` MUST have zero visible effect — no wrapper is emitted, no styles applied beyond the bare `<i>`.
7. **`className` pass-through**: The `className` prop (set by Contentful's native design tab) MUST be applied to the outermost rendered element (wrapper if present, else the `<i>` itself).
8. **Server-rendered**: No `useState`, no `useEffect`, no browser-only APIs. The only hook used is `useSectionBackground` (already SSR-safe).

## Invariants

- `backgroundFill === 'filled'` and `backgroundFill === 'outline'` MUST produce identical outer dimensions for the same `iconSize` and `backgroundShape` (SC-007).
- The shape outer dimension MUST be exactly `iconSize × 1.75`.
- The Icon-local `#f6f6f6` literal MUST NOT be added to `BRAND_COLORS`, `BRAND_COLOR_OPTIONS`, or `brandColorOptionsWithDefault`. (FR-011.)
- The glyph color resolution MUST branch on `backgroundFill`: `resolvedCssVarForBrandColor` when `'none'`, `cssVarForBrandColor` otherwise.
