# Contract: Contentful Content Type — `icon` (NEW)

**Feature**: 007-icon-component

This document is the proposal for the new `icon` content type in Contentful. **It MUST be applied by a human via the Contentful Studio UI (or a human-reviewed migration script), then re-read via Contentful MCP to confirm the resulting schema matches this proposal, before the component code in `apps/marketing/src/components/contentful/icon/` is merged.**

No application code in this feature performs Contentful management-API writes. (Constitution principle V + spec FR-022.)

---

## Top-level

| Property                                                           | Value                                                                          |
| ------------------------------------------------------------------ | ------------------------------------------------------------------------------ |
| Content type ID                                                    | `icon`                                                                         |
| Display name                                                       | `Icon`                                                                         |
| Description (optional)                                             | A single decorated Font Awesome icon, used as a decoration in marketing pages. |
| Display field                                                      | `iconName`                                                                     |
| Studio category (Component definition only — not the content type) | `03: Content Building Blocks`                                                  |

The `id`, `name`, `category`, `thumbnailUrl`, and `tooltip` strings live in the Contentful **component definition** (`iconContentfulDefinition.ts`), not the content type. Only the field shape below is the actual Contentful schema.

---

## Fields

### 1. `iconName`

| Property      | Value                                                               |
| ------------- | ------------------------------------------------------------------- |
| Field ID      | `iconName`                                                          |
| Field name    | `Icon name`                                                         |
| Type          | `Symbol` (Short text)                                               |
| Required      | Yes                                                                 |
| Default value | `lightbulb`                                                         |
| Validations   | _(none)_                                                            |
| Help text     | Font Awesome icon name (e.g. `lightbulb`, `github`, `arrow-right`). |

### 2. `color`

| Property      | Value                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| ------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Field ID      | `color`                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| Field name    | `Color`                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| Type          | `Symbol` (Short text)                                                                                                                                                                                                                                                                                                                                                                                                                           |
| Required      | No                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| Default value | `purplePrimary`                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| Validations   | `in`: the 22 universal CodeAI brand-color stored values (`black`, `white`, `purpleDark`, `purplePrimary`, `purpleMid`, `purpleLight`, `blueDark`, `bluePrimary`, `blueMid`, `blueLight`, `greenDark`, `greenPrimary`, `greenMid`, `greenLight`, `orangeDark`, `orangePrimary`, `orangeMid`, `orangeLight`, `pinkDark`, `pinkPrimary`, `pinkMid`, `pinkLight`). **No legacy values** (`primary`, `strong`, `white` legacy aliases are excluded). |
| Help text     | Icon glyph color from the brand palette.                                                                                                                                                                                                                                                                                                                                                                                                        |

### 3. `backgroundFill`

| Property      | Value                                              |
| ------------- | -------------------------------------------------- |
| Field ID      | `backgroundFill`                                   |
| Field name    | `Background fill`                                  |
| Type          | `Symbol` (Short text)                              |
| Required      | No                                                 |
| Default value | `none`                                             |
| Validations   | `in`: `none`, `filled`, `outline`                  |
| Help text     | Choose how the background renders behind the icon. |

### 4. `backgroundShape`

| Property      | Value                                                                      |
| ------------- | -------------------------------------------------------------------------- |
| Field ID      | `backgroundShape`                                                          |
| Field name    | `Background shape`                                                         |
| Type          | `Symbol` (Short text)                                                      |
| Required      | No                                                                         |
| Default value | `circle`                                                                   |
| Validations   | `in`: `circle`, `square`                                                   |
| Help text     | Shape of the background or outline. `square` renders with rounded corners. |

### 5. `backgroundColor`

| Property      | Value                                                                                                      |
| ------------- | ---------------------------------------------------------------------------------------------------------- |
| Field ID      | `backgroundColor`                                                                                          |
| Field name    | `Background color`                                                                                         |
| Type          | `Symbol` (Short text)                                                                                      |
| Required      | No                                                                                                         |
| Default value | `#f6f6f6`                                                                                                  |
| Validations   | `in`: `#f6f6f6` (Light Grey — Icon-local default), plus the 22 universal CodeAI brand-color stored values. |
| Help text     | Color of the filled background or the outline stroke. Defaults to a light grey.                            |

### 6. `iconSize`

| Property      | Value                                          |
| ------------- | ---------------------------------------------- |
| Field ID      | `iconSize`                                     |
| Field name    | `Icon size`                                    |
| Type          | `Integer`                                      |
| Required      | No                                             |
| Default value | `32`                                           |
| Validations   | _(none — no min/max clamp; see FR-013)_        |
| Help text     | Icon glyph size in CSS pixels. Defaults to 32. |

---

## Field groups (Contentful component-definition `group` value)

These groupings affect Studio editor layout only (set in the component definition, not the content type schema). All Icon fields live under the Design (`style`) tab — matching the existing Icon Highlight pattern where `iconName` sits in `style`. The Content tab is intentionally empty (Icon has no headline, body, or link content):

- `content`: _(none)_
- `style`: `iconName`, `iconSize`, `color`, `backgroundFill`, `backgroundShape`, `backgroundColor`

---

## Migration / human-applied step

1. Open Contentful Studio for the **code.org** space.
2. Create a new content type with the table above. (Or apply via a contentful-migration script reviewed by the author.)
3. Once created, run a Contentful MCP read against the new content type to confirm:
   - All six fields exist with the exact IDs, types, required-flags, and `in` validation lists shown above.
   - Default values match exactly.
4. Update this document's status (or the PR description) to note: "Confirmed via Contentful MCP on YYYY-MM-DD".
5. Only then merge the component code.

## Field-order in the editor

(Authoring UX — not part of the schema, but the component definition's variable-declaration order controls this.)

1. `iconName`
2. `iconSize`
3. `color`
4. `backgroundFill`
5. `backgroundShape`
6. `backgroundColor`

## Out-of-schema (intentionally omitted from v1)

- `title` / `aria-label` — deferred to a follow-up A11y pass.
- `iconStyle` / `iconFamily` — automatically resolved by the component.
- `colorOverride` hex on the glyph — deferred; not in v1.
- `padding`, `margin`, `cornerRadius` — fixed by component constants (FR-014, FR-015).
