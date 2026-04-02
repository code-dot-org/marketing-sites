# Data Model: Interactive Gap Analysis Map

## Entity: State Metric Record

Represents a single selectable geography in the map experience.

### Fields

| Field | Type | Required | Description |
|------|------|----------|-------------|
| `id` | string | Yes | Stable geography identifier used by the map and data contract. |
| `code` | string | Yes | Two-letter postal-style abbreviation used for labels and matching geometry. |
| `name` | string | Yes | Public display name for the geography. |
| `tier` | enum | Yes | Policy progress classification shown in the heatmap and panel. |
| `accessPercent` | number | Yes | Aggregate percentage representing institutional access. |
| `participationPercent` | number | Yes | Aggregate percentage representing student participation. |
| `reportUrl` | string | No | Public destination for the state's report asset. |
| `presentationUrl` | string | No | Public destination for the state's presentation asset. |
| `isSelectable` | boolean | Yes | Indicates whether the geography should respond to interaction; defaults to true for valid records. |
| `displayRegion` | enum | Yes | Identifies whether the geography belongs in the contiguous map, the Alaska inset, or the Hawaii inset. |

### Derived Values

| Derived field | Rule |
|--------------|------|
| `gapPercent` | `accessPercent - participationPercent` |
| `hasReport` | `reportUrl` is present and valid |
| `hasPresentation` | `presentationUrl` is present and valid |
| `isDataComplete` | Required metric and tier fields are present |

### Validation Rules

- `code` must be unique across all records.
- `name` must be unique across all records in the published dataset.
- `tier` must match one of the supported policy tiers.
- `accessPercent` and `participationPercent` must be numeric percentage values suitable for public display.
- Missing `reportUrl` or `presentationUrl` is allowed and suppresses the related action.
- Invalid or incomplete records must degrade to a neutral unavailable presentation rather than rendering misleading values.

## Entity: Policy Progress Tier

Describes the categorical status used by the heatmap and panel treatment.

### Fields

| Field | Type | Required | Description |
|------|------|----------|-------------|
| `id` | string | Yes | Stable tier key. |
| `label` | string | Yes | Public-facing label, such as lagging, progressing, or leading. |
| `description` | string | No | Optional explanatory text for stories, tooltips, or future editorial context. |
| `themeTokens` | object | Yes | Semantic visual treatment values that remain legible on inherited light or dark themes. |

### Validation Rules

- Tier IDs must be stable and reusable across all records.
- Tier styles must remain distinguishable in both light and dark inherited theme contexts.

## Entity: Map Geometry Record

Describes the rendered selectable region metadata for a geography.

### Fields

| Field | Type | Required | Description |
|------|------|----------|-------------|
| `geographyId` | string | Yes | Links geometry to a `State Metric Record`. |
| `regionType` | enum | Yes | `contiguous`, `alaskaInset`, `hawaiiInset`, or `smallStateCallout` if needed by final rendering. |
| `rendererSource` | string | Yes | Identifies the renderer package or source used to draw the geography. |
| `hitAreaStrategy` | string | No | Optional note describing any package-level or wrapper-level treatment used to preserve small-state selectability. |
| `labelAnchor` | object | No | Optional anchor point for labels or callouts if the selected renderer needs local overrides. |

### Validation Rules

- Every in-scope geography must have exactly one primary geometry metadata record.
- Small East Coast states must have geometry or hit-area treatment that preserves individual selection.
- Alaska and Hawaii must use inset placement records tied to their same geography IDs.

## Entity: Selection Panel State

Represents the current interaction state of the floating data panel.

### Fields

| Field | Type | Required | Description |
|------|------|----------|-------------|
| `mode` | enum | Yes | `default`, `preview`, or `locked`. |
| `activeGeographyId` | string | No | The currently hovered or locked geography. |
| `activeSource` | enum | No | `hover`, `click`, `keyboard`, or `touch`. |

### State Transitions

| From | Event | To |
|------|-------|----|
| `default` | Hover a valid geography | `preview` |
| `default` | Click/tap/keyboard activate a valid geography | `locked` |
| `preview` | Hover a different valid geography | `preview` |
| `preview` | Leave interactive geography | `default` |
| `preview` | Click/tap/keyboard activate current geography | `locked` |
| `locked` | Interact with panel actions | `locked` |
| `locked` | Activate a different geography | `locked` with new `activeGeographyId` |
| `locked` | Close panel or outside click | `default` |

## Entity: State Asset Link

Represents a public document destination associated with a geography.

### Fields

| Field | Type | Required | Description |
|------|------|----------|-------------|
| `geographyId` | string | Yes | Links the asset to a geography. |
| `kind` | enum | Yes | `report` or `presentation`. |
| `url` | string | Yes | Public destination URL. |
| `label` | string | Yes | Visitor-facing action label. |

### Validation Rules

- Only valid links should be exposed to visitors.
- Links are visitor-initiated outbound navigation only; no hidden background egress is permitted.

## Relationships

- One `State Metric Record` belongs to one `Policy Progress Tier`.
- One `State Metric Record` has one primary `Map Geometry Record`.
- One `State Metric Record` may have zero, one, or two `State Asset Link` records.
- `Selection Panel State.activeGeographyId` references one `State Metric Record`.
