# Phase 0 Research: Brand Color System Initialization

**Feature**: 006-brand-color-system-init
**Date**: 2026-06-17

The plan's Technical Context contains no `NEEDS CLARIFICATION` markers. This document records the small set of design decisions that needed evidence-based resolution before Phase 1, plus the codebase-state findings that informed the plan's chosen approach.

## 1. Where to mount the contrast-switch logic

**Decision**: Implement the contrast switch as additional rules layered onto the existing `data-theme` CSS cascade in `packages/component-library-styles/colors.scss`, with `Section.tsx` extended to set two more attributes (`data-bg-tone` and `data-bg-family`) that the new rules key off. Provide a TypeScript resolver in `apps/marketing/src/components/common/colors.ts` for components (Heading, Paragraph) that already compute their inline color from the manifest server-side.

**Rationale**:

- The repo already proves the cascade pattern. `apps/marketing/src/components/contentful/section/Section.tsx` line 103 sets `data-theme={hasPatternBackground || useDarkTheme ? 'Dark' : theme}`, and `packages/component-library-styles/colors.scss` defines `[data-theme='Light']` and `[data-theme='Dark']` blocks that remap semantic tokens. Adding two adjacent attributes (background tone, background family) and the corresponding rule blocks reuses the existing primitive instead of adding parallel machinery.
- The cascade resolves at browser CSS-cascade time, so the SSR HTML can emit the same `color` value across light and dark contexts and let CSS pick the visible result. This keeps every consumer SSR-only and removes any need for nested ThemeProvider, React Context, or a per-render server-side lookup for components that already style via class names.
- For components (Heading, Paragraph) that compute a hex/cssVar inline at render time, a small pure-function resolver matches the existing pattern (`cssVarForBrandColor`) and keeps the rule definition in one place — the resolver and the SCSS table are populated from the same TypeScript source (the manifest's `family` + `shade` metadata).

**Alternatives considered**:

- _MUI nested ThemeProvider_: would require wrapping every Section/Container with a nested `<ThemeProvider>` that re-binds the palette. The exploration confirmed there are zero nested ThemeProviders today, and the existing `code.org` theme has no MUI palette to invert (it is CSS-variable-driven). Adopting nested ThemeProvider would introduce a new architectural pattern for one feature.
- _React Context for background tone_: would require every Section/Container to wrap children in a provider and every text component to consume it, breaking the current "style via CSS class on the rendered element" pattern. It also adds a hydration boundary risk that the cascade does not.
- _Pure SSR resolution with no cascade_: would force the server to know the enclosing background at the moment it renders a text component. The current component tree does not pass enclosing-background context down, so this would require restructuring component composition or duplicating background info on every text element.

## 2. Where to define the 22 new CSS variables

**Decision**: Add the 22 `--codeai-{family}-{shade}` CSS custom properties to the file that currently hosts the existing `--codeai-*` primitives (`primitiveColors.scss` in `packages/component-library-styles/`, per Phase 1 exploration). Reference them through the manifest's `cssVar` field, exactly as the existing six entries already do.

**Rationale**:

- Single-source-of-truth principle, already in place per commit `ff2d67ee`. The manifest does not redefine hex values; it points at CSS variables, and SCSS owns the hex values. Extending in the same file preserves that.
- Variables defined as `:root` custom properties continue to be theme-agnostic primitives (per the file's name). The contrast-switch rules operate on semantic mappings that consume these primitives; the separation between primitives and semantics is preserved.

**Alternatives considered**:

- _Inline hex values in `colors.ts`_: would duplicate the palette. Rejected — violates FR-017 / SC-004.
- _Define inside MUI theme `palette`_: the `code.org` theme intentionally has no MUI palette entries today (CSS-variable-first), and the `csforall` theme would gain a parallel definition. Rejected.

## 3. Single dropdown vs dual-control for 22 options

**Decision**: Ship the default 22-option single dropdown via the existing `BRAND_COLOR_OPTIONS` array. Do not add a Contentful schema change. If post-ship usability feedback shows the flat list is unworkable, design a dual-control UX in a follow-up; the design constraint is to keep the single Contentful field unchanged (avoid duplicating fields) and add the family/shade split in the Studio editor extension layer only.

**Rationale**:

- The brief explicitly leaves this open and asks for the simplest viable UX. Contentful's default dropdown handles 22 options without modification. The current Heading dropdown already lists six brand options; adding sixteen more does not change Studio's rendering primitive.
- Adding family + shade as separate Contentful fields would (a) require an entry migration and (b) split a single conceptual choice across two fields, which is a Studio usability regression of its own.

**Alternatives considered**:

- _Dual Contentful fields (family + shade)_: rejected up front per the brief's "do not duplicate the field." Migration scope is also out of brief.
- _Custom Contentful UI extension_: out of scope for v1; logged as future work if usability requires it.

## 4. Server-rendered path preservation

**Decision**: All color resolution happens server-side or at CSS-cascade time. No `use client`, no browser-only dependency, no hydration island is added.

**Rationale**:

- The cascade pattern (Decision 1) does all the run-time decision-making in CSS. The TypeScript resolver runs on the server during SSR for the inline-styled components and emits a deterministic result. No new client surface is introduced.
- Confirms Principle II (Shared System First And SSR By Default).

**Alternatives considered**: None — a client-side switch would require shipping the rule table to the browser and rerunning resolution after hydration, which has no benefit and adds client bundle weight.

## 5. Contentful MCP usage for this feature

**Decision**: Skip Contentful MCP for v1. The `BRAND_COLOR_OPTIONS` validation array is authored entirely in application TypeScript (`apps/marketing/src/components/common/colors.ts`), and the Contentful side picks it up via the existing field-registration code path. No content type, no validation, no entry-level setting needs to be inspected or changed in Contentful Studio.

**Rationale**:

- Constitution Principle V requires Contentful MCP for schema-heavy work and read-before-write hygiene; this feature is neither. The code's `BRAND_COLOR_OPTIONS` array is what authors see, and extending it is purely an application-code change.
- If implementation surfaces a case where a Contentful-authored validation list does in fact own the dropdown (unlikely per the exploration), the discovery is escalated as a follow-up MCP-read item before that part of the work proceeds.

**Alternatives considered**:

- _Read Contentful Studio config to confirm dropdown source_: deferred to discovery during implementation if surface evidence of a Studio-side override appears. Plan does not block on a pre-emptive MCP read for v1.

## 6. Theme-default migration risk (Primary font)

**Decision**: Migrate the Primary font default in `apps/marketing/src/themes/code.org/index.ts` (and `csforall` if it carries the same default) from `neutral-black` to the new `Black` token. The new `Black` token routes through the contrast switch on dark backgrounds.

**Rationale**:

- The brief explicitly authorizes this single intentional visible change. On the current marketing pages, the default Primary font renders on light backgrounds, where the contrast switch is a pass-through and the rendered color is identical (`#000000` either way).
- The visible change manifests only where the Primary font default is used inside a Dark/Primary/Black Section background — today that would render the legacy `neutral-black` (presumed black) on a dark background, which is the existing unreadable case the feature is correcting. The migration _intentionally_ fixes that.

**Alternatives considered**:

- _Leave `neutral-black` in place and only update component-level defaults_: would leave the readability bug on dark sections that use the Primary font default. Rejected.
- _Apply the same migration to the csforall theme_: rejected. The csforall theme is being deprecated and is out of scope for behavioral changes (see Decision 10).

## 7. Storybook coverage shape

**Decision**: Extend existing story files (`Heading.story.tsx`, `Paragraph.story.tsx`, `Link.story.tsx` or equivalent, `SimpleList.story.tsx`, Container/Section stories) with new story exports that exercise the switch matrix. No new story files. Visual regression flows through the existing `marketing/storybook-eyes` Applitools pipeline; baseline acceptance in the dashboard is required per the existing CI process and the project's memory note on this.

**Rationale**:

- Existing stories are the right home; the components themselves are unchanged in their public API. New stories per component avoid story-file proliferation.
- Applitools is the established gate per the existing CI configuration and the project's noted past hard-fail behavior on visual diffs.

**Alternatives considered**: None — story-file proliferation is the only obvious deviation and it is rejected on simplicity grounds.

## 8. Per-brand Section variants (CS for All vs Corporate)

**Decision**: Extend the 22-color background option list on the **Corporate Site** variant only (`sectionCorporateSiteContentfulDefinition.ts`). The **CS for All** variant (`sectionCSforAllContentfulDefinition.ts`) is left untouched — its existing background list (`brandPrimary`, `brandSecondary`, `brandTertiary`, etc.) remains the only option set csforall content authors see. Both files continue to coexist; no consolidation is performed in this pass.

**Rationale**:

- The user requirement is "nothing on csforall should change." The CS for All Section definition feeds csforall's Studio dropdown; modifying it would alter csforall.
- The Corporate Site variant feeds code.org Studio's custom Section dropdown — that is the in-scope surface.
- Consolidating per-brand lists would require coordinated content migration and is logged as a follow-up.

**Alternatives considered**:

- _Add the new palette to both Section variants_: rejected — violates the csforall-untouched constraint.
- _Migrate both Section variants to a single shared list now_: rejected on scope.

## 9. Overline migration

**Decision**: Do not migrate Overline to the shared manifest in this pass. Log it as deferred work in tasks.

**Rationale**:

- Per exploration, Overline currently uses an inline list (`Primary`, `Secondary`, `White`) and does not consume `BRAND_COLOR_OPTIONS`. Migrating it would require either (a) restating its inline list as a subset of the new manifest, including a backward-compatibility alias for `Secondary`, or (b) accepting a content migration. Both are out of scope for this initialization pass per the brief.

**Alternatives considered**:

- _Migrate Overline together with the manifest extension_: rejected on scope.

## 10. csforall isolation level (soft isolation)

**Decision**: **Soft isolation**. Share `BRAND_COLOR_OPTIONS`, the SCSS primitives, and the shared `ContentfulDefinition` files between code.org and csforall. csforall content authors will see the new 22 dropdown options in Studio, and csforall pages will load the new `--codeai-*` CSS variables and the new contrast-switch rule block. No csforall content uses the new options and no csforall component references the new variables, so csforall **rendered pages do not change**. The only csforall-facing safeguard is a value-space guard in `Section.tsx` that suppresses the new `data-bg-tone` attribute unless the background is one of the 22 new CodeAI brand tokens — csforall's value space (`brandPrimary`, `brandSecondary`, etc.) is disjoint, so the attribute is not emitted on csforall.

**Rationale**:

- The user requirement is "nothing on csforall should change." The strictest interpretation (nothing in the DOM, nothing in the CSS payload, nothing in Studio dropdowns) requires forking the 4 shared `ContentfulDefinition` files into per-brand factories, splitting the SCSS primitives into a code.org-only file, and threading brand awareness through registration. That is meaningful infrastructure (4 file refactors, new SCSS file, registration changes) for a tenant that is being deprecated.
- The pragmatic interpretation (csforall rendered output is unchanged) only requires the `Section.tsx` value-space guard — a single conditional that is correctness-driven (the new attribute makes no sense on csforall background values regardless of the isolation goal). All other surfaces are either inert on csforall or already brand-segregated by file path (`designTokens.ts`, themes, custom Section per-brand definitions).
- The user explicitly chose this approach when presented with the hard-isolation alternative.
- Trade-off accepted: csforall Studio dropdowns will show new options that no csforall content uses. If a csforall author selects one out of curiosity, the rendered hex would be the same as on code.org (shared CSS variable). This is an editorial change to csforall Studio but not a behavioral change to csforall pages.

**Alternatives considered**:

- _Hard isolation via factory refactor_: convert each of Heading/Paragraph/Link/SimpleList `ContentfulDefinition` from a static const to a `(brand) => Definition` factory; add per-brand `BRAND_COLOR_OPTIONS` arrays; have each per-brand registration call the factory with its brand. Move new SCSS primitives into a code.org-only file imported by the code.org theme only. **Rejected** because the user explicitly weighed it against soft isolation and chose soft isolation given csforall's deprecation.
- _Hard isolation via per-brand definition forking_: keep the current shared `ContentfulDefinition` files as the csforall variants and create new sibling files for code.org (matching the existing per-brand Section pattern). Same end-state as the factory refactor but with more files and no consumer API change. **Rejected** for the same reason.

## Confirmed Codebase Anchors (from Phase 1 exploration)

These are facts about the current state of the repo that the plan relies on; they are listed here so future readers do not have to re-do the discovery.

- **Single-source manifest**: `apps/marketing/src/components/common/colors.ts` — exports `BRAND_COLORS` (array of `{ value, displayName, cssVar }`), `BrandColor` (union type), `BRAND_COLOR_OPTIONS` (Contentful validation array), `cssVarForBrandColor()`. Legacy fallbacks live in the same file: `LEGACY_ICON_COLORS = ['secondary', 'brand']`, `LEGACY_PARAGRAPH_COLORS = ['secondary']`.
- **CSS primitives**: `packages/component-library-styles/colors.scss` defines `[data-theme='Light']` and `[data-theme='Dark']` blocks; `primitiveColors.scss` defines the existing `--codeai-*` primitives. (The exact path of `primitiveColors.scss` should be confirmed at file-touch time; it sits under the same `packages/component-library-styles/` workspace per the exploration.)
- **Cascade trigger**: `apps/marketing/src/components/contentful/section/Section.tsx` line 103 sets `data-theme` on the rendered Section. Children inherit the cascade via CSS attribute selectors; no React Context is used.
- **MUI theme files**: `apps/marketing/src/themes/code.org/index.ts` (CSS-variable-first, no MUI palette), `apps/marketing/src/themes/csforall/index.ts` (traditional MUI palette + tertiary augmentation in `apps/marketing/src/types/mui.d.ts`).
- **Design-token registration**: `apps/marketing/src/contentful/registration/code.org/designTokens.ts` (lines 21–24) maps `BRAND_COLORS` to native Container/Section color/border pickers.
- **Existing consumers of `BRAND_COLOR_OPTIONS`**: Heading (`heading/HeadingContentfulDefinition.ts`), Paragraph (`paragraph/ParagraphContentfulDefinition.ts`), Text Link (`link/LinkContentfulDefinition.ts`), Simple List (`simpleList/SimpleListContentfulDefinition.ts`). Heading and Paragraph also expose a `colorOverride` hex field. Overline does NOT consume the shared list (deferred per Decision 9).
- **`getContrastText` is not currently imported anywhere in the marketing app** — confirming that the contrast switch is a net-new behavior, not a re-route of an existing utility.
- **No nested `<ThemeProvider>` exists today** — confirming the cascade approach (Decision 1) does not contradict an existing inversion pattern.
- **Brand isolation infrastructure**: per-brand Contentful registrations exist at `apps/marketing/src/contentful/registration/code.org/index.ts` and `apps/marketing/src/contentful/registration/csforall/index.ts`, dispatched by `getContentfulRegistration(brand)` in the parent `registration/index.ts` (lines 16–34). Both registrations import the SAME `HeadingContentfulComponentDefinition`, `ParagraphContentfulComponentDefinition`, `LinkContentfulComponentDefinition`, and `SimpleListContentfulComponentDefinition` files — there is no per-brand filter on `BRAND_COLOR_OPTIONS` today, which is why soft isolation (Decision 10) accepts that csforall Studio dropdowns will see the new options. csforall's `registration/csforall/index.ts` has no `designTokens` export, so the native Container/Section design-tokens panel is code.org-only by construction. The shared SCSS layer (`packages/component-library-styles/colors.scss` and `primitiveColors.scss`) is imported once in `apps/marketing/src/app/layout.tsx:3` and loads on both brands. The custom Section uses per-brand definitions: `sectionCorporateSiteContentfulDefinition.ts` (registered on code.org) and `sectionCSforAllContentfulDefinition.ts` (registered on csforall).
- **Section.tsx brand-aware branches**: existing conditionals in `Section.tsx` (lines 87–119) include `hasPatternBackground`, `useDarkTheme`, and a hardcoded pattern background image — all labeled "Corporate Site only" in inline comments. csforall has no parallel pattern-based branching. The new `data-bg-tone` value-space guard adds a single conditional alongside these existing ones.
