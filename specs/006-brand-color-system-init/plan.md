# Implementation Plan: Brand Color System Initialization

**Branch**: `006-brand-color-system-init` | **Date**: 2026-06-17 | **Spec**: [spec.md](/home/kal/projects/code-dot-org/marketing-sites/specs/006-brand-color-system-init/spec.md)
**Input**: Feature specification from `/specs/006-brand-color-system-init/spec.md`

## Summary

Add the new CodeAI 22-color brand palette (5 families × 4 shades, plus Black and White) to the existing `BRAND_COLORS` manifest at `apps/marketing/src/components/common/colors.ts`, propagate its CSS variables through the existing `primitiveColors.scss` layer, and surface the palette in the color dropdowns of the components already updated this cycle (Heading, Paragraph, Text Link, Simple List, native Container, native Section, and the custom Section component) via the existing `BRAND_COLOR_OPTIONS` array and the design-token registration at `apps/marketing/src/contentful/registration/code.org/designTokens.ts`. Layer in an automatic foreground/background contrast switch that rides on the existing `data-theme` CSS cascade pattern already used by `Section.tsx` and `packages/component-library-styles/colors.scss`: dark backgrounds map dark text to white, light backgrounds map low-contrast text to the text's own family's `*-dark` (on `*-light` backgrounds) or `*-primary` (on `*-mid`/white backgrounds) shade, and white text on any light background maps to black. Migrate the Primary font default from `neutral-black` to the new `Black` token. Keep everything on the existing MUI stack; no nested ThemeProvider, no new framework, no schema migration, no changes to components that do not already expose a color option.

## Technical Context

**Language/Version**: TypeScript with React 18 on Next.js 15
**Primary Dependencies**: MUI (existing theme stack), `@code-dot-org/marketing-component-library-styles` (SCSS primitives), Contentful field validation via existing registration layer, existing marketing testing stack
**Storage**: N/A (no runtime persistence; manifest is a static module + CSS variables)
**Contentful Data Model**: No Contentful change needed — existing `BRAND_COLOR_OPTIONS` validation array is extended in code; existing entries remain valid
**MUI / Legacy DS Plan**: Direct MUI implementation continues. No new legacy design-system usage. Existing legacy color keys (`secondary`, `brand`, `neutral-black`) remain for backward compatibility but are not extended.
**SEO / Indexing Plan**: No SEO impact. Existing page metadata, canonical, indexing, structured-data, and sitemap behavior unchanged.
**Testing**: Jest + Testing Library unit coverage for the contrast-switch resolver (pure function over token + background-tone inputs); marketing Storybook stories for visual review of the new palette and switch matrix; existing `marketing/storybook-eyes` Applitools pipeline for visual regression (baseline acceptance required as part of CI per existing process).
**Target Platform**: Public marketing web experience across the `code.org` and `csforall` brand tenants in modern desktop and mobile browsers.
**Project Type**: Multi-tenant Next.js marketing web app (Turborepo with `apps/marketing`, `apps/marketing-storybook`, `apps/design-system-storybook`, `packages/component-library`, `packages/component-library-styles`).
**Performance Goals**: No runtime performance impact. The palette and the contrast switch resolve at build/SSR time; the production CSS payload grows by the ~22 hex constants plus a small static rule table for the contrast switch (estimated <2 KB minified including the new SCSS rules).
**Constraints**: Preserve SWR/SIE cache semantics for all containing pages, maintain SSR-only rendering for color resolution, support inherited `data-theme` from `Section.tsx`, maintain WCAG AA on the produced pairings, do not modify the shared `packages/component-library` workspace, do not introduce nested MUI ThemeProvider.
**Scale/Scope**: One manifest file extended, one SCSS primitives file extended, one design-token registration file extended, six components surfacing the new options (Heading, Paragraph, Text Link, Simple List, native Container, custom Section), one Storybook story file per affected component (existing stories extended, no new story files needed), one theme typography default migration (`neutral-black` → `Black`).

## Implementation Conventions

