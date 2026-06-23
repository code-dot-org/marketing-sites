# Contract: Text Link ComponentDefinition (`link`) — Per-Tenant Factory Delta

**Feature**: 008-brand-buttons
**Date**: 2026-06-22 (revised — no Contentful Studio work)
**Exported component id**: `link` (unchanged for both tenants)
**Source file**: `apps/marketing/src/components/contentful/link/LinkContentfulDefinition.ts`
**Registration files**: `apps/marketing/src/contentful/registration/{code.org,csforall}/index.ts`

## Important: this is NOT a Contentful content-type change

The Text Link's Studio options are hard-coded in `LinkContentfulComponentDefinition.variables` — a code-side artifact loaded by the Experiences SDK. This contract documents the **code edit** that splits that definition into two tenant-specific factories.

- The Contentful content type `link` (used by authors to create reusable Link entries that bind into Buttons and Text Links) is **not touched**. Link entries continue to validate and read identically on both tenants.
- **No Contentful Studio steps. No `ctf_get_content_type` MCP re-read.**
- Existing composed Text Links inside Experience entries auto-validate against the per-tenant Component Definition; values outside the narrowed enums on code.org auto-map at render time per FR-029.
- Studio editors immediately see the narrowed Design-tab options after deploy.

## Application-side: two ComponentDefinition factories

`LinkContentfulDefinition.ts` is refactored to export two factories instead of a single definition:

```ts
import {ComponentDefinition} from '@contentful/experiences-sdk-react';
import {brandTextColorOptions} from '@/components/common/colors';
import {removeMarginBottomDefinition} from '@/components/common/definitions';

const BASE_VARIABLES = {
  isStrong: {
    displayName: 'Make this link bold',
    type: 'Boolean',
    defaultValue: false,
    group: 'style',
  },
  icon: {
    displayName: 'Icon',
    description: 'FontAwesome icon name (e.g. "arrow-right"). Ignored when "Is this link external?" is on.',
    type: 'Text',
    group: 'style',
    validations: { bindingSourceType: ['entry', 'manual'] },
  },
  iconPosition: {
    displayName: 'Icon Position',
    type: 'Text',
    defaultValue: 'right',
    group: 'style',
    validations: { in: [
      {value: 'left',  displayName: 'Left'},
      {value: 'right', displayName: 'Right'},
    ]},
  },
  children: {
    displayName: 'Link Label',
    type: 'Text',
    defaultValue: 'Link',
    group: 'content',
    validations: { bindingSourceType: ['entry', 'manual'] },
  },
  href: {
    displayName: 'Link URL',
    type: 'Text',
    defaultValue: 'https://code.org',
    group: 'content',
    validations: { bindingSourceType: ['entry', 'manual'] },
  },
  isLinkExternal: {
    displayName: 'Is this link external? (Does this link leave the site?)',
    description: 'External links will be opened in a new tab, while internal links will be opened in the same tab.',
    type: 'Boolean',
    defaultValue: false,
    group: 'content',
    validations: { bindingSourceType: ['entry', 'manual'] },
  },
  removeMarginBottom: {...removeMarginBottomDefinition},
  ariaLabel: {
    displayName: 'Aria Label',
    type: 'Text',
    group: 'content',
    validations: { bindingSourceType: ['entry', 'manual'] },
  },
};

// code.org-only ComponentDefinition: narrows color to 3 Hierarchies + size to s/m/l
export const BrandLinkContentfulComponentDefinition: ComponentDefinition = {
  id: 'link',
  name: 'Text Link',
  category: '03: Content Building Blocks',
  thumbnailUrl: '...',           // unchanged
  tooltip: { ... },              // unchanged
  builtInStyles: ['cfTextAlign'],
  variables: {
    color: {
      displayName: 'Color',
      type: 'Text',
      defaultValue: 'color',
      group: 'style',
      validations: {
        in: [
          {value: 'color', displayName: 'Color (Purple)'},
          {value: 'black', displayName: 'Black'},
          {value: 'white', displayName: 'White'},
        ],
      },
    },
    size: {
      displayName: 'Size',
      type: 'Text',
      defaultValue: 'm',
      group: 'style',
      validations: {
        in: [
          {value: 's', displayName: 'Small'},
          {value: 'm', displayName: 'Medium'},
          {value: 'l', displayName: 'Large'},
        ],
      },
    },
    ...BASE_VARIABLES,
  },
};

// csforall ComponentDefinition: keeps the existing 22-color + 4-size enum (today's behavior)
export const LegacyLinkContentfulComponentDefinition: ComponentDefinition = {
  id: 'link',
  name: 'Text Link',
  category: '03: Content Building Blocks',
  thumbnailUrl: '...',           // unchanged
  tooltip: { ... },              // unchanged
  builtInStyles: ['cfTextAlign'],
  variables: {
    color: {
      displayName: 'Color',
      type: 'Text',
      defaultValue: 'purplePrimary',
      group: 'style',
      validations: { in: brandTextColorOptions('purplePrimary') },
    },
    size: {
      displayName: 'Size',
      type: 'Text',
      defaultValue: 'm',
      group: 'style',
      validations: { in: [
        {value: 'l',  displayName: 'Large'},
        {value: 'm',  displayName: 'Medium'},
        {value: 's',  displayName: 'Small'},
        {value: 'xs', displayName: 'Extra Small'},
      ]},
    },
    ...BASE_VARIABLES,
  },
};

// Existing single-export name preserved for any callers that import it directly; aliases to LegacyLink.
export const LinkContentfulComponentDefinition = LegacyLinkContentfulComponentDefinition;
```

