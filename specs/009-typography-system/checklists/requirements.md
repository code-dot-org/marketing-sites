# Specification Quality Checklist: Sitewide Typography System

**Purpose**: Validate specification completeness and quality before proceeding to planning
**Created**: 2026-06-23
**Feature**: [spec.md](../spec.md)

## Content Quality

- [x] No implementation details (languages, frameworks, APIs)
- [x] Focused on user value and business needs
- [x] Written for non-technical stakeholders
- [x] All mandatory sections completed

> Note: The spec references MUI `theme.typography` variants by name and identifies specific affected files. These are unavoidable to communicate the integration surface in a monorepo with multiple themes and a deprecated-component cleanup contract, and they match the convention established in specs 006 and 008. The token model (track / size / weight / role) and user stories themselves remain free of framework-specific syntax.

## Requirement Completeness

- [x] No [NEEDS CLARIFICATION] markers remain
- [x] Requirements are testable and unambiguous
- [x] Success criteria are measurable
- [x] Success criteria are technology-agnostic (no implementation details)
- [x] All acceptance scenarios are defined
- [x] Edge cases are identified
- [x] Scope is clearly bounded
- [x] Dependencies and assumptions identified

## Feature Readiness

- [x] All functional requirements have clear acceptance criteria
- [x] User scenarios cover primary flows
- [x] Feature meets measurable outcomes defined in Success Criteria
- [x] No implementation details leak into specification

## Notes

- Two values are explicitly **locked** by the user at spec time: H1 default (Space Grotesk, Display 2xl, Semibold) and body default (Geist, Text Md, weight 500, font-size 1rem / 16px, line-height 1.5rem / 24px). All other size cells, weight names, and the H2–H6 ladder are informed defaults to be confirmed in `/plan` against the Figma file using the **visible size label inside each sample text block**, not the Figma variable names.
- Body line-height was amended on 2026-06-23: the user initially stated 1.25rem (20px), then explicitly overrode that and asked the spec to use the Figma `text-md` token value. The locked line-height is therefore 1.5rem (24px). No `/plan`-time reconciliation is needed for this value.
- The deprecated-component policy is locked: tie the deprecated components (Hero Banner, `YourSchool`, `AdoptionMap`, `AfeEligibility`, and any others surfaced in research) to the canonical role tokens via the existing MUI variant surface — no parallel "heading default" token type is added. This is the user's "explore whether a new token type is necessary" question resolved as "no, the MUI variant layer is already that surface."
- **2026-06-23 amendment — orthogonal Heading Level / Visual Appearance**: Heading gains a new `appearance` ComponentDefinition variable (Studio "Visual Appearance"; 9 enum values: `default` + 8 Display cells). The existing `visualAppearance` field is preserved as the Heading-Level selector. Paragraph's `visualAppearance` enum is widened from 4 to 12 values. Both are **ComponentDefinition variable updates** (code-side, no Contentful content-type schema delta, no MCP write). New user stories (US3 + US4) and FRs (FR-009, FR-010, FR-011, FR-011a, FR-011b, FR-024) reflect the three-step / two-step style-resolution chain. Existing entries continue to render unchanged (FR-011 back-compat preserved).
- CSforAll is explicitly out of scope. Shared files (`packages/component-library-styles/typography.module.scss`, `packages/fonts/`) are extended additively or per-tenant-gated; if a shared change would alter CSforAll rendering, the resolution is to fork the change into `apps/marketing/src/themes/code.org/` instead.
- Items marked incomplete require spec updates before `/speckit.clarify` or `/speckit.plan`.
