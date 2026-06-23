# Phase 0 Research: Brand Buttons & Brand Text Link

**Feature**: 008-brand-buttons
**Date**: 2026-06-22 (re-written after /speckit.clarify added Text Link to scope and finalized the Figma token grid)

This document resolves the implementation choices the spec deferred to the plan. The spec contains a `## Clarifications` section recording the four user-confirmed decisions from `/speckit.clarify`; this file picks up the remaining decide-and-record items and adds R12–R17 for the Text Link work.

---

## R1 — Component placement: extend the existing shared primitive vs introduce `BrandButton` sibling

**Decision**: Extend `Button` / `LinkButton` / `GenericButton` in `packages/component-library/src/button/` in place. No new `BrandButton` component.

**Rationale**: User explicitly stated "We will utilize the current system in place, updating the options, and adding more… we should be able to avoid needing to retain anything as legacy." Shared primitive is the single insertion point for every downstream consumer; updating it in place propagates the rebrand. Constitution II (Shared System First) explicitly calls for this.

**Alternatives considered**:

- **Parallel `BrandButton`**: rejected — two implementations to maintain, drift risk, ambiguous import path.
- **Fork only the code.org Contentful wrapper**: rejected — leaves the shared component frozen; direct in-code consumers (Video, AdoptionMap, AFE, YourSchool, ContentEditorHelper) would render old visuals while Contentful-driven pages diverge.
- **Replace `Button` entirely with a thin MUI wrapper**: rejected — would require re-implementing icon-only, isPending, useAsLink, forwardRef-to-anchor, custom focus ring, brand-icon detection. Non-trivial work for no behavioral gain.

---

## R2 — `gray` Button color: remove fully

**Decision**: Remove `gray` from `ButtonColor` in `types.ts`. Migrate the one real consumer (`packages/component-library/src/video/Video.tsx:168`) from `color="gray" type="secondary" size="xs"` to `color="black" type="secondary" size="s"` in the same PR. Remove the two `&.button-gray` SCSS blocks. Remove the `color === 'gray'` throw branches from `checkButtonPropsForErrors`. Remove the corresponding test.

**Rationale**: Spec FR-003 + SC-004 require removal. Grep verified Video.tsx is the only real consumer; story-file references are for non-Button components (Dropdown/Chip/etc. with their own color enums). Black secondary in the new Brand Buttons is the closest visual match. User's intent ("no legacy retained") honored.

**Alternatives considered**:

- **Keep `gray` indefinitely**: rejected — contradicts spec and user intent.
- **Migrate Video.tsx in a separate later PR**: rejected — leaves the type union temporarily broken. One PR keeps the change atomic.
- **Replace Video download `LinkButton` with `Button` (non-link)**: rejected — it's semantically a download link with `href`.

---

## R3 — `destructive` Button color: preserve as a segregated legacy variant

**Decision**: Preserve `destructive` in `ButtonColor`, preserve its three `&.button-destructive` SCSS rules, and add a top-of-file SCSS comment block clearly labeling the destructive section as "non-Brand legacy treatment — see follow-up spec." A separate Figma component set (`Destructive Button`) already exists in the CodeAI Design System and will get its own spec.

**Rationale**: Real consumer at `apps/marketing/src/components/contentEditorHelper/ContentEditorHelper.tsx:61` — the floating draft-mode preview toggle. Admin/preview-mode utility, not a Brand Buttons surface. Removing destructive would force a migration this feature would later reverse when destructive is rebuilt.

**Alternatives considered**:

- **Remove destructive now + migrate ContentEditorHelper to `color="black"`**: rejected — adds churn the follow-up will reverse.
- **Move destructive styling into a separate `DestructiveButton` component now**: rejected — anticipates the follow-up spec's design.

---

## R4 — Per-state token grid plumbing