- Extend `BRAND_COLORS` in place at `apps/marketing/src/components/common/colors.ts`. Do not create a parallel manifest. Each new entry follows the existing `{ value, displayName, cssVar }` shape and adds two derived fields (`family`, `shade`) that the contrast-switch resolver consumes. Keep existing entries (`primary`, `white`, `purple`, `darkPurple1`, `darkPurple2`, `lightGreen3`) untouched; existing Contentful entries continue to validate.
- Add the new CSS custom properties to `primitiveColors.scss` (or its co-located file in `packages/component-library-styles/`, whichever currently hosts `--codeai-*` primitives) using the existing naming convention extended to the full family/shade matrix: `--codeai-{family}-{shade}` (e.g. `--codeai-purple-dark`, `--codeai-blue-mid`).
- Implement the contrast switch as a single SCSS rule table layered on top of the existing `[data-theme='Light']` / `[data-theme='Dark']` blocks in `packages/component-library-styles/colors.scss`. The `Section.tsx` `data-theme` attribute already cascades through descendants — extend it to set additional `data-bg-tone` and `data-bg-family` attributes (or equivalent CSS variables) so child text rules can shift within a family without a new React context.
- **csforall isolation guard in `Section.tsx`**: the new `data-bg-tone` (and any sibling `data-bg-family`) attribute MUST be emitted only when the resolved `background` prop value is one of the 22 new CodeAI brand tokens (`purpleDark`, `pinkLight`, etc.). For all other values (csforall's `brandPrimary`/`brandSecondary`/etc., Corporate Site legacy values like `primary`/`secondary`/`patternDark`, and any unset value), the attribute is `undefined` and React does not render it. This is a value-space check, not a `brand === 'csforall'` check — the value spaces are disjoint by construction. This is the only csforall-facing safeguard required under the soft-isolation approach (see Tenant Scope in spec.md).
- Provide a single resolver utility next to `cssVarForBrandColor` in `colors.ts` (e.g. `resolveTextColorForBackground(textToken, backgroundToken)`) that returns the rendered token. This is the canonical source consumed by Heading and Paragraph; SCSS rules in the cascade carry the same logic for components that style via class names. The resolver and the SCSS table MUST stay in sync — research.md records this as a single rule table maintained in TypeScript and emitted to SCSS via a build-time-acceptable mechanism, or codified once in SCSS with the resolver delegating to CSS variables.
- Reuse the existing `colorOverride` hex field on Heading and Paragraph as the override path. Do not add a new override field elsewhere in this pass.
- Storybook coverage for affected components extends existing story files (e.g. `apps/marketing-storybook/stories/Heading.story.tsx`) with the new palette and switch matrix. No new story files are created.

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

- **Availability, Cached, Secure, Observable, and Privacy-Safe Operations**: Pass. The feature is static palette + CSS. No new logging, metrics, traces, analytics, consent banners, or third-party data flows. No personal data, Student Records, or FERPA-sensitive surfaces are touched. Existing SWR/SIE cache headers and revalidation behavior on all containing pages remain unchanged. No new privacy or security review is required.
- **Shared System First And SSR By Default**: Pass. Affected workspaces are [`apps/marketing`](/home/kal/projects/code-dot-org/marketing-sites/apps/marketing), [`apps/marketing-storybook`](/home/kal/projects/code-dot-org/marketing-sites/apps/marketing-storybook), and [`packages/component-library-styles`](/home/kal/projects/code-dot-org/marketing-sites/packages/component-library-styles). The SCSS primitive layer is the shared layer; the manifest and the components that consume it live in `apps/marketing` because that is where the rest of the brand-color manifest already lives (consistent with the existing pattern from commit `ff2d67ee`). No new duplication is introduced. No new client boundary is needed — the contrast switch resolves at build time via CSS rules and at SSR time via the resolver. The implementation continues direct MUI usage; no legacy design-system component is touched. **Tenant note**: shared layers (manifest, SCSS primitives, shared `ContentfulDefinition` files) remain shared between code.org and csforall — splitting them into per-tenant variants was considered and rejected as unnecessary infrastructure given csforall's deprecation. The one csforall-facing safeguard is a value-space guard inside `Section.tsx` (not a tenant fork) that suppresses the new `data-bg-tone` attribute when the background value is not a new CodeAI brand token. This preserves the "shared by default" principle while honoring the user's "no csforall change" requirement at the rendered-output level.
- **WCAG AA And Layered Storybook UX**: Pass. Storybook coverage flows through [`apps/marketing-storybook`](/home/kal/projects/code-dot-org/marketing-sites/apps/marketing-storybook) for the higher-level components (Heading, Paragraph, Text Link, Simple List, Container, Section). The work is design-system-adjacent but lives at the marketing layer because the components themselves do. WCAG AA expectations: each switch-produced pairing (Dark/Primary/Black on White; family `*-dark` on family or cross-family `*-light` background; family `*-primary` on `*-mid` or white background; Black on White from a White text input) is presumed AA-compliant and is logged for follow-up audit (FR-023). Existing keyboard, focus, and screen-reader semantics are unaffected.
- **Quality Gates Are Release Gates**: Pass. Minimum validation set: lint, typecheck, Jest unit coverage for the contrast-switch resolver (pure function — every cell in the rule matrix exercised), updated Storybook stories with the new palette and switch matrix, and the marketing Storybook CI path including the `marketing/storybook-eyes` Applitools step (baseline acceptance required per the existing process). No new Playwright coverage is required because the feature does not introduce new caching, redirect, consent, analytics, or cross-system runtime behavior. Visual regression on existing entries is explicitly covered by the visual diff gate.
- **Spec-Driven Incremental Delivery**: Pass. The three user stories form three independently testable slices: US1 (palette exposed in dropdowns), US2 (contrast switch applied via cascade), US3 (override path intact). Affected brand/runtime scope is the `code.org` tenant; `csforall` is verified to render unchanged (soft isolation — shared infrastructure loaded on csforall but inert because no csforall content/component references the new tokens). Locale impact is unchanged (dropdown labels are English-only for this pass). No Contentful schema work is required — the `BRAND_COLOR_OPTIONS` array is extended in application code only, and existing entries continue to validate. SEO, canonical, indexing, structured-data, and sitemap behavior remain unchanged. No infrastructure sync points (cache headers, CDN configuration, deployment templates) are affected. Contentful MCP is not required for this feature because no Contentful field types, validations, or entries are being changed — confirmed by application-code inspection of `BRAND_COLOR_OPTIONS` consumers; no read of Contentful content models is needed for v1. If, during implementation, a Contentful field validation list is found to be authored in Contentful Studio rather than in code (unlikely given current pattern), the discovery is escalated as a follow-up MCP-read item before implementation proceeds, per Principle V.

## Project Structure

### Documentation (this feature)

```text
specs/006-brand-color-system-init/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── brand-color-token.schema.json
├── checklists/
│   └── requirements.md          # already created by /speckit.specify
└── tasks.md                     # Phase 2 output (/speckit.tasks, not this command)
```

### Source Code (repository root)

```text
apps/marketing/
├── src/
│   ├── components/common/
│   │   └── colors.ts                              # BRAND_COLORS manifest extension + family/shade metadata + contrast resolver
│   ├── components/contentful/
│   │   ├── heading/                               # consumes BRAND_COLOR_OPTIONS; surface new options automatically
│   │   ├── paragraph/                             # consumes BRAND_COLOR_OPTIONS; surface new options automatically
│   │   ├── link/                                  # Text Link; consumes BRAND_COLOR_OPTIONS
│   │   ├── simpleList/                            # consumes BRAND_COLOR_OPTIONS for icon `type` and `textColor`
│   │   ├── richText/                              # no color picker; relies on cascade for body text
│   │   └── section/
│   │       ├── Section.tsx                        # wires data-theme + value-gated data-bg-tone (only emitted for new CodeAI tokens)
│   │       ├── sectionCorporateSiteContentfulDefinition.ts   # extended: + 22 new background options
│   │       └── sectionCSforAllContentfulDefinition.ts        # UNTOUCHED (csforall variant)
│   ├── contentful/registration/code.org/
│   │   └── designTokens.ts                        # native Container/Section design-token list extended (code.org-only by file path)
│   └── themes/
│       ├── code.org/
│       │   └── index.ts                           # Primary font default migration: neutral-black → Black
│       └── csforall/
│           └── index.ts                           # UNTOUCHED
└── package.json

apps/marketing-storybook/
├── stories/
│   ├── Heading.story.tsx                          # extend with palette + switch matrix coverage
│   ├── Paragraph.story.tsx                        # extend with palette + switch matrix coverage
│   ├── Link.story.tsx (or TextLink.story.tsx)     # extend with palette + switch matrix coverage
│   ├── SimpleList.story.tsx                       # extend with palette coverage
│   └── (Container / Section)                      # extend with palette + cascade coverage
└── package.json

packages/component-library-styles/
├── primitiveColors.scss                           # 22 new --codeai-* CSS variables
├── colors.scss                                    # extended [data-theme='Light'|'Dark'] blocks + new data-bg-tone rules
└── package.json
```

**Structure Decision**: Implement the manifest, resolver, and component-facing changes in [`apps/marketing`](/home/kal/projects/code-dot-org/marketing-sites/apps/marketing), the CSS primitives and cascade rules in [`packages/component-library-styles`](/home/kal/projects/code-dot-org/marketing-sites/packages/component-library-styles), and the Storybook story extensions in [`apps/marketing-storybook`](/home/kal/projects/code-dot-org/marketing-sites/apps/marketing-storybook). Do not modify [`packages/component-library`](/home/kal/projects/code-dot-org/marketing-sites/packages/component-library) (no shared React components are touched in this pass). **csforall files explicitly NOT modified**: `apps/marketing/src/components/contentful/section/sectionCSforAllContentfulDefinition.ts`, `apps/marketing/src/themes/csforall/index.ts`, and `apps/marketing/src/contentful/registration/csforall/index.ts`.

## Post-Design Constitution Re-Check

_Re-evaluated after Phase 1 (research.md, data-model.md, contracts/, quickstart.md)._

No new violations surfaced during design. The data model is a pure extension of the existing `BRAND_COLORS` manifest with two derived metadata fields (`family`, `shade`) and a pure-function resolver consumed both at SSR time (Heading, Paragraph) and via the SCSS cascade (everything that styles via class names). The contract schemas document the manifest token shape and the contrast-switch rule table; both are co-located with the existing patterns and introduce no new architectural primitives. All five core principles continue to pass as assessed pre-research; no Complexity Tracking entries required.

## Complexity Tracking

> No violations to track. All work stays within the existing MUI + CSS-variable + `data-theme` cascade pattern, the existing shared SCSS layer, and the existing manifest. No new abstractions, no new frameworks, no shared-package additions, no new client boundaries, no nested ThemeProvider.
