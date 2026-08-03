# Contract: Button / LinkButton / GenericButton — React Props

**Feature**: 008-brand-buttons
**Date**: 2026-06-22
**Component**: `@code-dot-org/component-library/button` exports `Button`, `LinkButton`, `GenericButton`.

This contract documents the props surface **after** the Brand Buttons feature lands. Consumers in this repo and any downstream import of the shared package MUST type-check against this contract.

---

## Type aliases (`packages/component-library/src/button/types.ts`)

```ts
export type ButtonType = 'primary' | 'secondary' | 'tertiary';

export type ButtonColor = 'purple' | 'black' | 'white' | 'destructive';
//                                              ^^^^^ 'gray' removed
//                                                     ^^^^^^^^^^^^^ retained as segregated legacy variant

export type ButtonSize = 's' | 'm' | 'l' | 'xl';
//                         ^^ 'xs' removed       ^^^^ 'xl' added
```

The `buttonColors` constant (in `Button.tsx`) is updated to match:

```ts
export const buttonColors: {[key in ButtonColor]: ButtonColor} = {
  purple: 'purple',
  black: 'black',
  white: 'white',
  destructive: 'destructive',
};
```

---

## `CoreButtonProps` (shared base)

```ts
interface CoreButtonProps
  extends TextButtonSpecificProps,
    IconOnlyButtonSpecificProps,
    HTMLAttributes<HTMLButtonElement | HTMLAnchorElement> {
  type?: ButtonType; // default 'primary'
  className?: string;
  id?: string;
  color?: ButtonColor; // default 'purple'
  disabled?: boolean; // default false; sets disabled + aria-disabled="true"
  isPending?: boolean; // default false; loading state with spinner-swap behavior
  ariaLabel?: string;
  onClick?: (e) => void;
  size?: ButtonSize; // default 'm'
}

interface TextButtonSpecificProps {
  iconLeft?: FontAwesomeV6IconProps;
  iconRight?: FontAwesomeV6IconProps;
  text?: string;
}

interface IconOnlyButtonSpecificProps {
  isIconOnly?: boolean; // default false
  icon?: FontAwesomeV6IconProps;
}
```

## `ButtonProps` (the `<button>`-rendering variant)

```ts
interface ButtonSpecificProps {
  buttonTagTypeAttribute?: 'submit' | 'button'; // default 'button'
  onClick?: (e) => void;
  value?: string;
  name?: string;
  forceHover?: boolean;
}

interface ButtonProps extends CoreButtonProps, ButtonSpecificProps {}
```

## `LinkButtonProps` (the `<a>`-rendering variant)

```ts
interface LinkButtonSpecificProps {
  useAsLink?: boolean; // default false; when true renders <a>
  target?: string;
  href?: string;
  download?: boolean | string;
  title?: string;
  analyticsCallback?: () => void;
}

interface LinkButtonProps extends CoreButtonProps, LinkButtonSpecificProps {}
```

## `GenericButtonProps` (the union)

```ts
interface GenericButtonProps
  extends CoreButtonProps,
    LinkButtonSpecificProps,
    ButtonSpecificProps {}
```

---

## Behavioral contract

### Sizing

- `size` MUST default to `'m'`.
- Each size produces a Figma-matching footprint:
  - `s` — corresponds to today's `xs` visually (closest match); typography from Figma Brand Buttons `sm` frame.
  - `m` — corresponds to today's `m` visually; typography from Figma `md` frame.
  - `l` — corresponds to today's `l` visually; typography from Figma `lg` frame.
  - `xl` — new largest size; typography from Figma `xl` frame.
- The exact per-size padding / font-size / font-weight / line-height / letter-spacing / text-case is sourced from Figma and recorded in `genericButton.module.scss` during implementation.

### Color × Type matrix

- 9 cells: `{purple, black, white} × {primary, secondary, tertiary}`.
- Each cell renders with the design-owner-supplied per-state token triple (background / border / text).
- The `destructive` color is a 10th, segregated cell tree (only `primary`/`secondary`/`tertiary` × `destructive`) preserved verbatim from today; not a Brand Button variant.

### States

