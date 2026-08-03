# Contract: Button ComponentDefinition (`button`) — Variables Update

**Feature**: 008-brand-buttons
**Date**: 2026-06-22 (revised — no Contentful Studio work)
**Exported component id**: `button` (unchanged)
**Source file**: `apps/marketing/src/components/contentful/corporateSite/buttonLegacy/ButtonLegacyContentfulDefinition.ts`
**Wrapper file**: `apps/marketing/src/components/contentful/corporateSite/buttonLegacy/ButtonLegacy.tsx`

## Important: this is NOT a Contentful content-type change

There is **no `button` content type in Contentful**. The Button is a Contentful Experiences component whose options are hard-coded in `ButtonLegacyContentfulComponentDefinition.variables` — a code-side artifact loaded by the Experiences SDK to render the Button component palette in Studio. This contract documents the **code edit** to that `variables` object.

- **No Contentful Studio steps.**
- **No `ctf_get_content_type` MCP re-read.**
- **No human-applied schema delta.**
- Existing composed Buttons inside Experience entries auto-validate against the expanded `variables` shape; missing values use the defaults below.
- Studio editors immediately see the new Design-tab options on any Experience after deploy.

The Content-tab variables (`text`, `href`, `isLinkExternal`, `ariaLabel`) keep their existing binding contract — they bind to a Link content-type entry's fields or are authored manually per Button. **This contract is unchanged.**

---

## Existing variables (no change)

The Content-tab and existing Design-tab variables stay as-is:

| Variable id      | Studio tab | Type      | Default            | Validation                                                                                                                         |
| ---------------- | ---------- | --------- | ------------------ | ---------------------------------------------------------------------------------------------------------------------------------- |
| `text`           | Content    | `Text`    | `Button`           | `bindingSourceType: ['entry', 'manual']`                                                                                           |
| `href`           | Content    | `Text`    | `https://code.org` | `bindingSourceType: ['entry', 'manual']`                                                                                           |
| `isLinkExternal` | Content    | `Boolean` | `false`            | `bindingSourceType: ['entry', 'manual']`                                                                                           |
| `ariaLabel`      | Content    | `Text`    | (empty)            | `bindingSourceType: ['entry', 'manual']`                                                                                           |
| `color`          | Design     | `Text`    | `purple`           | `in`: `[{value: 'purple', displayName: 'Purple'}, {value: 'black', displayName: 'Black'}, {value: 'white', displayName: 'White'}]` |
| `iconLeftName`   | Design     | `Text`    | (empty)            | none (free-form)                                                                                                                   |

## Modified variable — `type` (enum expansion)

| Variable id | Studio tab | Type   | Default   | Validation BEFORE                                                                                  | Validation AFTER                                                                                                                                 |
| ----------- | ---------- | ------ | --------- | -------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| `type`      | Design     | `Text` | `primary` | `in: [{value: 'primary', displayName: 'Primary'}, {value: 'secondary', displayName: 'Secondary'}]` | `in: [{value: 'primary', displayName: 'Primary'}, {value: 'secondary', displayName: 'Secondary'}, {value: 'tertiary', displayName: 'Tertiary'}]` |

## New variable — `size`

```ts
size: {
  displayName: 'Size',
  type: 'Text',
  defaultValue: 'm',
  group: 'style',                                  // Design tab
  validations: {
    in: [
      {value: 's',  displayName: 'Small'},
      {value: 'm',  displayName: 'Medium'},
      {value: 'l',  displayName: 'Large'},
      {value: 'xl', displayName: 'Extra Large'},
    ],
  },
},
```

## New variable — `iconRightName`

```ts
iconRightName: {
  displayName: 'Right Icon Name',
  description: 'Optional. Font Awesome icon name to render on the right side of the label.',
  type: 'Text',
  group: 'style',                                  // Design tab
  defaultValue: '',
},
```

## New variable — `isIconOnly`

```ts
isIconOnly: {
  displayName: 'Icon Only',
  description: 'When enabled, renders a square button with only the Left Icon Name as the glyph. Text is hidden. Aria Label is required for accessibility.',
  type: 'Boolean',
  defaultValue: false,
  group: 'style',                                  // Design tab
},
```

---

## Studio tab order (effect)

After this code edit deploys, Studio editors see the following grouped options when editing a Button:

**Content tab** (unchanged): `text`, `href`, `isLinkExternal`, `ariaLabel`
**Design tab**: `color`, `type`, `size`, `iconLeftName`, `iconRightName`, `isIconOnly`

The order within each tab is controlled by the position of each variable in the `variables` object. The recommended Design-tab order above matches the spec's grouping intent.

---

## Wrapper update (`ButtonLegacy.tsx`)

The wrapper consumes the new variables and passes them through to `LinkButton`. Sketch:

```ts
type ButtonProps = {
  text?: string;
  color: 'purple' | 'black' | 'white';
  type: 'primary' | 'secondary' | 'tertiary';     // NEW: tertiary
  size?: 's' | 'm' | 'l' | 'xl';                  // NEW, default 'm'
  href?: string;
  isLinkExternal?: boolean;
  iconLeftName?: string;
  iconRightName?: string;                          // NEW
  isIconOnly?: boolean;                            // NEW
  ariaLabel?: EntryFields.Text;
};

// Render body:
const isLeftIconBrand = !!iconLeftName && fontAwesomeV6BrandIconsMap.has(iconLeftName);
const isRightIconBrand = !!iconRightName && fontAwesomeV6BrandIconsMap.has(iconRightName);

const authorIconLeft = iconLeftName
  ? {iconName: iconLeftName, iconStyle: 'solid' as const, iconFamily: isLeftIconBrand ? 'brands' as const : undefined}
  : undefined;

const authorIconRight = iconRightName
  ? {iconName: iconRightName, iconStyle: 'solid' as const, iconFamily: isRightIconBrand ? 'brands' as const : undefined}
  : undefined;

// External-link fallback: if no author right icon AND external link, use the existing externalLinkIconProps.
const effectiveIconRight = authorIconRight ?? (isLinkExternal ? externalLinkIconProps : undefined);

if (isIconOnly) {
  return (
    <LinkButton
      size={size ?? 'm'}
      href={href}
      target={isLinkExternal ? '_blank' : '_self'}
      type={type}
      color={color}
      ariaLabel={ariaLabel}
      isIconOnly
      icon={authorIconLeft}     // glyph reads from iconLeftName when icon-only
    />
  );
}

return (
  <LinkButton
    text={text}
    size={size ?? 'm'}
    href={href}
    target={isLinkExternal ? '_blank' : '_self'}
    type={type}
    color={color}
    aria-label={ariaLabel}
    iconLeft={authorIconLeft}
    iconRight={effectiveIconRight}
  />
);
```

---

## Out of scope

- Any Contentful Studio change. No human-applied schema delta. No `ctf_get_content_type` re-read step.
- No changes to the CSforAll `button-mui` ComponentDefinition or its wrapper.
- No changes to existing Buttons composed in existing Experience entries (zero-touch per FR-014).
- No new ComponentDefinition. No definition renames. The exported `id: 'button'` stays.
