# Data Model: Activity Catalog on Code.org

**Feature**: 011-activity-catalog-codeorg-migration | **Date**: 2026-08-18

## Entities

### Activity (proposed Contentful content type `activity`, Code.org space, `sandbox` env)

Field ids intentionally mirror the code contract in `apps/marketing/src/modules/activityCatalog/types/Activity.ts` + `orama/createDatabase.ts` so no data-layer mapping code is needed. Source-of-truth definition for Dee to apply: [contracts/contentful-activity-content-type.md](./contracts/contentful-activity-content-type.md).

| Field id              | Type                  | Required | Used by                                          |
| --------------------- | --------------------- | -------- | ------------------------------------------------ |
| `title`               | Symbol                | yes      | card title, sort key, search term                |
| `shortDescription`    | Symbol                | yes      | card description, search term                    |
| `longDescription`     | Text                  | no       | activity detail/search                           |
| `image`               | Link → Asset (image)  | yes      | card image (`getAbsoluteImageUrl`)               |
| `organization`        | Symbol                | no       | "Created By" facet (dropdown), card chip         |
| `ages`                | Array\<Symbol\>       | no       | "Age" facet                                      |
| `topic`               | Array\<Symbol\>       | no       | "Topic" facet                                    |
| `activityType`        | Array\<Symbol\>       | no       | "Activity Type" facet                            |
| `length`              | Array\<Symbol\>       | no       | "Length" facet                                   |
| `accessibilitys`      | Array\<Symbol\>       | no       | "Accessibility" facet (id spelling matches code) |
| `technologyClassroom` | Array\<Symbol\>       | no       | "Classroom Technology" facet                     |
| `languageProgramming` | Array\<Symbol\>       | no       | "Programming Language" facet                     |
| `supportedLanguages`  | Array\<Symbol\>       | no       | "Language" facet (collapsed by default)          |
| `languagesText`       | Symbol                | no       | languages display text                           |
| `standards`           | Text                  | no       | standards display                                |
| `tutorialID`          | Symbol                | yes      | card id / event metadata / React key             |
| `featuredPosition`    | Integer               | no       | sort priority (missing → sorted last)            |
| `primaryLinkRef`      | Link → Entry (`link`) | yes      | card primary button                              |
| `secondaryLinkRef`    | Link → Entry (`link`) | no       | card secondary button                            |

**Note**: exact Symbol-vs-Text choices and any `in`-validations for facet values must be cross-checked against the CSforAll space's `curriculum` type before creation — the source schema is code-inferred (see research.md, D6).

### Tag (Contentful metadata tags, `sandbox` env)

- `hour-of-ai` — marks activities in the Hour of AI catalog.
- `hour-of-code` — marks activities in the legacy Hour of Code catalog.
- One activity entry may carry both tags (appears in both catalogs).

### Link (existing Code.org content type `link` — reused, unchanged)

Target of `primaryLinkRef`/`secondaryLinkRef`; rendered as card buttons (serialized to JSON server-side, deserialized in `ActivityCollection`).

### Facet (derived, not stored)

Computed server-side by Orama from the nine facet fields above; configured in `components/contentful/activityCatalog/config/facets.ts` (labels, checkbox vs dropdown). No schema representation.

### OramaActivity (in-memory)

`Activity` + `sortKey` (`paddedFeaturedPosition + title`); built per render in `createDatabase.ts`. Unchanged.

## Relationships

```text
activity ──image──────────▶ Asset (image)
activity ──primaryLinkRef─▶ link (entry)
activity ──secondaryLinkRef▶ link (entry)
activity ──metadata.tags──▶ hour-of-ai | hour-of-code
```

Fetch depth: the delivery query resolves linked `link` entries and image assets at include depth 1 — well inside the SDK's 2-level limit; no `addLeafReferencesToExperience` concern (this is a direct CDA query, not an Experience).

## State transitions

- Ported entries are created as **drafts**; Dee reviews and publishes (batch state rules). The delivery client only sees published entries, so the aiday catalog fills in as entries are published; the preview client (draft mode) can verify drafts beforehand.

## Validation rules

- `ValidActivityTypes` (code): route 404s unless `[activityType]` ∈ {`hour-of-ai`, `hour-of-code`}.
- Entries missing optional facet fields degrade gracefully (`createDatabase` defaults: `[]` / `''` / sorted-last).
- `featuredPosition` < 999999 sorts an entry into the featured prefix ordering.