- 5 visual states per cell:
  - **default** — no pseudo-class.
  - **hover** — `:hover` OR `.button-withForcedHover` (the existing `forceHover` Dropdown affordance).
  - **focus** — `:focus-visible` (keyboard only; mouse focus suppressed per WCAG good-practice).
  - **disabled** — `:disabled` OR `[aria-disabled="true"]`.
  - **loading** — `isPending=true` flips the relevant icon (or label position) to a spinner per the existing `spinnerIcon` rules:
    - text only → spinner only (label hidden via `buttonPendingWithHiddenText` class).
    - left icon → spinner replaces left icon.
    - right icon → spinner replaces right icon.
    - both icons → spinner on left, label and right icon preserved.

### Icon rendering

- `iconLeft`, `iconRight`, and `icon` (icon-only) are all `FontAwesomeV6IconProps`. Brand-family icons (`github`, `x-twitter`, etc.) auto-detected via `fontAwesomeV6BrandIconsMap` at the consumer wrapper (e.g. `ButtonLegacy.tsx`); consumers passing `FontAwesomeV6IconProps` directly are responsible for setting `iconFamily: 'brands'` when needed.
- Icon-only buttons (`isIconOnly=true`) render a square with size-specific footprint and require `icon` (the glyph) to be set. `text` MUST be undefined when `isIconOnly=true`.
- `iconLeft` and `iconRight` MAY both be set on the same Button; both render. This is the path the external-link fallback uses.

### `useAsLink` semantics

- `useAsLink=true` requires `href`; throws otherwise.
- `useAsLink=true` requires `onClick` to be undefined; throws otherwise (use `analyticsCallback` for click-time analytics on links).
- `useAsLink=true` + `target="_blank"` automatically adds `rel="noopener noreferrer"`.
- `useAsLink=false` requires `onClick`; throws otherwise.
- `useAsLink=false` requires `href` and `download` to be undefined; throws otherwise.

### Accessibility

- Focus ring: visible `:focus-visible` outline per the design-owner token grid (likely `--button-focus-ring`, single shared color across cells).
- Disabled: both `disabled` (button) and `aria-disabled="true"` set.
- Icon-only: `ariaLabel` is required by guidance; missing label emits a dev-mode console warning consistent with `checkButtonPropsForErrors` but does NOT block render.

### Server rendering

- Component renders entirely on the server. No `"use client"` directive. No browser-only dependency. Existing `forwardRef` to `HTMLButtonElement | HTMLAnchorElement` preserved.

### Validation errors (`checkButtonPropsForErrors`)

After the Brand Buttons feature, the validator throws on:

- `useAsLink && !href` → `Expect href prop when useAsLink is true`
- `useAsLink && onClick` → `Expect onClick prop to be undefined when useAsLink is true`
- `!useAsLink && !onClick` → `Expect onClick prop when useAsLink is false`
- `!useAsLink && href` → `Expect href prop to be undefined when useAsLink is false`
- `!useAsLink && download` → `Expect download prop to be undefined when useAsLink is false`
- `isIconOnly && !icon` → `Expect icon prop when isIconOnly is true`
- `isIconOnly && text` → `Expect text prop to be undefined when isIconOnly is true`
- `!isIconOnly && icon` → `Expect icon prop to be undefined when isIconOnly is false`
- `!isIconOnly && !text` → `Expect text prop when isIconOnly is false`

Removed (no longer thrown / warned):

- `color === 'gray' && type === 'primary'` throw → removed alongside `gray` itself.
- `color === 'gray' && type === 'tertiary' && !isIconOnly` throw → removed alongside `gray` itself.
- `color === 'purple' && type === 'secondary'` warning → removed (Secondary Purple is a first-class Brand variant).

---

## Forwarded ref contract

```ts
const Button = forwardRef<HTMLButtonElement | HTMLAnchorElement, ButtonProps>(...)
const LinkButton = forwardRef<HTMLAnchorElement, LinkButtonProps>(...)
const GenericButton = forwardRef<HTMLButtonElement | HTMLAnchorElement, GenericButtonProps>(...)
```

Ref behavior is preserved exactly as today.

---

## Backward-compatibility note

The only breaking changes for in-repo consumers are:

1. `color="gray"` no longer compiles. One affected call site: `packages/component-library/src/video/Video.tsx` (migrated to `color="black"` in the same PR — R2).
2. `size="xs"` no longer compiles. Affected call sites: `packages/component-library/src/video/Video.tsx` (`size="xs"` → `size="s"` in the same PR) and three Button story files (xs story removed).

External consumers of `@code-dot-org/component-library/button` (none known outside this repo today) would see the same two breaks.
