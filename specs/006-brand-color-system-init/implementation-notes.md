# Implementation Notes: Brand Color System Initialization

**Feature**: 006-brand-color-system-init
**Status**: Implemented on `dee/brand-color-system-init` (ready for review)
**Purpose**: Captures the cross-cutting hurdles, surprises, and decisions revised _after_ the plan was approved. Read alongside `plan.md` (intent) and `tasks.md` (per-task execution record).

## What shipped vs the plan

The plan-as-approved delivered cleanly with one notable refinement: the contrast switch's implementation mechanism turned out to be a **hybrid** (TypeScript resolver via React context for inline-styled components + SCSS cascade for inherited text), not the pure CSS-variable cascade originally sketched in `research.md` Decision 1. See hurdle 1 below.

Three issues were caught during the first visual test pass in Storybook and resolved before commit:

1. New CodeAI brand backgrounds didn't paint (no CSS rules existed for the new `section-background-{token}` classes).
2. Legacy "Primary (white)" Section + default Primary text → invisible white-on-white (value-space-guard bug).
3. Four legacy brand-color entries (`purple`, `darkPurple1`, `darkPurple2`, `lightGreen3`) were stale and needed removal.

Per-component default colors and Divider integration came in after the bug fixes via direct user requests; those are reflected in `tasks.md` and the diff but not in the original plan.

## Hurdles encountered

### 1. MUI `sx` styling forced a React context for the contrast switch

`research.md` Decision 1 sketched a pure CSS-variable cascade (extend the `[data-theme='Dark']` cascade in `colors.scss`). That works for components that style via CSS class names — which Rich Text body text effectively does, by inheriting `color` from the Section. But Heading, Paragraph, Text Link, and Simple List style via MUI's `sx` prop, which compiles to a generated className whose specificity competes unpredictably with descendant attribute selectors.

**Resolution**: Introduced `SectionBackgroundContext` (a small React context provided by `Section.tsx`, consumed by Heading/Paragraph/Link/SimpleList). The TypeScript resolver `resolveTextColorForBackground()` does the brand→brand mapping; consumers compute their final `color` value before MUI renders. The SCSS cascade still handles Rich Text body inheritance via `[data-bg-tone] { color: ... }`.

**Lesson**: When the design system uses inline-style libraries (MUI sx, emotion), a CSS-only approach to "ancestor-driven defaulting" is brittle. A small React context next to the existing cascade is the cleanest hybrid.

### 2. Value-space-guard collision on the string `'primary'`

The plan's `Section.tsx` value-space guard was implemented as:

```ts
const BRAND_BACKGROUND_VALUES = new Set<string>(BRAND_COLORS.map(c => c.value));
```

This silently matched the **legacy text-color** manifest entry `primary` even though, in Section's namespace, `background="primary"` means _the legacy white background_. Result: every Heading/Paragraph with default `color="primary"` placed in a default Section rendered white text on a white background.

**Resolution**: Excluded `'primary'` from the brand-background set. The guard is now value-space-driven (it knows that the BrandColor `primary` is a text-color semantic, not a section-background semantic) rather than naive about the cross-namespace string overlap.

**Lesson**: When two namespaces share a string key by coincidence ("primary" as both a text token and a background token), a value-space guard built from one namespace will silently misfire on the other. Either fork the value spaces, or filter explicitly.

### 3. Component-specific "Primary" semantics

Initial implementation migrated `BRAND_COLORS.primary.cssVar` from `var(--text-neutral-primary)` (theme-aware) to `var(--neutral-base-true-black)` (static `#000000`). The intent — from the brief — was to migrate Primary to "the new Black with switching capability". The execution unified Primary's behavior across every component that read `cssVarForBrandColor('primary')`.

The user flagged this immediately after visual testing: **"Each component utilizes Primary differently. I believe you approached all Primary as the same."**

The component-specific behaviors that existed before the migration:

- **Heading**, **Paragraph**: Primary = theme-aware neutral text (white on legacy dark Sections via `[data-theme='Dark']` cascade)
- **Text Link**: Primary = `var(--codeai-purple-dark-1)` — a deliberate purple divergence for visual link distinctness
- **Simple List**: Primary = theme-aware neutral text (same as Heading/Paragraph)

The static-true-black override broke Heading/Paragraph on legacy dark Sections (text rendered black-on-dark-gray) and added a redundant code path next to Link's existing override.

**Resolution**: Reverted `primary.cssVar` to `var(--text-neutral-primary)` (theme-aware via the existing cascade). Migrated the true-black intent into the SCSS layer instead — see hurdle 4.

### 4. Primary→true-black migration: SCSS layer, not the manifest

Once we knew the manifest-level migration broke component-specific behavior, the question became: how do we still satisfy the brief's "Primary should render as true black" without unifying all consumers?

The user picked the SCSS path: change the Light-theme `--text-neutral-primary` definition from `var(--neutral-base-black)` (`#292F36`) to `var(--neutral-base-true-black)` (`#000000`) in `colors.scss`. Every consumer that already routes through `--text-neutral-primary` inherits the migration. The Dark-theme cascade (`--text-neutral-primary: var(--neutral-base-white)`) is untouched, so legacy `data-theme='Dark'` Sections still produce white text. The contrast switch resolver still flips Primary text to white on **new** CodeAI dark Sections via FR-007.