**Decision (revised after `/speckit.clarify`)**: The Figma per-state token grid is **final** and recorded in `specs/008-brand-buttons/figma-tokens.md`. Implementation adds a new SCSS file **`packages/component-library-styles/buttonColors.scss`** containing the 13 distinct CSS custom properties listed in figma-tokens.md (`--button-color-purple-primary`, `--button-color-purple-hover`, `--button-color-purple-dark`, `--button-color-purple-light`, `--button-color-purple-tint`, `--button-color-black`, `--button-color-white`, `--button-color-white-alpha-20`, `--button-color-disabled-dark`, `--button-color-link-disabled`, `--button-color-disabled-light`, `--button-color-disabled-bg`, `--button-focus-ring`). The Brand Button SCSS module `genericButton.module.scss` consumes these via `var(--…)` — no placeholder fallbacks, no aliases to the universal `primitiveColors.scss` variables (per user: "use the colors in Figma — those are final").

**Rationale**:

- Keeping the new Brand Button CSS variables in a sibling file (`buttonColors.scss`) rather than `primitiveColors.scss` keeps the two concerns physically separated. `primitiveColors.scss` is for tenant-themeable brand colors (spec 006); `buttonColors.scss` is for the Brand Button per-state grid (this spec). The two files are independent.
- The user's "Figma colors are final" directive forbids aliasing to existing tokens that may themselves change. Encoding the Figma hex values directly in `buttonColors.scss` makes the CSS file a precise mirror of the Figma source.
- A sibling file keeps the grid easy to audit (one file = one design source of truth) and easy to regenerate if Figma later updates the tokens (sweep the file, re-apply).

**Alternatives considered**:

