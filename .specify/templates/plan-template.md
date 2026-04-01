# Implementation Plan: [FEATURE]

**Branch**: `[###-feature-name]` | **Date**: [DATE] | **Spec**: [link]
**Input**: Feature specification from `/specs/[###-feature-name]/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/plan-template.md` for the execution workflow.

## Summary

[Extract from feature spec: primary requirement + technical approach from research]

## Technical Context

<!--
  ACTION REQUIRED: Replace the content in this section with the technical details
  for the project. The structure here is presented in advisory capacity to guide
  the iteration process.
-->

**Language/Version**: [e.g., Python 3.11, Swift 5.9, Rust 1.75 or NEEDS CLARIFICATION]  
**Primary Dependencies**: [e.g., FastAPI, UIKit, LLVM or NEEDS CLARIFICATION]  
**Storage**: [if applicable, e.g., PostgreSQL, CoreData, files or N/A]  
**Contentful Data Model**: [existing type reused / existing type extended / new type proposed / no Contentful change needed]  
**Testing**: [e.g., pytest, XCTest, cargo test or NEEDS CLARIFICATION]  
**Target Platform**: [e.g., Linux server, iOS 15+, WASM or NEEDS CLARIFICATION]
**Project Type**: [e.g., library/cli/web-service/mobile-app/compiler/desktop-app or NEEDS CLARIFICATION]  
**Performance Goals**: [domain-specific, e.g., 1000 req/s, 10k lines/sec, 60 fps or NEEDS CLARIFICATION]  
**Constraints**: [domain-specific, e.g., <200ms p95, <100MB memory, offline-capable or NEEDS CLARIFICATION]  
**Scale/Scope**: [domain-specific, e.g., 10k users, 1M LOC, 50 screens or NEEDS CLARIFICATION]

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **Availability, Cached, Secure, Observable, and Privacy-Safe Operations**:
  Note required logging, metrics, traces, analytics, cache or revalidation
  changes, plus any privacy, consent, or third-party data handling
  considerations. State the expected availability and performance impact on hot
  paths. Explicitly call out Code.org Privacy Policy alignment, whether
  FERPA/student-record concerns exist, and any required privacy or security
  review.
- **Shared System First And SSR By Default**: Identify every affected workspace
  under `apps/*` and `packages/*`; explain what will be added to shared layers
  versus app-specific code, note any brand-specific switchboards involved,
  justify any intentional duplication, and call out all required client-side
  boundaries, hydration costs, or browser-only dependencies that prevent the
  change from remaining server-rendered by default.
- **WCAG AA And Layered Storybook UX**: List the Storybook stories, fixtures,
  or preview surfaces that will demonstrate the change, including
  `apps/design-system-storybook`, `apps/marketing-storybook`, or page-level
  previews when relevant; classify whether the work is atomic/molecular or
  higher-level marketing composition, and state the WCAG AA expectations that
  must be preserved or improved.
- **Quality Gates Are Release Gates**: Define the minimum lint, typecheck, and
  automated test coverage required for this change, and state whether the
  change belongs in unit, Storybook, integration, visual, or end-to-end
  coverage. Note which Storybook CI path must pass. If any category is omitted,
  provide an explicit reason.
- **Spec-Driven Incremental Delivery**: Confirm the plan can be delivered in
  independently testable user-story slices. Inventory affected brands, locales,
  runtime flows, Contentful registrations, and infrastructure sync points. If
  Contentful models or entries are in scope, note what was confirmed through
  Contentful MCP versus what is still inferred from code. If Contentful writes
  may be needed, document the human confirmation step and the plan to re-read
  the final state after the change. If the feature introduces new or changed
  structured data, document the Contentful data-model review, whether an
  existing content type can be reused or extended, and the justification for
  any proposed new content type, then document any complexity that requires
  justification below.

## Project Structure

### Documentation (this feature)

```text
specs/[###-feature]/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)
<!--
  ACTION REQUIRED: Replace the placeholder tree below with the concrete layout
  for this feature. Delete unused options and expand the chosen structure with
  real paths (e.g., apps/admin, packages/something). The delivered plan must
  not include Option labels.
-->

```text
# [REMOVE IF UNUSED] Option 1: Single project (DEFAULT)
src/
├── models/
├── services/
├── cli/
└── lib/

tests/
├── contract/
├── integration/
└── unit/

# [REMOVE IF UNUSED] Option 2: Web application (when "frontend" + "backend" detected)
backend/
├── src/
│   ├── models/
│   ├── services/
│   └── api/
└── tests/

frontend/
├── src/
│   ├── components/
│   ├── pages/
│   └── services/
└── tests/

# [REMOVE IF UNUSED] Option 3: Mobile + API (when "iOS/Android" detected)
api/
└── [same as backend above]

ios/ or android/
└── [platform-specific structure: feature modules, UI flows, platform tests]
```

**Structure Decision**: [Document the selected structure and reference the real
directories captured above]

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| [e.g., 4th project] | [current need] | [why 3 projects insufficient] |
| [e.g., Repository pattern] | [specific problem] | [why direct DB access insufficient] |
