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
See [docs/seo-convention.md](docs/seo-convention.md).

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
- SEO metadata, canonical, indexing, structured-data, and sitemap impact
- required Storybook, test, and CI surfaces

## Repo Shape

- `apps/marketing`: multi-tenant Next.js marketing app
- `apps/marketing-storybook`: higher-level marketing components and Contentful
  building blocks
- `apps/design-system-storybook`: atomic and molecular design-system components
- `packages/component-library*`, `packages/fonts`, `packages/lint-config`:
  shared foundations

## Code Guidance

- Follow [docs/code-convention.md](docs/code-convention.md) for repo-wide code
  maintainability guidance, including comments and JSDoc expectations.

## Non-Negotiables

- Preserve cacheability, availability, and security guardrails.
- Preserve privacy-policy guardrails and FERPA/student-data boundaries.
- Default to SSR; any client-only boundary needs explicit justification.
- Do not weaken preview, draft, redirect, or revalidation protections.
- If touching public caching, preserve SWR (`stale-while-revalidate`) and SIE
  (`stale-if-error`) semantics unless the spec documents an exception.
- Preserve existing SEO behavior unless the spec calls for an intentional
  change.
- Standard Contentful Experience pages are already covered by the runtime
  sitemap when they have a slug and are not marked `noindex`; non-Experience
  routes still require explicit sitemap review.
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

## Implementation Preference

- Prefer first-party implementations by default to reduce bundle size, keep
  control local, and avoid unnecessary third-party runtime and maintenance
  costs.
- Use a vetted third-party library when the first-party option becomes too
  difficult or expensive to maintain, or when the library materially improves
  accessibility, SSR compatibility, safety, or long-term maintainability.
- Hand-maintained SVG implementations are a common example of a first-party
  approach that may become too costly to maintain once interaction,
  accessibility, or geography complexity grows.

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

See [docs/seo-convention.md](docs/seo-convention.md).

See [docs/code-convention.md](docs/code-convention.md).

See [docs/ui-convention.md](docs/ui-convention.md).

## Useful Commands

- `yarn build`
- `yarn lint`
- `yarn lint:fix`
- `yarn test`
- `yarn release:dryrun`
- `yarn test:ui:ci`
- `yarn test:ui:local`
- `yarn workspace @code-dot-org/design-system-storybook test:ui:ci`
- `yarn workspace @code-dot-org/marketing-storybook test:ui:ci`

## Validation Expectations

- Use root `yarn lint:fix` when touched files need repo-standard autofixes before
  final validation.
- Use root `yarn release:dryrun` as a final validation step for substantial
  changes unless the task is docs-only or the user explicitly scopes validation
  down.
- `yarn release:dryrun` currently runs Turbo `build`, `lint`, and `test`.
- Use root `yarn test:ui:ci` as the standard optional final browser-validation
  step when Storybook or other UI coverage should also run from the repo root.
- Use root `yarn test:ui:local` only for local workflows that intentionally
  point tests at an already running local app or Storybook server.
- For Storybook-focused changes, make it explicit whether the relevant
  Storybook `test:ui:ci` fanout passed, even if the full root `yarn test:ui:ci`
  run also includes unrelated UI suites with separate environment or visual-test
  requirements.
- If root `yarn test:ui:ci` fails outside the touched Storybook surface, report
  that clearly and separately from the status of the Storybook fanout that
  covers the changed stories.

## Local Runtime

- brand URL: `http://[brand].marketing-sites.localhost:3001`
- preview URL: `http://preview-[brand].marketing-sites.localhost:3001`

## Active Technologies

- TypeScript with React 18 on Next.js 15 + Next.js App Router, MUI, existing marketing app testing stack, vetted npm React US map package, and repo-managed structured data file (003-gap-analysis-map)
- Repo-managed structured data file; no runtime persistence (003-gap-analysis-map)

## Recent Changes

- 003-gap-analysis-map: Added TypeScript with React 18 on Next.js 15 + Next.js App Router, MUI, existing marketing app testing stack, vetted npm React US map package, and repo-managed structured data file

## UI Guidance

- Follow [docs/ui-convention.md](docs/ui-convention.md) for React/UI component structure, theme inheritance, interaction patterns, Storybook `play` coverage, and interactive layout-stability rules.
- Interactive components MUST not introduce width or height shifts between default, hover, focus, selected, and locked states, especially in stacked mobile layouts.
- Components that honor `data-theme` or similar inherited presentation context MUST derive text, surface, divider, and icon colors from that inherited mode rather than assuming the active MUI theme already matches it.
