# Contract: Text Link (`Link`) — React Props + Tenant Theme Override Shape

**Feature**: 008-brand-buttons
**Date**: 2026-06-22
**Component**: `apps/marketing/src/components/contentful/link/Link.tsx` (Contentful id `link`)
**Tenant theme override files**: `apps/marketing/src/themes/{code.org,csforall}/styleOverrides/link.ts`

This contract documents the Text Link props surface and the tenant-theme override hook **after** the Brand Text Link refactor lands (per R12). Consumers MUST type-check against this contract; the tenant theme override files MUST honor the documented selector hooks.

---

## Public props (`LinkProps`)

```ts
import {EntryFields} from 'contentful';
import {ReactNode} from 'react';

import {BrandColor} from '@/components/common/colors';
import {
  ComponentSize,
  RemoveMarginBottomProps,
} from '@/components/common/types';

type IconPosition = 'left' | 'right';

export type LinkProps = RemoveMarginBottomProps & {
  /** Link label content. */
  children: ReactNode;
  /** Link destination URL. */
  href: string;
  /** Whether the link is external (opens in a new tab; renders the external-link icon). */
  isLinkExternal: boolean;
  /**
   * Link color — accepts the full 22-option universal BrandColor type for backward compatibility.
   * On the code.org tenant, the value is auto-mapped at render time to one of 3 Hierarchies
   * (`color` / `black` / `white`) per the rules in `data-model.md`. On csforall, the value
   * passes through to the legacy styling unchanged.
   */
  color?: BrandColor;
  /**
   * Size token — accepts `xs` for backward compatibility. On the code.org tenant, `xs` is
   * auto-mapped to `s` at render time. On csforall, `xs` is honored as today.
   */
  size?: ComponentSize;
  /**
   * Bold toggle — preserved for backward compatibility. On the code.org tenant, this is a
   * render-time NO-OP (Brand Links are always Bold 700). On csforall, it continues to
   * toggle between weight 500 and 600.
   */
  isStrong?: boolean;
  /** FontAwesome icon name (e.g. "arrow-right"). Suppressed when `isLinkExternal=true`. */
  icon?: string;
  /** Side to render `icon` on. Defaults to `right`. */
  iconPosition?: IconPosition;
  /**
   * NEW. Loading state. When true, renders a 20px spinner adjacent to the label; the label
   * remains visible; `text-transform: uppercase` drops regardless of size. Default false.
   */
  isPending?: boolean;
  /** Aria label for the link. */
  ariaLabel?: EntryFields.Text;
  /** Custom className. */
  className?: string | object;
};
```

The public type signature for `color`, `size`, and `isStrong` is **unchanged** for backward compatibility — existing consumers compile without changes. The semantics differ per tenant per the render-time auto-mapping (data-model.md "Render-time auto-mapping rules").

---

## Internal Hierarchy resolution (`Link.tsx`)

```ts
type Hierarchy = 'color' | 'black' | 'white';

const resolveHierarchy = (color: BrandColor): Hierarchy => {
  switch (color) {
    case 'primary': // legacy alias for purplePrimary
    case 'purplePrimary':
      return 'color';
    case 'default': // legacy alias for black-with-switch
      return 'black';
    case 'white':
      return 'white';
    default:
      return 'color'; // fallback per FR-029
  }
};
```

The resolved Hierarchy is passed to the rendered `<MuiLink>` as a `data-hierarchy` attribute:

```tsx
<MuiLink
  href={href}
  data-hierarchy={hierarchy}
  data-loading={isPending ? 'true' : undefined}
  className={classNames(`link--size-${resolvedSize}`, className)}
  ...
>
  {label}
</MuiLink>
```

Tenant theme overrides select on `[data-hierarchy="..."]` and `[data-loading="true"]` (selector hooks).

---

## Contrast-switch behavior

Preserved from today (per FR-032), but branched by Hierarchy:

```ts
const enclosingBackground = useSectionBackground();

const isSwitchingHierarchy = hierarchy === 'color' || hierarchy === 'black';
const resolvedBrandColor: BrandColor = isSwitchingHierarchy
  ? resolveTextColorForBackground(color, enclosingBackground).value
  : color; // 'white' Hierarchy bypasses the switch

// The resolved color is NOT applied as inline CSS — it's encoded via data-hierarchy.
// For switching Hierarchies, the data-hierarchy attribute updates to reflect the resolved
// switch target (e.g. on a dark Section, `color` Hierarchy may resolve to a white-equivalent
// — set data-hierarchy="white" so the theme override applies white styling).
```

The exact mapping of "switch result" → Hierarchy is encoded in `Link.tsx` and uses `cssVarForBrandColor` only for fallback paths where no Hierarchy applies (csforall path).

---

## Tenant theme override shape (`MuiLink`)

### `apps/marketing/src/themes/code.org/styleOverrides/link.ts`

Required selectors and rules:

