# Marketing Sites Agent Guide

Start here, then follow the project constitution in
[`.specify/memory/constitution.md`](.specify/memory/constitution.md).

## Availability First

This is a high-traffic public site. In all work:

- protect availability before optimizing for freshness or convenience
- preserve cacheability and the repo's SWR/SIE model for public routes
- keep preview and draft outside the public cache contract
- do not weaken redirect, revalidation, or security protections

See [docs/performance-convention.md](docs/performance-convention.md) and
[docs/architecture.md](docs/architecture.md).

## Security And Privacy

Treat Code.org privacy and student-data guardrails as implementation rules.
The official [Code.org Privacy Policy](https://code.org/en-US/privacy) takes
precedence over this guide and any local convention.

- do not add unnecessary personal-data collection or third-party data egress
- assume Student Records and school-directed data need extra scrutiny
- use synthetic/redacted data in Storybook, Contentful, tests, and docs
- escalate when FERPA, deletion/retention, or policy alignment is unclear

## SSR First

Default to server-rendered code and server data fetching.

- keep rendering, composition, and data access on the server by default
- introduce `use client` only for unavoidable browser-only behavior
- keep any client boundary as small as possible
- do not move hot-path rendering or CMS composition into client-side boot code

## Speckit Flow

For substantial work, use the standard sequence:

1. `/speckit.specify`
2. `/speckit.plan`
3. `/speckit.tasks`
4. `/speckit.implement`

Keep specs and plans explicit about:

- affected apps and packages
- brands, locales, preview/draft behavior
- Contentful registration impact
- MCP-confirmed Contentful schema or entry assumptions
- Contentful data-model review for any new or changed feature data, including
  whether existing content types can be reused before proposing a new one
- cache and revalidation impact
- required Storybook, test, and CI surfaces

## Repo Shape

- `apps/marketing`: multi-tenant Next.js marketing app
- `apps/marketing-storybook`: higher-level marketing components and Contentful
  building blocks
- `apps/design-system-storybook`: atomic and molecular design-system components
- `packages/component-library*`, `packages/fonts`, `packages/lint-config`:
  shared foundations

## Non-Negotiables

- Preserve cacheability, availability, and security guardrails.
- Preserve privacy-policy guardrails and FERPA/student-data boundaries.
- Default to SSR; any client-only boundary needs explicit justification.
- Do not weaken preview, draft, redirect, or revalidation protections.
- If touching public caching, preserve SWR (`stale-while-revalidate`) and SIE
  (`stale-if-error`) semantics unless the spec documents an exception.
- Do not use real personal data in Contentful, Storybook, fixtures, or tests.
- All new React components MUST use MUI.
- Prefer marketing components that are built directly with MUI.
- The legacy design system is deprecated; continue using it only when the
  needed component has not yet been migrated to MUI.
- If a legacy design-system component can be migrated to a MUI equivalent with
  limited, low-risk scope and without affecting other components, prefer making
  that migration as part of the work.
- MUI replacements for migrated components SHOULD remain visually 1:1 unless
  the spec explicitly calls for a design change.
- All React components MUST meet or exceed WCAG AA.
- Prefer shared package changes before app-level duplication.

## Contentful Work

If AI-assist has the Contentful MCP available, initialize it first and use it
as the source of truth for content types, entries, and assets before claiming a
schema shape from memory or code inference.

Treat Contentful MCP as read-only-by-default. If a write may be needed, show
the exact proposed changes to a human, get confirmation or have the human apply
them, then re-read Contentful to confirm the final state.

If a change touches a Contentful-backed component, complete all applicable
layers:

- component implementation
- Contentful definition
- brand registration
- data-model review when the feature adds or changes structured content
- MCP confirmation of schema details when needed
- human confirmation path for Contentful writes when needed
- Storybook coverage and mocks
- tests
- cache or revalidation review

See [docs/contentful-component-convention.md](docs/contentful-component-convention.md).

See [docs/security-and-privacy-guardrails.md](docs/security-and-privacy-guardrails.md).

## Useful Commands

- `yarn build`
- `yarn lint`
- `yarn test`
- `yarn release:dryrun`
- `yarn workspace @code-dot-org/design-system-storybook test:ui:ci`
- `yarn workspace @code-dot-org/marketing-storybook test:ui:ci`

## Local Runtime

- brand URL: `http://[brand].marketing-sites.localhost:3001`
- preview URL: `http://preview-[brand].marketing-sites.localhost:3001`