**Lesson**: When a "small visual shift" needs to propagate through an established cascade, prefer changing the underlying SCSS variable over swapping out the manifest entry. The cascade does the work; the manifest stays component-agnostic.

### 5. Removed legacy entries cascaded further than expected

The user requested removal of four legacy entries (`purple`, `darkPurple1`, `darkPurple2`, `lightGreen3`) on the grounds that they weren't used in any current content. Initial exploration found references in `packages/component-library/` code and assumed they were live consumers, leading to a proposal to keep the CSS variables and only remove the BRAND_COLORS entries.

Closer inspection revealed two distinct namespaces sharing the string `"purple"`:

- **BRAND_COLORS** `purple` (marketing manifest, ~16 references)
- **ButtonColor** `'purple' | 'black' | 'gray' | 'white' | 'destructive'` (component-library legacy Button enum, ~15 references in Button/Dialog/Modal/Dropdown/HeroBanner/etc.)

The ButtonColor namespace is completely unrelated. After filtering it out, the actual BRAND_COLORS-side scope was small: Link's hardcoded `var(--codeai-purple-dark-1)` and four SimpleList stories/tests in component-library.

**Resolution**: User opted for the clean cleanup. Removed BRAND_COLORS entries + CSS variable definitions + updated the 4 marketing-app consumer files + the 4 component-library SimpleList files. Link's hardcoded reference updated to `var(--codeai-purple-primary)` (same hex). `--codeai-purple` itself was not preserved — the only orphan reference (a comment in `simpleList.module.scss`) was updated.

**Lesson**: When grepping for "is this string used", string-match results need a per-file semantic check. Name collisions across packages are common in monorepos, and a literal-string explorer will produce false positives without that follow-up.

### 6. Divider's value-string collision

The Divider component had pre-existing legacy color values `'primary' | 'strong' | 'white'`, rendered via `.divider--color-{value}` CSS classes in the theme. Adding the new brand palette would have created two-way collisions: `primary` and `white` exist in _both_ namespaces but mean different things in Divider's context (legacy gray border vs new brand text-color semantic; legacy white border vs new white background semantic).

**Resolution**: Filtered the brand options to exclude `primary` and `white` from the Divider's dropdown; placed the three legacy values at the bottom of the list with `(legacy)` labels. The render path uses `isLegacyDividerColor` to route legacy values through the existing class-based theme overrides and brand values through inline `sx.borderColor`. Component-level default kept at `'primary'` to preserve the seven existing programmatic `<Divider />` usages; only the Studio `defaultValue` shifted to `'purplePrimary'`.

**Lesson**: Each component with a pre-existing color enum needs a per-component value-space mapping when integrating with the shared brand manifest. There's no one-size-fits-all "use BRAND_COLOR_OPTIONS everywhere".

### 7. The `(default)` label needed a per-component helper

After the per-component default colors landed (Black for body text components, Purple Primary for Link and SimpleList icons), the user wanted the Studio dropdown to surface "Black (default)" / "Purple Primary (default)" on the entry that matches each component's `defaultValue`. The universal `BRAND_COLOR_OPTIONS` couldn't carry the suffix because defaults vary per component.

**Resolution**: Added `brandColorOptionsWithDefault(defaultValue: BrandColor)` next to `BRAND_COLOR_OPTIONS`. Components that want the suffix call the helper with their default value; consumers that don't (or that have no `defaultValue`, like SimpleList's `textColor` before this round) continue to use the plain options array. Universal labels stay clean.

### 8. Post-merge: White preservation + Transparent escape hatch (commit c93723d9)

Two regressions surfaced once authors started exercising the new switch against pre-existing content:

- **Pre-CodeAI "White" text silently turned black on light Sections.** FR-010 ("White text on a light background renders as Black") was authored to repair _accidental_ white-on-white pairings produced by the new defaults. In practice it also rewrote deliberate White on legacy `Primary` / `Mid` Sections where authors had picked white on purpose. The flip read as a bug, not a guardrail.
- **Sections nested inside a Contentful-native Container (or layered over a background image) had no way to opt out of the switch.** The switch resolves against the immediate enclosing Section's `background` prop, which is `Transparent` in those layouts — but `Transparent` was a legacy section-background value that the value-space guard ignored, so descendants resolved against "no enclosing background" (treated as White) and flipped against the _actual_ visible background painted on the ancestor.

**Resolution**:

