# Contract: Contentful changes — Code.org space `90t6bu6vlf76`, environment `sandbox`

All changes below are **proposals for Dee to apply or approve** (schema stays with Dee; entry batches are Dee-approved, pilot-first, machine-verified by re-read). Nothing here is executed without confirmation. After application, the resulting state must be re-read via CDA/MCP and diffed against this contract.

## 1. New content type: `activity` (name: "🎯 Activity", display field: `title`)

> Field ids are load-bearing: they must match the code contract exactly (`Activity.ts`, `createDatabase.ts`). Before creating, cross-check types/validations against the CSforAll space's `curriculum` type (source schema is code-inferred — see research.md D6). Facet-value `in`-validations (age bands, lengths, topics, …) should be copied from the CSforAll source fields where they exist so the facet vocabulary stays identical.

| #   | Field id              | Name                      | Type            | Required | Validations / notes                               |
| --- | --------------------- | ------------------------- | --------------- | -------- | ------------------------------------------------- |
| 1   | `title`               | Title                     | Symbol          | yes      | display field                                     |
| 2   | `shortDescription`    | Short Description         | Symbol          | yes      | card copy                                         |
| 3   | `longDescription`     | Long Description          | Text            | no       |                                                   |
| 4   | `image`               | Image                     | Link → Asset    | yes      | `linkMimetypeGroup: [image]`                      |
| 5   | `organization`        | Created By (Organization) | Symbol          | no       | "Created By" facet                                |
| 6   | `ages`                | Ages                      | Array\<Symbol\> | no       | facet; copy `in` values from CSforAll             |
| 7   | `topic`               | Topic                     | Array\<Symbol\> | no       | facet; copy `in` values from CSforAll             |
| 8   | `activityType`        | Activity Type             | Array\<Symbol\> | no       | facet; copy `in` values from CSforAll             |
| 9   | `length`              | Length                    | Array\<Symbol\> | no       | facet; copy `in` values from CSforAll             |
| 10  | `accessibilitys`      | Accessibility             | Array\<Symbol\> | no       | facet; **id spelling intentional** (matches code) |
| 11  | `technologyClassroom` | Classroom Technology      | Array\<Symbol\> | no       | facet; copy `in` values from CSforAll             |
| 12  | `languageProgramming` | Programming Language      | Array\<Symbol\> | no       | facet; copy `in` values from CSforAll             |
| 13  | `supportedLanguages`  | Supported Languages       | Array\<Symbol\> | no       | facet; copy `in` values from CSforAll             |
| 14  | `languagesText`       | Languages Text            | Symbol          | no       |                                                   |
| 15  | `standards`           | Standards                 | Text            | no       |                                                   |
| 16  | `tutorialID`          | Tutorial ID               | Symbol          | yes      | unique; used as card id / analytics key           |
| 17  | `featuredPosition`    | Featured Position         | Integer         | no       | lower = earlier; empty = unfeatured               |
| 18  | `primaryLinkRef`      | Primary Link              | Link → Entry    | yes      | `linkContentType: [link]`                         |
| 19  | `secondaryLinkRef`    | Secondary Link            | Link → Entry    | no       | `linkContentType: [link]`                         |

No Studio/Experience component registration is needed — the catalog page is fully coded and must **not** get an Experience entry.

## 2. New tags

| Tag id         | Tag name     | Visibility |
| -------------- | ------------ | ---------- |
| `hour-of-ai`   | Hour of AI   | public     |
| `hour-of-code` | Hour of Code | public     |

(Tag ids are queried verbatim by `metadata.tags.sys.id[in]` — ids must match the route's `activityType` values exactly.)

## 3. Entry porting (batch, Dee-approved)

- Source: CSforAll space, published `curriculum` entries tagged `hour-of-ai` / `hour-of-code` (requires CSforAll read credentials or an export from Dee).
- Target: `activity` entries in Code.org `sandbox`, created as **drafts**; carry over the same tag(s).
- Referenced `link` entries and image assets are ported too; all cross-references remapped to the new sandbox ids within the batch (the existing prod↔sandbox remap table does not cover CSforAll sources).
- Process: 1 pilot entry → Dee approves → full batch → machine verification by re-reading every written entry and diffing against the source mapping (watch for U+00A0 loss) → Dee publishes.

## 4. Post-application verification (after Dee applies/approves)

```text
GET /spaces/90t6bu6vlf76/environments/sandbox/content_types/activity   → fields match §1
GET .../tags                                                           → both tags from §2 exist
GET .../entries?content_type=activity&metadata.tags.sys.id[in]=hour-of-ai   (preview API for drafts)
GET .../entries?content_type=activity&metadata.tags.sys.id[in]=hour-of-code
    → counts match the CSforAll source counts
```

## 5. Explicitly out of scope (later production project)

- Any change in the `master` environment (type, tags, entries).
- Adding `activity` to `carousel.slides` link validation (only if Experience-authored activity carousels are wanted).
- CSforAll space: read-only source; no writes of any kind.
