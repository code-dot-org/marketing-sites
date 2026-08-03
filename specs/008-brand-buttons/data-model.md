# Data Model: Brand Buttons & Brand Text Link

**Feature**: 008-brand-buttons
**Date**: 2026-06-22 (re-written post-clarify)

The feature touches two existing **Contentful Experiences Component Definitions** (the `button` ComponentDefinition and the `link` ComponentDefinition — both code-side artifacts in `apps/marketing/src/components/contentful/.../*ContentfulDefinition.ts`), two existing React-component prop surfaces, and one derived Figma-final token grid. **No Contentful content types are modified.** No new application-side persisted entities. No state machine. The Contentful content type `link` (used to create reusable Link entries that bind into Button + Text Link Content-tab fields) is read-only for this feature.

---

## Entity: Button ComponentDefinition (`ButtonLegacyContentfulComponentDefinition` — MODIFIED in place, code-side)

Source of truth: `apps/marketing/src/components/contentful/corporateSite/buttonLegacy/ButtonLegacyContentfulDefinition.ts`. This is a Contentful Experiences `ComponentDefinition` — a code-side artifact loaded by the Experiences SDK to expose the Button component to Studio editors. **It is NOT a Contentful content type.** The Component Definition's `variables` object expands by 3 new entries + 1 enum expansion. The exported `id: 'button'` is unchanged. Existing Buttons composed inside Experience entries continue to validate against the expanded `variables` shape; missing values default per the table below.

### Variables (`variables.*` object — code shape)

| Variable id      | Studio tab | Type      | Default            | Validation                             | Status                          |
| ---------------- | ---------- | --------- | ------------------ | -------------------------------------- | ------------------------------- |
| `text`           | Content    | `Text`    | `Button`           | bindingSourceType: `entry`, `manual`   | UNCHANGED                       |
| `href`           | Content    | `Text`    | `https://code.org` | bindingSourceType: `entry`, `manual`   | UNCHANGED                       |
| `isLinkExternal` | Content    | `Boolean` | `false`            | bindingSourceType: `entry`, `manual`   | UNCHANGED                       |
| `ariaLabel`      | Content    | `Text`    | (empty)            | bindingSourceType: `entry`, `manual`   | UNCHANGED                       |
| `color`          | Design     | `Text`    | `purple`           | `in`: `[purple, black, white]`         | UNCHANGED                       |
| `type`           | Design     | `Text`    | `primary`          | `in`: `[primary, secondary, tertiary]` | MODIFIED enum (adds `tertiary`) |
| `size`           | Design     | `Text`    | `m`                | `in`: `[s, m, l, xl]`                  | NEW                             |
| `iconLeftName`   | Design     | `Text`    | (empty)            | none (free-form FA name)               | UNCHANGED                       |
| `iconRightName`  | Design     | `Text`    | (empty)            | none (free-form FA name)               | NEW                             |
| `isIconOnly`     | Design     | `Boolean` | `false`            | none                                   | NEW                             |

The "Studio tab" column reflects which tab the variable appears under in Contentful Studio's component editor, driven by the `group:` attribute on the variable definition (`group: 'content'` → Content tab; `group: 'style'` → Design tab). Content-tab variables can bind to a Link content-type entry's fields or be authored manually per Button instance.

### Migration semantics

Existing Button instances composed inside Experience entries continue to validate against the expanded `variables` shape. Buttons with no stored value for `size` / `iconRightName` / `isIconOnly` default per the table; Buttons with stored `type === 'primary' | 'secondary'` continue to validate (the `tertiary` addition is purely additive). **Zero re-publish required**. There is no Contentful Studio step.

### Validation rules

- `isIconOnly = true` + `text` non-empty: Studio shows hint; rendering hides `text` and uses `iconLeftName` as glyph.
- `isIconOnly = true` + `iconLeftName` empty: dev-mode console warning per `checkButtonPropsForErrors`.
- `isIconOnly = true` + `ariaLabel` empty: dev-mode warning; render does not block.
- External-link + author right icon (`iconRightName` set) + `isLinkExternal = true`: author right icon wins (R7); `rel`/`target` preserved.