- **Inline hex values per cell in `genericButton.module.scss`**: rejected — buries the palette in the SCSS module; future grid changes would require editing 45+ rules instead of 13.
- **Reuse existing `primitiveColors.scss` variables where hex matches**: rejected per user directive — even when hex matches (e.g. `#4C42CF` may coincidentally equal `--codeai-purple-primary`), aliasing risks future drift if the universal manifest's hex changes.
- **Use SCSS variables instead of CSS custom properties**: rejected — CSS custom properties allow per-tenant theming via `data-theme` selectors if a future tenant wants to override Brand Buttons (currently csforall doesn't — but the architecture stays open).
- **Land the grid as inline `sx` styles**: rejected — the Brand Button is a shared SCSS-module component; staying in the SCSS module preserves the package's CSS-not-JS convention.

---

## R5 — Corner-radius token: placement and naming

**Decision**: Add SCSS variable `$button-border-radius: 0.5rem;` to `packages/component-library-styles/variables.scss`. Reference from `genericButton.module.scss` as `border-radius: variables.$button-border-radius;` and from the new `themes/code.org/styleOverrides/link.ts` (when referenced — Links are inline and don't have a fill background, but the focus-ring overlay uses radius math derived from this value).

**Rationale**:

- Matches the existing convention (`$regular-border-radius` lives in `variables.scss`).
- A SCSS variable is correct because the radius is not currently tenant-themeable; CSS custom property indirection adds no value.
- The token name `$button-border-radius` is button-specific (not `$radius-md`) so future radius changes to other components don't affect Buttons.
- The Figma Brand Link uses the **same** `8px` inner cell radius and `10px` outer focus ring radius as Buttons (per `figma-tokens.md`), so Text Link can reference the same constant if it adds any cornered surface (currently only the focus ring overlay).

**Alternatives considered**:

- **CSS custom property `--button-radius` in `primitiveColors.scss`**: rejected — adds indirection with no current per-tenant need.
- **Inline `0.5rem` everywhere**: rejected — fails FR-010 "one place" requirement.
- **Module-local SCSS variable in `genericButton.module.scss`**: rejected — radius is a cross-component intent that other Brand-shaped components (SegmentedButtons, RadioButton) may opt into.

---

## R6 — Size-scale rename: `xs/s/m/l` → `s/m/l/xl`

**Decision**: New local type alias `export type ButtonSize = 's' | 'm' | 'l' | 'xl';` in `packages/component-library/src/button/types.ts`. Replace `size?: ComponentSizeXSToL` with `size?: ButtonSize` on `CoreButtonProps`. Sweep three files:

- `packages/component-library/src/video/Video.tsx:174` — `size="xs"` → `size="s"` (same PR as R2's color migration).
- `packages/component-library/src/button/stories/Button.story.tsx:288` — `size: 'xs'` story removed.
- `packages/component-library/src/button/stories/LinkButton.story.tsx:301, 321` — `size: 'xs'` stories removed.

Shared `ComponentSizeXSToL` continues to live in `packages/component-library/src/common/types.ts` for the many other components (Slider, Dropdown, Tooltip, Toggle, Chips, Tabs) that still use the xs-through-l scale.

**Rationale**: Figma Brand Buttons axis is `sm/md/lg/xl` — no `xs`. Local type alias avoids a wider repo sweep. Old `xs` → new `s` is the closest visual mapping.

**Alternatives considered**:

- **Keep `xs` as an alias for `s`**: rejected — legacy alias the user wanted to avoid.
- **Rename shared `ComponentSizeXSToL` repo-wide**: rejected — touches ~15 unrelated components.

---

## R7 — External link + author right-icon precedence (FR-019)

**Decision**: Author-set right icon wins. `ButtonLegacy.tsx` constructs `iconRight` from the new `iconRightName` Contentful field when set; when `iconRightName` is empty AND `isLinkExternal === true`, the existing `externalLinkIconProps` is used as a fallback. `target="_blank"` + `rel="noopener noreferrer"` + the optional aria-label suffix are unaffected.

**Rationale**: New `iconRightName` field is explicit author intent; auto-injecting the external-link icon over it surprises authors. The fallback preserves visual continuity for existing entries that don't set a right icon.

**Alternatives considered**:

- **External-link icon always wins, suppress author right icon**: rejected — overrides explicit author choice.
- **Render both icons (author right + external indicator)**: rejected — visually crowded.
- **Add a separate "show external indicator" Boolean**: deferred — possible follow-up if authors complain.

---

## R8 — Button "schema" update: code-side Component Definition only (revised)

**Decision**: **No Contentful Studio work.** The Button is a Contentful Experiences component — its options are hard-coded in `ButtonLegacyContentfulComponentDefinition.variables` in `apps/marketing/src/components/contentful/corporateSite/buttonLegacy/ButtonLegacyContentfulDefinition.ts`. The new options (`size`, `iconRightName`, `isIconOnly` Design-tab variables; `tertiary` added to the `type` enum) land as a code edit to that `variables` object. Studio editors automatically see the new options on the Design tab when they edit any Experience containing a Button after deploy.

**Rationale (re-grounded after clarification)**: There is no `button` content type in Contentful. Buttons live as composed component config inside Experience entries; the component's variable schema is defined in code via the Experiences SDK ComponentDefinition. The Content-tab fields (`text`, `href`, `isLinkExternal`, `ariaLabel`) keep their existing binding contract — they can bind to a Link content-type entry's fields (the unchanged pattern) or be authored manually per Button instance. Constitution V's "MUST not silently mutate Contentful schema" still applies — no Contentful content type or entry is mutated by this feature.

**Operational implications**:

- No Studio steps. No `ctf_get_content_type` MCP re-read. No human-applied schema delta.
- Existing composed Buttons in Experience entries auto-validate against the expanded Component Definition (missing new variables default per FR-013).
- The PR's "Contentful section" becomes: "no Contentful changes; Component Definition variables updated in code; Studio editors will see the new Design-tab options after deploy."

**Alternatives considered (now moot)**:

- ~~Migration script via `contentful-cli`~~: not applicable — no content type to migrate.
- ~~Create a new content type `button-v2` and migrate entries~~: not applicable — no `button` content type exists.

---

## R9 — Storybook update strategy across two storybook apps

**Decision**: Brand Button updates land in `packages/component-library/src/button/stories/` (consumed by `apps/design-system-storybook`). The Brand Text Link updates land in `apps/marketing-storybook/stories/Link.story.tsx`. The `apps/marketing-storybook/stories/Button.story.tsx` file is the **CSforAll MUI button** story and is not touched.

**Rationale**: The two storybook apps cover different layers (design-system primitives vs Contentful-driven compositions). Existing pattern; not changing it.

---

## R10 — Default size for migrated Contentful Button entries

**Decision**: `size` field defaults to `m`. Existing entries (which lack the field) read as `m` when fetched, matching today's hard-coded `ButtonLegacy.tsx` behavior of `size="m"`. No visual size shift.

**Rationale**: `ButtonLegacy.tsx` today hard-codes `size="m"`. Defaulting the new field to `m` preserves the rendered output exactly.

---

## R11 — `iconPosition` field on the Contentful Button schema

**Decision**: Drop `iconPosition` from the Button schema delta. Two separate icon-name fields (`iconLeftName` + `iconRightName`) are clearer in Studio and let authors set both icons at once. Spec FR-013 documents this; the spec's tentative inclusion of `iconPosition` is superseded.

**Note**: This decision is Button-only. **Text Link keeps its existing `icon` + `iconPosition` schema** (per spec FR-037) because the Brand Link spec does not include a "both icons" case and the existing single-name + position pattern is sufficient.

---

## R12 — Text Link tenant isolation (key finding from re-plan)

**Decision**: The shared Text Link component (`apps/marketing/src/components/contentful/link/Link.tsx`) is **theme-aware**: per-Hierarchy color, hover behavior, focus ring, and Loading state move into MUI `MuiLink.styleOverrides` per tenant theme. Two new tenant-theme files land:

- `apps/marketing/src/themes/code.org/styleOverrides/link.ts` — encodes the **new Brand Link rules** per `figma-tokens.md` (3 Hierarchies × 5 states + Focus Blue + per-size dimensions). On code.org, hovering a `color` Hierarchy link shifts text from `#4C42CF` to `#382EA5` (no underline); hovering `black`/`white` adds an underline.
- `apps/marketing/src/themes/csforall/styleOverrides/link.ts` — encodes **today's legacy Link styling**, extracted from the current hardcoded `sx={...}` block in `Link.tsx`. CSforAll's rendered Text Link output MUST be **byte-identical** before and after this feature merges.

The `Link.tsx` component itself becomes presentational: it accepts a `Hierarchy` (or maps `color` → Hierarchy via the render-time auto-mapping rule from spec FR-029), passes the underlying `<MuiLink>` a `data-hierarchy` attribute, and relies on the tenant theme's `MuiLink.styleOverrides` to apply per-Hierarchy CSS. The `useSectionBackground` + `resolveTextColorForBackground` contrast-switch logic stays in `Link.tsx` (for the `color` and `black` Hierarchies only); the `white` Hierarchy bypasses it.

**Rationale**:

- The Text Link is registered on **both** tenants today (`apps/marketing/src/contentful/registration/code.org/index.ts:286` and `csforall/index.ts:130`). A naive re-skin would change csforall visuals, violating the user's "CSforAll shouldn't be affected" constraint and creating a visual diff on every csforall page that contains a Text Link entry.
- MUI theme overrides per tenant are the **existing repo pattern** for tenant-specific component styling (`themes/code.org/styleOverrides/button.ts` and `themes/csforall/styleOverrides/button.ts` already exist for the CSforAll MUI button). Adding `link.ts` files mirrors this convention.
- A `data-hierarchy="color"` / `data-hierarchy="black"` / `data-hierarchy="white"` attribute on the rendered `<a>` element gives the tenant theme a clean selector hook without requiring class names or per-Hierarchy components.
- CSforAll keeping the legacy styling is consistent with FR-015's CSforAll byte-identical Button promise. CSforAll's Text Link follows the same posture.
- `RichText.tsx` (which composes `Link`) is not touched — same import path, same component name.

**Alternatives considered**:

- **Fork the Text Link into per-tenant components** (e.g. new `BrandTextLink.tsx` for code.org, leave existing `Link.tsx` for csforall): rejected — `RichText.tsx` imports `Link` from `@/components/contentful/link` and would need to be made tenant-aware too, plus all other direct callers. Blast radius too wide.
- **Re-skin Link.tsx globally and accept that csforall Text Links visually change**: rejected — explicit "CSforAll shouldn't be affected" constraint. CSforAll's Text Link visuals must not diff.
- **Leave Link.tsx alone for csforall and have code.org's registration point to a brand-new component**: rejected — registration-level component override is technically possible but creates the same Link-vs-BrandTextLink fork problem with RichText.tsx still importing the legacy file.
- **Make Link.tsx read tenant from React context** (e.g. a new `useTenant()` hook): rejected — duplicates information the active MUI theme already carries; theme overrides are the more idiomatic MUI/repo-convention path.

---

## R13 — Text Link Component Definition: per-tenant variable enum (clarified)

**Decision**: The Text Link Component Definition lives in `apps/marketing/src/components/contentful/link/LinkContentfulDefinition.ts` and is updated to export **two factories** that both produce a definition with exported component id `link` but with different `variables.color.validations.in` and `variables.size.validations.in` enums:

- `BrandLinkContentfulComponentDefinition` (code.org): `color` enum narrowed to 3 Hierarchies (`color`/`black`/`white`); `size` enum narrowed to `[s, m, l]`.
- `LegacyLinkContentfulComponentDefinition` (csforall): keeps the existing 22-color `brandTextColorOptions('purplePrimary')` enum and the existing `[xs, s, m, l]` size enum.

Each tenant's registration file imports the appropriate factory. Both definitions share the same Content-tab variables (`children`, `href`, `isLinkExternal`, `ariaLabel`, `removeMarginBottom`) via a shared `BASE_VARIABLES` constant.

Existing code.org composed Text Links with stored values outside the narrowed enums continue to render via the render-time auto-mapping in `Link.tsx` (FR-029). **No Contentful Studio work required** — like Buttons, this is entirely a code-side ComponentDefinition update.

**Rationale (clarified)**:

- The Contentful content type `link` (the underlying type authors use to create reusable Link entries that bind into Buttons and Text Links) is **not touched**. Link entries continue to validate and read identically on both tenants.
- The narrowing of the Component Definition's enums is a code edit; Studio editors immediately see the narrower options on the Design tab of any Experience containing a Text Link after deploy.
- Per-tenant ComponentDefinition factories match the existing pattern Buttons use (different definitions per tenant for the same exported id).
- Zero Studio steps; zero MCP re-read for content-type schema (the schema isn't changing).

**Alternatives considered (now moot)**:

- ~~Narrow the `color` field in the Contentful content type~~: not applicable — narrowing happens at the Component Definition, not the content type.
- ~~Create a new `brand-link` content type for code.org~~: not applicable — content types are not involved in this rebrand.

---

## R14 — Text Link `isStrong` field disposition

**Decision**: Keep the `isStrong` Contentful field; the code.org tenant theme renders Brand Links **always Bold 700** per Figma (the field becomes a render-time no-op on code.org). The csforall tenant theme continues to honor `isStrong` for its legacy Text Link styling.

**Rationale**:

- Field removal would require either a human-applied Studio schema change (overhead) or a per-tenant ComponentDefinition delta (more registration complexity). The render-time no-op is the simplest path.
- Keeping the field preserves the Contentful schema; no entry-side change needed.
- The csforall tenant continues to use the field, so removing it from the underlying schema would break csforall behavior.
- A future spec that finalizes the CSforAll deprecation can remove the field entirely.

**Alternatives considered**:

- **Remove `isStrong` from the code.org registration's ComponentDefinition**: deferred — adds registration complexity for marginal author UX gain (the field becomes hidden in Studio, but still present in the Contentful schema). Could land in a follow-up if authors complain about a useless field.
- **Repurpose `isStrong` as "extra-bold" toggle**: rejected — Figma defines no extra-bold weight for Brand Links.

---

## R15 — Text Link `size` field handling: registration-side enum delta

**Decision**: Like the `color` field, the `size` field's validation enum is narrowed per tenant via the registration:

- code.org registration: `[s, m, l]` (no `xs`, no `xl` — per Figma).
- csforall registration: `[xs, s, m, l]` (existing 4-size enum, unchanged).

Existing code.org entries with `size="xs"` render via the render-time auto-mapping in `Link.tsx` (Brand Link path branches on tenant): `xs` → `s` on code.org; `xs` → `xs` on csforall (unchanged).

**Rationale**:

- Same per-tenant registration pattern as R13 (`color` field).
- Zero Contentful Studio change.
- Existing csforall entries with `size="xs"` continue to render as today.

**Alternatives considered**:

- **Narrow the Contentful schema globally**: rejected — same csforall-impact reason as R13.
- **Defensively map all sizes at render time regardless of tenant**: rejected — would mask actual mis-configured sizes on csforall; the per-tenant approach is more honest.

---

## R16 — Text Link asymmetric Hover rule implementation

**Decision**: The MUI `styleOverrides` on `themes/code.org/styleOverrides/link.ts` declares per-Hierarchy `&:hover` rules:

- `[data-hierarchy="color"]:hover { color: #382EA5; /* no underline */ }`
- `[data-hierarchy="black"]:hover { text-decoration: underline; /* color unchanged */ }`
- `[data-hierarchy="white"]:hover { text-decoration: underline; /* color unchanged */ }`

The existing Link.tsx's wrapping `<span style={{textDecoration: 'underline'}}>` (which currently underlines all link labels) is **removed**; the per-Hierarchy CSS now controls decoration entirely. On csforall, the `themes/csforall/styleOverrides/link.ts` keeps the legacy behavior (label is always underlined via the same removed span pattern, replicated in theme overrides).

**Rationale**: Encoding the rule as data-attribute selectors keeps the asymmetry visible in CSS (easy to audit against `figma-tokens.md`) and avoids per-Hierarchy props or JS branching. The `data-hierarchy` attribute is the same selector hook used elsewhere for tenant-themed components.

**Alternatives considered**:

- **JS-side `sx` branching per Hierarchy in Link.tsx**: rejected — duplicates the per-Hierarchy logic across the Link.tsx component and the theme override; harder to keep aligned with Figma.
- **Always-underline approach (preserves today's behavior)**: rejected — contradicts Figma asymmetric rule.

---

## R17 — Text Link Loading state plumbing

**Decision**: Add a new optional `isPending` Boolean prop on `Link.tsx` (matching the Button API's `isPending` convention). The corresponding Contentful schema gets no new field (Text Link Loading is typically driven by parent component state, not by Contentful authoring) — instead, the `isPending` prop is set by upstream callers (forms, async UI). Storybook coverage exercises the Loading state explicitly per FR-040.

**Rationale**:

- Loading is typically a runtime UI state, not an author choice. Adding a Contentful field would clutter the editor for a rarely-used static value.
- The `isPending` prop matches Button's API naming, so consumers transitioning between primitives see consistent conventions.
- Storybook can exercise the visual without a Contentful field via story args.

**Alternatives considered**:

- **Add an `isLoading` Contentful Boolean**: rejected — author wouldn't have a use case for a permanently-loading link.
- **Skip the Loading state entirely on Text Link**: rejected — Figma includes it; covered by FR-035.

---

## Summary of changes vs spec

- **FR-013** (Buttons): drop `iconPosition` (R11).
- **FR-003 / SC-004**: confirmed (gray fully removed; Video.tsx migrated in same PR — R2).
- **FR-005**: confirmed (size sweep targets Video.tsx + 3 stories; xs fully removed from Button — R6).
- **FR-010**: corner-radius token landing site confirmed as `packages/component-library-styles/variables.scss` (R5).
- **FR-019**: confirmed (author right icon wins; external-link fallback when no author right icon — R7).
- **FR-023**: confirmed (**No Contentful Studio work**. Button options are code-side Component Definition variables, not Contentful content-type fields. R8 revised.).
- **FR-026**: destructive segregation confirmed (R3).
- **FR-027 / FR-029 / FR-030 / FR-031** (Text Link): no Contentful schema change (R13). `isStrong` kept as no-op on code.org (R14). `size` narrowed via registration only (R15).
- **FR-032** (Text Link contrast switch): preserved via Link.tsx's existing `useSectionBackground` plumbing, branched per Hierarchy — `color` and `black` route through `resolveTextColorForBackground`; `white` does not. The contrast-switch logic stays in JS (in Link.tsx); CSS in the theme override handles base color per Hierarchy.
- **FR-033** (asymmetric Hover): implemented in `themes/code.org/styleOverrides/link.ts` via data-attribute selectors (R16).
- **FR-035** (Loading state): exposed via `isPending` prop on Link.tsx, not via a Contentful field (R17).
- **FR-038** (Figma-final tokens): land in `packages/component-library-styles/buttonColors.scss` (R4 revised). No placeholder fallbacks. Consumed by both `genericButton.module.scss` and the new `themes/code.org/styleOverrides/link.ts`.
- All other FRs: unchanged.
- **Key tenant-isolation note**: Text Link's per-tenant styling is achieved via MUI `MuiLink.styleOverrides` per tenant theme, NOT via a tenant-fork of the React component (R12). The shared `Link.tsx` becomes theme-aware. CSforAll Text Link visuals MUST stay byte-identical post-merge (new test case in `apps/marketing/src/components/contentful/link/__tests__/`).