- Retired FR-010. White text is now passthrough on every background: `resolveTextColorForBackground` returns `{behavior: 'passthrough'}` for any token whose family is `white`, and the `'white-text-on-light-bg-becomes-black'` behavior was removed from the `ContrastSwitchBehavior` union.
- Introduced an `EnclosingBackground = BrandColor | 'transparent' | null` type. `SectionBackgroundProvider` now resolves `value === 'transparent'` to the `'transparent'` sentinel (alongside the existing brand-value branch and the `null` fallback). `resolveTextColorForBackground` short-circuits to passthrough when it sees the sentinel, so authors own text color verbatim inside a Transparent Section.
- Promoted `Transparent` out of the "(legacy)" group in the Section background dropdown, slotted directly under "White (default)". Renamed `Black` to `Default` in the text-color pickers and moved it to the top of the list (it's the only entry that participates in the switch); demoted `White` to the bottom of the brand block. New helper `brandTextColorOptions(defaultValue)` does this ordering; the four text-color components (Heading / Paragraph / Link / SimpleList.textColor) consume it instead of `brandColorOptionsWithDefault`.

**Lesson**: A contrast guardrail derived purely from new-design assumptions ("any White text on a light background must be a mistake") will misfire on pre-existing content, even when the rule looks safe in isolation. And when a switch resolves against an _enclosing_ ancestor, the layout primitives that can sit between text and its visible background (Transparent Sections, native Containers, background images) need an explicit escape hatch — they can't be left to fall through to "no enclosing background", which produces the wrong answer in both directions.

## Decisions revised after plan approval

- **Primary's underlying CSS var**: SCSS migration, not manifest swap (hurdle 4).
- **Legacy entry CSS variables**: full removal, not preserved (hurdle 5).
- **Per-component defaults**:
  - Paragraph default `color = 'black'` (component + Studio)
  - Heading default `color = 'black'` (component + Studio)
  - SimpleList `type` (icon) default `'purplePrimary'` (Studio only)
  - SimpleList `textColor` default `'black'` (Studio; was previously unset)
  - Text Link default `'purplePrimary'` (Studio only; component-level kept at `'primary'` so the existing special-case override path remains intact)
  - Divider Studio default `'purplePrimary'` (component-level kept at `'primary'` to preserve 7 existing programmatic usages)
- **Legacy `primary` BRAND_COLORS entry**: renamed in displayName to `"Primary (legacy)"` and moved to the bottom of the dropdown list. Value is unchanged for backward compat.
- **Universal color ordering**: BRAND_COLORS reordered to Black → White → families (Purple/Blue/Green/Orange/Pink × Dark/Primary/Mid/Light) → Primary (legacy). Affects every component's dropdown.
- **FR-010 retired post-merge (commit c93723d9)**: White text no longer flips to Black on light/mid backgrounds. White is always literal `#FFFFFF`; only Black (relabeled "Default" in text-color pickers) carries the contrast switch. See hurdle 8.
- **Transparent Section escape hatch (commit c93723d9)**: `EnclosingBackground = BrandColor | 'transparent' | null`. A Section with `background='transparent'` emits the sentinel through `SectionBackgroundProvider`; descendants render their authored color verbatim. Section background dropdown now lists Transparent directly under White (default), out of the legacy group.
- **Soft-isolation interpretation**: csforall sees the new options in Studio dropdowns and loads the new CSS variables, but the value-space guard ensures no `data-bg-tone` is emitted on csforall Sections; rendered csforall pages are unchanged. This is consistent with the soft-isolation decision in `research.md` §10 and was reaffirmed when the user picked "Keep migration via SCSS" — that decision moves the small `#292F36 → #000000` shift to `--text-neutral-primary`, which csforall also loads. Acceptable per the csforall-deprecation rationale.

## Open follow-ups (condensed from tasks.md)

Logged as future work; none block this commit.

1. **WCAG AA audit** of all 22-color × switch-pairing combinations (FR-023). Presumed compliant; not formally verified.
2. **Native Container cascade boundary** (tasks.md T025). Native Contentful Containers with a brand background do not yet re-establish a `SectionBackgroundProvider` for their children — resolution falls back to the outer Section's tone.
3. **Storybook coverage gaps**: explicit `ContrastSwitch` stories for Text Link (T018), SimpleList under a colored Section (T019), and Paragraph `colorOverride` (T030).
4. **Overline migration** to the shared `BRAND_COLOR_OPTIONS` manifest. Overline still uses its own inline `Primary`/`Secondary`/`White` list and does not participate in the contrast switch.
5. **Override coverage**: only Heading and Paragraph expose `colorOverride`. Text Link, SimpleList, and Section variants do not.
6. **Per-brand `BRAND_COLOR_OPTIONS` filter**: only needed if csforall deprecation slips and strict isolation becomes mandatory.
7. **Per-brand Section variant consolidation**: CS for All vs Corporate Site Section definitions remain separate per the brief's no-major-content-change constraint.

## What this doc covers vs `tasks.md`

- **`tasks.md`** is the task-by-task execution record: every Phase 1–6 item with completion status, what was actually done, and per-task footnotes. Use it to trace "did task TXXX happen, and what file did it touch?".
- **This doc** is the cross-cutting story: what we hit that the plan didn't anticipate, what we revised, and why. Use it to understand "why does the code look this way and not how the plan described?".

Reviewers should read `spec.md` (what we're building) → `plan.md` (how we said we'd build it) → this doc (what actually happened) → the diff. `tasks.md` is reference material for that order.