```ts
import {Components, Theme} from '@mui/material/styles';

export const LINK_OVERRIDES: Components<Theme>['MuiLink'] = {
  styleOverrides: {
    root: {
      fontFamily: '"Space Grotesk", sans-serif',
      fontWeight: 700,
      textDecoration: 'none',
      padding: 0,
      gap: '0.25rem',
      display: 'inline-flex',
      alignItems: 'center',

      // Per-Hierarchy default + hover + disabled + loading
      '&[data-hierarchy="color"]': {
        color: 'var(--button-color-purple-primary)',
        '&:hover': {color: 'var(--button-color-purple-hover)'}, // R16: no underline on color hover
        '&[data-loading="true"]': {color: 'var(--button-color-purple-hover)'},
        '&[aria-disabled="true"]': {color: 'var(--button-color-link-disabled)'},
      },
      '&[data-hierarchy="black"]': {
        color: 'var(--button-color-black)',
        '&:hover': {textDecoration: 'underline'}, // R16: underline on black hover
        '&[data-loading="true"]': {color: 'var(--button-color-black)'},
        '&[aria-disabled="true"]': {color: 'var(--button-color-link-disabled)'},
      },
      '&[data-hierarchy="white"]': {
        color: 'var(--button-color-white)',
        '&:hover': {textDecoration: 'underline'}, // R16: underline on white hover
        '&[data-loading="true"]': {color: 'var(--button-color-white)'},
        '&[aria-disabled="true"]': {
          color: 'var(--button-color-disabled-light)',
        },
      },

      // Focus ring — same Focus Blue as Buttons, applied as outer outline
      '&:focus-visible': {
        outline: '2px solid var(--button-focus-ring)',
        outlineOffset: '4px',
        borderRadius: '10px',
      },

      // Per-size font + text-transform
      '&.link--size-s': {
        fontSize: '14px',
        lineHeight: '21.7px',
        // size=s does NOT uppercase (per Figma)
      },
      '&.link--size-m': {
        fontSize: '14px',
        lineHeight: '21.7px',
        textTransform: 'uppercase',
      },
      '&.link--size-l': {
        fontSize: '16px',
        lineHeight: '24px',
        textTransform: 'uppercase',
      },

      // Loading state drops uppercase regardless of size
      '&[data-loading="true"]': {
        textTransform: 'none',
      },
    },
  },
};
```

### `apps/marketing/src/themes/csforall/styleOverrides/link.ts`

Encodes today's hardcoded `sx` from the current Link.tsx so CSforAll Text Link visuals are byte-identical post-merge. Notably:

```ts
import {Components, Theme} from '@mui/material/styles';

export const LINK_OVERRIDES: Components<Theme>['MuiLink'] = {
  styleOverrides: {
    root: ({theme}) => ({
      display: 'inline-flex',
      alignItems: 'center',
      gap: '0.5rem',
      textDecoration: 'none',
      // The text-decoration: underline lives on the inner <span> in csforall path (preserved).
      // Color resolution happens in Link.tsx via the existing resolveLinkColor()/cssVarForBrandColor()
      // and is applied as inline sx — the theme override here is for layout/spacing only on csforall.
      // (See R12: csforall keeps the existing color-resolution path; only code.org moves
      // per-Hierarchy color into the theme override.)
    }),
  },
};
```

CSforAll's Link.tsx code path retains its hardcoded `sx={...}` block for color/font-weight (driven by `isStrong`); the theme override exists only to host any layout properties shared across tenants.

(Implementation may merge both tenants' styling into the theme override entirely. Decision is local to the engineer during `/speckit.tasks`; the contract requires only that csforall visuals stay byte-identical.)

---

## Backward-compatibility notes

- Public `LinkProps` types are unchanged. Existing consumers (`RichText.tsx`, `PeopleCollection.tsx`, `AFEEligibility.tsx`, etc.) compile without changes.
- `isPending` is a new optional prop; consumers that don't set it get the existing non-loading rendering.
- The auto-mapping of legacy `color` / `size` values is tenant-scoped — csforall consumers keep today's exact behavior.
- The `<span style={{textDecoration: 'underline'}}>` wrapper removal in `Link.tsx` is masked from csforall callers because the csforall theme override re-applies the same underline pattern.

---

## Validation surfaces

- **Unit tests** (`apps/marketing/src/components/contentful/link/__tests__/`):
  - `resolveHierarchy` mapping rules (every legacy value → Hierarchy).
  - `size="xs"` → `s` mapping on code.org; passthrough on csforall.
  - `isStrong` ignored on code.org rendering; honored on csforall.
  - Contrast switch ON for `color`/`black`; OFF for `white`.
  - `isPending` renders spinner + drops uppercase.
- **Storybook**: per-Hierarchy × per-size × per-state matrix; tenant-theme switcher story showing code.org vs csforall visuals.
- **Visual regression**: storybook-eyes baselines re-accepted for code.org Text Link stories. **CSforAll Text Link stories MUST show ZERO diff** — if they do, the csforall theme override doesn't perfectly mirror today's behavior and needs fixing.
