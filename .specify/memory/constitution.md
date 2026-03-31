<!--
Sync Impact Report
Version change: 1.6.0 -> 1.7.0
Modified principles:
- V. Spec-Driven Incremental Delivery -> V. Spec-Driven Incremental Delivery
Added sections:
- None
Removed sections:
- None
Templates requiring updates:
- ✅ updated .specify/templates/plan-template.md
- ✅ updated .specify/templates/spec-template.md
- ✅ updated .specify/templates/tasks-template.md
- ✅ reviewed .specify/templates/agent-file-template.md
- ✅ added docs/architecture.md
- ✅ added docs/performance-convention.md
- ✅ added docs/contentful-component-convention.md
- ✅ added docs/security-and-privacy-guardrails.md
- ⚠ pending .specify/templates/commands/*.md (directory not present in this repository)
Follow-up TODOs:
- None
-->
# Code.org Marketing Websites Constitution

## Core Principles

### I. Availability, Cached, Secure, Observable, and Privacy-Safe Operations
Production-affecting features MUST preserve or improve operational visibility
through structured logs, metrics, traceability, or documented monitoring hooks
appropriate to the touched surface. Instrumentation MUST avoid exposing secrets,
personal data, or raw credential material, and any new third-party integration
MUST document the data it sends externally, its consent category, and its
failure mode. Changes to cache lifetimes, revalidation behavior, redirect
semantics, or CDN-facing headers MUST update code, tests, and infrastructure
artifacts in the same change. Reliable marketing experiences require
debuggability, responsible data handling, preserved runtime contracts, strong
security boundaries, and availability-first decisions under heavy traffic. For
publicly cacheable routes, `stale-while-revalidate` MUST be the default
freshness model and `stale-if-error` MUST be the default availability backstop
unless a documented exception says otherwise. Features MUST also align with the
[Code.org Privacy Policy](https://code.org/en-US/privacy), which takes
precedence over local conventions for privacy handling: minimize collection of
personal data, never introduce targeted advertising or sale-like use of
personal data, avoid exposing Student Records or student personal data, and
treat FERPA and similar student privacy obligations as design constraints rather
than post-launch review items. If a change touches personal data, school-linked
data, or new third-party data flows, the spec and plan MUST document purpose,
downstream sharing, consent or opt-in path, retention/deletion expectations,
and escalation to privacy/security owners when the policy impact is unclear.

### II. Shared System First And SSR By Default
Changes that affect reusable presentation, styling, or content modeling MUST be
implemented in the shared package or design-system layer before app-level
overrides are introduced. New duplication across `apps/*` and `packages/*` MUST
be justified in the implementation plan, time-boxed, and tracked for removal.
Brand-specific behavior MUST prefer existing switchboards such as themes,
header/footer selectors, asset selectors, and Contentful registration rather
than forking otherwise shared behavior. This keeps the marketing monorepo
coherent and prevents tenant-specific shortcuts from fragmenting the design
system. The marketing design system in this repository is intentionally forked
to preserve team autonomy, so reuse MUST happen inside this repo's shared
packages before new local forks are introduced. New runtime code and React
surfaces MUST render on the server by default. Client-only boundaries such as
`use client`, browser API access, client-side data fetching, or hydration-heavy
composition MUST be treated as exceptions, kept as small as possible, and
explicitly justified in the spec and plan.

### III. WCAG AA And Layered Storybook UX
Every net-new or materially changed UI surface MUST define how it will be
verified in `apps/design-system-storybook`, `apps/marketing-storybook`,
page-level previews, or an equivalent reviewable fixture. Contentful-backed UI
changes MUST include the mocks, decorators, or in-memory entities needed to
review the change outside production. `apps/design-system-storybook` is the
review surface for atomic and molecular components. `apps/marketing-storybook`
is the review surface for higher-level marketing components composed from the
design system and Contentful payloads. All React components MUST meet or exceed
WCAG AA standards, including semantic structure, keyboard access where
applicable, sufficient contrast, and localized-content resilience. This is
non-negotiable because marketing work is visual, reusable, and public-facing.

### IV. Quality Gates Are Release Gates
Work MUST pass the smallest meaningful automated validation set before merge:
linting, type checks, and tests covering the changed behavior. When a change
alters rendering, content composition, or tenant-specific behavior, the spec and
tasks MUST call out the required story, unit, integration, visual, or end-to-end
coverage. Design-system changes SHOULD default to unit tests, Storybook
coverage, accessibility checks, and visual review. Marketing runtime changes
SHOULD default to focused Jest coverage first, with Playwright reserved for
cross-system concerns such as caching, redirects, consent, analytics, security,
or CMS/runtime integration. Design-system updates MUST pass the design-system
storybook CI path before dependent marketing-layer changes are treated as done.
Marketing component updates MUST pass the marketing-storybook CI path before
merge. A task list MAY omit unnecessary test types, but it MUST explain why.
This principle prevents regressions in a fast-moving monorepo with multiple
apps and shared packages.

### V. Spec-Driven Incremental Delivery
All substantial work MUST begin with a spec, plan, and task breakdown that can
ship value in independently testable slices. Plans MUST identify the affected
workspaces, reuse opportunities, request/data flows, required quality gates, and
any complexity tradeoffs before implementation begins. Specs and plans MUST
explicitly inventory impacted brands, locales, third-party integrations,
Contentful component registrations, cache/revalidation behavior, and
documentation or Storybook surfaces whenever those concerns apply. When
Contentful content types, entries, assets, or editor configuration are part of
the change, contributors MUST prefer the Contentful MCP as the source of truth
for schema and content inspection rather than relying on memory or TypeScript
inference alone. Contentful MCP must be treated as read-only by default in
planning and review workflows. Even if write access is later enabled, proposed
content model or entry mutations MUST be shown to a human for confirmation
before execution, and the resulting state MUST be re-read from Contentful after
the human-applied or human-approved change. This ensures contributors can move
quickly without skipping cross-package coordination.

## Delivery Constraints

- The canonical implementation stack for this repository is TypeScript/React
  across Turborepo-managed apps and packages; deviations MUST be explicitly
  justified in the implementation plan.
- Shared linting, formatting, and type-checking configurations from
  `packages/lint-config` MUST be reused instead of redefined locally unless a
  workspace has a documented exception.
- The primary runtime is the Next.js marketing app in `apps/marketing`; changes
  that affect middleware, routing, layouts, providers, caching, or Contentful
  data flow MUST be treated as runtime contract changes, not isolated component
  edits.
- The local multi-tenant development model uses
  `http://[brand].marketing-sites.localhost:3001` and preview uses
  `http://preview-[brand].marketing-sites.localhost:3001`; routing, preview,
  and draft workflows MUST preserve these branded runtime paths.
- All new React surfaces MUST be server-rendered by default; client-side
  boundaries MAY be introduced only for unavoidable browser APIs, consent or
  analytics SDKs, or user interactions that cannot be implemented from a
  server-rendered shell, and MUST minimize hydration scope.
- All new React components MUST use MUI and compose from this repository's
  shared design-system packages whenever possible.
- Secrets MUST remain out of source control, and local setup documentation MUST
  use ignored environment files or platform secret stores.
- Contributors MUST not introduce new collection, storage, display, or
  third-party sharing of Student Records, student personal data, or
  teacher-linked personal data on marketing surfaces unless the behavior is
  explicitly approved, documented, and aligned with the Code.org Privacy Policy
  and applicable student privacy requirements such as FERPA.
- Storybook stories, Contentful entries, screenshots, fixtures, test data, and
  analytics payload examples MUST use synthetic or redacted data rather than
  real student, teacher, donor, or support-request data.
- Feature specs MUST call out tenant impact, localization impact, analytics or
  telemetry impact, and content-model impact whenever those concerns apply.
- AI-assisted contributor workflows that touch Contentful MUST initialize the
  Contentful MCP before making schema claims, and MUST record the inspected
  space/environment context in research or planning notes when it affects the
  work.
- AI-assisted workflows MUST not silently mutate Contentful schema or content.
  When recommending content type changes, contributors SHOULD present the exact
  fields, validations, or settings for a human to apply, then re-read the final
  Contentful state to confirm the change.
- Availability and performance are primary constraints for this repository;
  contributors MUST preserve cacheability, graceful degradation, and CDN-safe
  behavior unless a documented product need requires otherwise.
- Preview and draft flows MUST remain outside the public SWR/SIE caching model
  and keep their current non-cacheable protections.

## Architecture Decision Rules

- Contentful-driven features MUST account for all affected layers: fetch logic,
  component implementation, component definition, brand registration, review
  surfaces, and revalidation behavior.
- Contentful MCP lookups SHOULD be used to confirm content type fields,
  validations, entry relationships, and asset constraints before schema-heavy
  work is specified or implemented.
- Contentful write actions require explicit human confirmation even when tool
  access exists; read, recommend, confirm, then re-read is the default safety
  pattern.
- Contentful-driven higher-level marketing components belong in
  `apps/marketing` and `apps/marketing-storybook`; atomic and molecular
  primitives belong in shared design-system packages and
  `apps/design-system-storybook`.
- Locale or brand changes MUST review middleware, theme selection, SEO
  metadata, header/footer composition, and language or font loading behavior
  together.
- New third-party integrations MUST document owner, data egress, consent
  requirements, fallback behavior, and required tests before implementation.
- New forms, lead captures, or user-input surfaces MUST document every field
  collected, where it is stored, who receives it, how it is deleted, and why
  the data is needed under the Code.org Privacy Policy.
- Cache lifetimes and revalidation settings MUST stay synchronized with any
  mirrored infrastructure configuration, including deployment templates and CDN
  behavior.
- Server and client boundaries MUST be deliberate. Data fetching, composition,
  and initial rendering MUST stay on the server unless a documented browser-only
  constraint requires otherwise.
- Cache policy changes MUST review the full SWR/SIE chain: app constants,
  route headers, tests, and any infrastructure fallback that injects cache
  headers when the origin omits them.
- Security-sensitive routes and flows, including preview, draft, revalidation,
  and redirect behavior, MUST preserve their existing token, header, and cookie
  guardrails.
- Work that may involve Student Records, under-13 users, or school-directed data
  flows MUST identify the privacy-policy impact up front and MUST not proceed on
  assumption alone when FERPA, school agreements, or other student privacy
  obligations might apply.
- Contributor workflows MUST assume some changes may be generated quickly; code
  review and planning MUST therefore explicitly validate registration,
  accessibility, caching, security, and privacy-policy guardrails rather than
  relying on intent.

## Workflow and Review

- The Constitution Check in each implementation plan MUST confirm alignment with
  all five core principles before Phase 0 research proceeds.
- Specs MUST define independent user stories, measurable success criteria, edge
  cases, required integration points, and any accessibility, cache, security,
  consent, observability, privacy-policy, FERPA/student-data, or
  SSR/client-boundary outcomes that apply.
- Tasks MUST be grouped by user story and include explicit validation work for
  every required test, Storybook, telemetry, infrastructure-sync, or
  documentation update.
- Research and planning artifacts MUST distinguish between Contentful details
  confirmed from MCP and details inferred only from application code.
- Reviews MUST call out whether Contentful changes were only proposed, were
  human-applied, or were human-confirmed and then re-read through MCP.
- Pull requests and reviews MUST block merge when principle compliance is
  missing, when coverage expectations are undocumented, or when shared-system
  reuse was bypassed without written justification.
- Pull requests and reviews MUST also block merge when personal-data handling,
  third-party data egress, or security/privacy review obligations are unclear.

## Governance

This constitution overrides local habits and ad hoc feature practices for this
repository. Amendments MUST be made in `.specify/memory/constitution.md`,
include a Sync Impact Report, and propagate required changes to dependent
templates before adoption. Versioning follows semantic versioning for governance:
MAJOR for incompatible principle removals or redefinitions, MINOR for new
principles or materially expanded guidance, and PATCH for clarifications that do
not change enforcement. Compliance MUST be reviewed during planning, task
generation, code review, and any post-incident remediation that reveals a gap in
these rules.

**Version**: 1.7.0 | **Ratified**: 2026-03-31 | **Last Amended**: 2026-04-01