## Per-tenant registration updates

### `apps/marketing/src/contentful/registration/code.org/index.ts`

```diff
- import Link, { LinkContentfulComponentDefinition } from '@/components/contentful/link';
+ import Link, { BrandLinkContentfulComponentDefinition } from '@/components/contentful/link';

  ...
  {
    component: Link,
-   definition: LinkContentfulComponentDefinition,
+   definition: BrandLinkContentfulComponentDefinition,
  },
```

### `apps/marketing/src/contentful/registration/csforall/index.ts`

```diff
- import Link, { LinkContentfulComponentDefinition } from '@/components/contentful/link';
+ import Link, { LegacyLinkContentfulComponentDefinition } from '@/components/contentful/link';

  ...
  {
    component: Link,
-   definition: LinkContentfulComponentDefinition,
+   definition: LegacyLinkContentfulComponentDefinition,
  },
```

The aliased `LinkContentfulComponentDefinition` export remains for any other callers (none found in current grep, but kept for safety).

---

## Studio editor surface (effect)

| Tenant   | Studio `color` options                                                                  | Studio `size` options                                           |
| -------- | --------------------------------------------------------------------------------------- | --------------------------------------------------------------- |
| code.org | `Color (Purple)` / `Black` / `White` (3 Hierarchies — default `Color (Purple)`)         | `Small` / `Medium` / `Large` (default `Medium`)                 |
| csforall | Full 22-option `brandTextColorOptions('purplePrimary')` list (default `Purple Primary`) | `Extra Small` / `Small` / `Medium` / `Large` (default `Medium`) |

Existing entries (regardless of tenant) with values outside their tenant's narrowed enum render via the render-time auto-mapping in `Link.tsx` (code.org) or pass through to legacy styling (csforall).

---

## Validation rules

- `BrandLinkContentfulComponentDefinition` has exactly 3 color options and 3 size options.
- `LegacyLinkContentfulComponentDefinition` matches today's `LinkContentfulComponentDefinition` byte-for-byte except for the export name.
- Both definitions share the same `id: 'link'` (same Contentful content type).
- Both definitions share the same `category`, `thumbnailUrl`, `tooltip`, `builtInStyles`.
- The shared variables (`isStrong`, `icon`, `iconPosition`, `children`, `href`, `isLinkExternal`, `removeMarginBottom`, `ariaLabel`) come from a single `BASE_VARIABLES` constant — no duplication.

---

## Out of scope

- No Contentful Studio change.
- No new content type.
- No removal of existing fields (`isStrong` etc. stay in the Contentful schema even though code.org renders it as no-op).
- No changes to existing entries.
- No `ctf_get_content_type` step required (no Contentful state change to confirm).