---

## Entity: Text Link ComponentDefinition (`LinkContentfulComponentDefinition` — MODIFIED in place, code-side; per-tenant factories)

Source of truth: `apps/marketing/src/components/contentful/link/LinkContentfulDefinition.ts`. This is a Contentful Experiences `ComponentDefinition` — a code-side artifact, not a Contentful content type. The file is refactored to export two factories (`BrandLinkContentfulComponentDefinition` for code.org and `LegacyLinkContentfulComponentDefinition` for csforall) both producing definitions with exported `id: 'link'` but with different `variables.color.validations.in` and `variables.size.validations.in` enums.

**The Contentful content type `link`** (the underlying type authors use to create reusable Link entries that bind into Buttons and Text Links via the Content-tab `text`/`href`/`isLinkExternal`/`ariaLabel` fields) is **not touched** by this feature. Link entries continue to validate and read identically on both tenants.

### Component Definition variables (code-side `variables.*`)

| Variable id          | Studio tab      | Type | Default            | Validation (today's `LinkContentfulComponentDefinition`) |
| -------------------- | --------------- | ---- | ------------------ | -------------------------------------------------------- |
| `children`           | `Symbol` (Text) | No   | `Link`             | bindingSourceType: `entry`, `manual`                     |
| `href`               | `Symbol` (Text) | No   | `https://code.org` | bindingSourceType: `entry`, `manual`                     |
| `isLinkExternal`     | `Boolean`       | No   | `false`            | bindingSourceType: `entry`, `manual`                     |
| `ariaLabel`          | `Symbol` (Text) | No   | (empty)            | bindingSourceType: `entry`, `manual`                     |
| `color`              | `Symbol` (Text) | No   | `purplePrimary`    | `in`: 22 brand-text-color options                        |
| `size`               | `Symbol` (Text) | No   | `m`                | `in`: `[xs, s, m, l]`                                    |
| `isStrong`           | `Boolean`       | No   | `false`            | none                                                     |
| `icon`               | `Symbol` (Text) | No   | (empty)            | bindingSourceType: `entry`, `manual` (free-form FA name) |
| `iconPosition`       | `Symbol` (Text) | No   | `right`            | `in`: `[left, right]`                                    |
| `removeMarginBottom` | `Boolean`       | No   | `false`            | none                                                     |

### Per-tenant `validations.in` deltas (code-side, per Component Definition factory)

| Variable id | code.org factory (`BrandLinkContentfulComponentDefinition`)                                                                                               | csforall factory (`LegacyLinkContentfulComponentDefinition`)      |
| ----------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------- |
| `color`     | `[{value: 'color', displayName: 'Color (Purple)'}, {value: 'black', displayName: 'Black'}, {value: 'white', displayName: 'White'}]` (3 Brand Hierarchies) | `brandTextColorOptions('purplePrimary')` (22 options — unchanged) |
| `size`      | `[s, m, l]`                                                                                                                                               | `[xs, s, m, l]` (unchanged)                                       |

Existing code.org composed Text Links with legacy stored `color` / `size` values still validate (the Experiences SDK does not retroactively re-validate stored composed-component values against a narrowed enum); the render-time auto-mapping (below) translates them to a Brand Hierarchy + size.

### Render-time auto-mapping rules (code.org only, applied in `Link.tsx`)

| Source field value                | Maps to                      |
| --------------------------------- | ---------------------------- | ------------------------------------- | --------- |
| `color = "primary"`               | Hierarchy `color` (purple)   |
| `color = "purplePrimary"`         | Hierarchy `color` (purple)   |
| `color = "default"`               | Hierarchy `black`            |
| `color = "white"`                 | Hierarchy `white`            |
| `color = <any other brand color>` | Hierarchy `color` (fallback) |
| `size = "xs"`                     | `s`                          |
| `size = "s"                       | "m"                          | "l"`                                  | unchanged |
| `isStrong = true                  | false`                       | ignored (Brand Links always Bold 700) |

On csforall, none of these mappings apply — the values pass through to the legacy styling.

### Validation rules

- `isLinkExternal = true`: opens new tab; `target="_blank"` + `rel="noopener noreferrer"` added; an external-link icon (`OpenInNew`) renders on the right (existing behavior, preserved).
- `isLinkExternal = true` + `icon` set: per existing logic, `icon` is suppressed when external. **No change to this rule.**
- `isPending = true` (new prop): Loading state — renders a 20px spinner alongside the label; label remains visible; text-transform drops uppercase.

---

## Entity: React component `Button` / `LinkButton` / `GenericButton` (MODIFIED in place)

Three exports from `@code-dot-org/component-library/button`.

### Type-union deltas

| Type          | Today                                                       | After this feature                                               |
| ------------- | ----------------------------------------------------------- | ---------------------------------------------------------------- |
| `ButtonType`  | `'primary' \| 'secondary' \| 'tertiary'`                    | UNCHANGED                                                        |
| `ButtonColor` | `'purple' \| 'black' \| 'gray' \| 'white' \| 'destructive'` | `'purple' \| 'black' \| 'white' \| 'destructive'` (gray removed) |
| `ButtonSize`  | imported `ComponentSizeXSToL` (`'xs' \| 's' \| 'm' \| 'l'`) | new local `ButtonSize` (`'s' \| 'm' \| 'l' \| 'xl'`)             |

### `CoreButtonProps` (shared base)

```ts
interface CoreButtonProps
  extends TextButtonSpecificProps,
    IconOnlyButtonSpecificProps,
    HTMLAttributes<HTMLButtonElement | HTMLAnchorElement> {
  type?: ButtonType; // default 'primary'
  color?: ButtonColor; // default 'purple'
  size?: ButtonSize; // default 'm'
  className?: string;
  id?: string;
  disabled?: boolean; // sets disabled + aria-disabled="true"
  isPending?: boolean; // loading state — spinner swap rules unchanged
  ariaLabel?: string;
  onClick?: (e) => void;
}
```

### Internal helper changes (`checkButtonPropsForErrors`)

- **Remove**: `color === 'gray' && type === 'primary'` throw.
- **Remove**: `color === 'gray' && type === 'tertiary' && !isIconOnly` throw.
- **Remove**: `color === 'purple' && type === 'secondary'` warn.
- Preserve all other branches (text/icon mutual exclusion, useAsLink/onClick/href rules).

### State transitions

None (component is stateless; pseudo-states are CSS-driven via `:hover`, `:focus-visible`, `:disabled`, and `.is-loading` style hooks).

---

## Entity: React component `Link` (MODIFIED in place)

The shared Contentful Text Link at `apps/marketing/src/components/contentful/link/Link.tsx`. Refactored to be theme-aware per **R12**.

### Prop deltas

| Prop                 | Today                               | After this feature                                       | Notes                                                                           |
| -------------------- | ----------------------------------- | -------------------------------------------------------- | ------------------------------------------------------------------------------- |
| `color`              | `BrandColor` (22 universal options) | UNCHANGED public type                                    | Internally auto-mapped to a Hierarchy on code.org; passed through on csforall.  |
| `size`               | `ComponentSize` (`xs/s/m/l`)        | UNCHANGED public type                                    | Internally auto-mapped to `s/m/l` on code.org.                                  |
| `isLinkExternal`     | `boolean`                           | UNCHANGED                                                | Preserved as-is.                                                                |
| `isStrong`           | `boolean`                           | UNCHANGED public type; **ignored on code.org rendering** | Brand Links always Bold 700.                                                    |
| `icon`               | `string` (FA name)                  | UNCHANGED                                                | Suppressed when `isLinkExternal=true`.                                          |
| `iconPosition`       | `'left' \| 'right'`                 | UNCHANGED                                                | —                                                                               |
| `ariaLabel`          | `EntryFields.Text`                  | UNCHANGED                                                | —                                                                               |
| `removeMarginBottom` | `boolean`                           | UNCHANGED                                                | —                                                                               |
| `className`          | `string \| object`                  | UNCHANGED                                                | —                                                                               |
| `isPending`          | (none)                              | **NEW** `boolean`                                        | Loading state — spinner + non-uppercase typography. Driven by parent component. |

### Internal rendering changes

- Hardcoded `sx={{color, fontWeight, textDecoration, ...container}}` block in today's `Link.tsx` is **removed**.
- `<span style={{textDecoration: 'underline'}}>` wrapper is **removed** (per-Hierarchy underline is now controlled by tenant theme overrides per R16).
- A `data-hierarchy="color"|"black"|"white"` attribute is added to the rendered `<MuiLink>` element (selector hook for tenant theme overrides).
- The existing `useSectionBackground` + `resolveLinkColor` plumbing is **preserved** but branches by Hierarchy: `color` and `black` route through the contrast switch; `white` bypasses it.

### State transitions

None (stateless; pseudo-states are CSS-driven via the tenant theme overrides).

---

## Entity: MUI tenant theme override files (NEW)

Two new files mirror the existing `themes/<tenant>/styleOverrides/button.ts` pattern.

### `apps/marketing/src/themes/code.org/styleOverrides/link.ts` (NEW)

Encodes the Brand Link rules per `figma-tokens.md` Brand Link section. Shape:

```ts
export const LINK_OVERRIDES: Components<Theme>['MuiLink'] = {
  styleOverrides: {
    root: {
      fontFamily: 'Space Grotesk',
      fontWeight: 700,
      textDecoration: 'none',
      padding: 0,
      gap: '0.25rem',
      // base styles per data-hierarchy
      '&[data-hierarchy="color"]': {
        color: 'var(--button-color-purple-primary)',
      },
      '&[data-hierarchy="color"]:hover': {
        color: 'var(--button-color-purple-hover)',
      },
      // ... per-Hierarchy default/hover/focus/disabled/loading rules
      // ... per-size font-size/line-height/text-transform rules (uppercase except size="s" and loading)
      // ... focus ring via outline (matching Buttons' Focus Blue)
    },
  },
};
```

### `apps/marketing/src/themes/csforall/styleOverrides/link.ts` (NEW)

Encodes today's legacy styling (extracted from the current hardcoded `sx` in Link.tsx) so csforall renders byte-identical:

```ts
export const LINK_OVERRIDES: Components<Theme>['MuiLink'] = {
  styleOverrides: {
    root: ({theme}) => ({
      // mirror today's Link.tsx behavior: color resolved via resolveTextColorForBackground,
      // fontWeight 500/600 driven by isStrong, span wrapper with underline, etc.
      // The override may rely on data-hierarchy="legacy" + className signals from Link.tsx.
    }),
  },
};
```

Both files are wired into the existing tenant theme aggregator (`themes/<tenant>/...index.ts`).

---

## Entity: Brand Token Grid (Figma-final — DERIVED)

The full per-cell × per-state matrix and per-size dimensions for Buttons + Text Link. Sourced from Figma, recorded verbatim in `specs/008-brand-buttons/figma-tokens.md`. Authoritative per the user's "Figma colors are final" directive.

### Distinct CSS custom properties (13 new vars)

These land in **`packages/component-library-styles/buttonColors.scss`** (new file). The Brand Button SCSS module + the code.org Text Link theme override consume them via `var(--…)`.

| CSS variable                    | Hex                     | Figma source label             |
| ------------------------------- | ----------------------- | ------------------------------ |
| `--button-color-purple-primary` | `#4C42CF`               | Primary / Primary Purple       |
| `--button-color-purple-hover`   | `#382EA5`               | Primary / Primary Hover Purple |
| `--button-color-purple-dark`    | `#1F1976`               | Primary / Dark Purple          |
| `--button-color-purple-light`   | `#E4E2F8`               | Primary / Light Purple         |
| `--button-color-purple-tint`    | `#F8F6FF`               | Button / Light Primary Hover   |
| `--button-color-black`          | `#000000`               | Primary / Black                |
| `--button-color-white`          | `#FFFFFF`               | Primary / White                |
| `--button-color-white-alpha-20` | `rgba(255,255,255,0.2)` | Button / White 20%             |
| `--button-color-disabled-dark`  | `#AFB8C2`               | Primary / Gray 4               |
| `--button-color-link-disabled`  | `#D1D4D8`               | Primary / Gray 3               |
| `--button-color-disabled-light` | `#E4E6E9`               | Neutrals / Gray 2              |
| `--button-color-disabled-bg`    | `#F2F2F2`               | Neutrals / Gray 1              |
| `--button-focus-ring`           | `#0A84FF`               | Button / Focus Blue            |

### Per-cell + per-state grid

Consumed verbatim from `figma-tokens.md` Brand Button table (9 hierarchies × 5 states = 45 Button cells) and Brand Link table (3 hierarchies × 5 states = 15 Link cells). The SCSS module + theme override files map each cell to a `background-color`/`border-color`/`color` triple using the variables above. Full 60-cell grid is not duplicated here — it's authoritative in `figma-tokens.md` and the file is the canonical source for the implementation.

### Loading-state rule

> **Loading visual = Hover visual + spinner + label replaced** for purple hierarchies.
> **Loading visual = Default visual + spinner + label replaced** for Black and White hierarchies.

Encoded in SCSS as `.button.is-loading` rules that conditionally inherit from hover for purple variants.

### Focus state

`#0A84FF` `2px` outer ring with `4px` inner gap, outer `border-radius: 10px`, inner cell `border-radius: 8px`. Shared between Buttons and Text Link.

### Validation rules

- Every cell × state MUST have a triple resolved. Missing triples are caught by Storybook visual review.
- The 13 CSS variables MUST be the **exact hex values** from figma-tokens.md (verified by SC-016 via grep + diff).
- No aliases to `primitiveColors.scss` brand-color variables (per user directive).

---

## Summary of entity changes

- **Contentful `button` content type**: 3 new fields (`size`, `iconRightName`, `isIconOnly`); 1 enum expansion (`type` adds `tertiary`). Human-applied via Studio; re-read via Contentful MCP after publish.
- **Contentful `link` content type**: **NO change** at Contentful level (R13). Per-tenant `validations.in` narrowing happens in registration files.
- **React `Button` / `LinkButton` / `GenericButton`**: `color` enum trimmed (gray removed; destructive retained); `size` enum changed (xs removed, xl added; new local `ButtonSize` type); `type` enum unchanged but `tertiary` is now a first-class Brand variant; all other props unchanged.
- **React `Link`**: public API preserved (existing `color`/`size`/`isStrong`/`icon`/`iconPosition`/etc. all keep their types); new `isPending` prop added; internal styling refactored to be theme-aware (R12); render-time auto-mapping for legacy `color`/`size` values applied only on code.org.
- **Tenant theme override files**: two NEW (`themes/code.org/styleOverrides/link.ts`, `themes/csforall/styleOverrides/link.ts`).
- **Brand Token Grid**: 13 new CSS custom properties land in new `packages/component-library-styles/buttonColors.scss`. Per-cell rules in `genericButton.module.scss` + `themes/code.org/styleOverrides/link.ts` consume them.
- **Companion edits**: `packages/component-library/src/video/Video.tsx` (gray → black, xs → s); `packages/component-library/src/button/checkButtonPropsForErrors` (3 branches removed).
- **No removed entities, no renamed types, no relationship changes.**
