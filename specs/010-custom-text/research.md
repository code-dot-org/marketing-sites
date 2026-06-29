# Phase 0 Research: Custom Text component

All findings below are inferred from application code unless explicitly marked as Contentful-MCP-confirmed. **No Contentful MCP server was connected during this planning session** (R8), so every Contentful-schema claim here is code-inferred and must be confirmed before implementation.

## R1 — Polymorphic HTML tag (the "as" prop question)

**Decision**: Render with MUI `<Typography component={tag} variant="inherit" .../>`. The `tag` is a string (`'span' | 'p' | 'div' | 'label' | ...`). Default `tag` is `'span'` for every type except **Subtitle**, whose type default is `'p'`. An `htmlTag` override field (with a `default` sentinel) replaces the per-type default, behaving like any other override.

**Rationale**: The codebase has **no `as` prop**. The established polymorphic pattern is MUI's `component` prop, used by `Heading.tsx` (`component={semanticTag}`) and `Overline.tsx` (`component="p"`). Using `component` keeps Custom Text consistent with Heading/Paragraph.

**Alternatives considered**: A custom `as` prop (rejected — not used anywhere in the repo); rendering raw DOM elements without Typography (rejected — loses MUI sx/theme integration that the rest of the text system relies on). Note: unlike Heading/Paragraph, Custom Text sets `variant="inherit"` (or omits variant) because its sizing is driven by token cells in `sx`, not by an `h*`/`body*` theme variant.

## R2 — Sizing via theme tokens (the "xs not px" requirement)

**Decision**: A type carries a `{track: 'text' | 'display', size: SizeToken}` pair. The resolver reads the matching cell from `SCALE_TEXT` or `SCALE_DISPLAY` (`tokens.ts`) and emits `fontSize` + `lineHeight` (+ `letterSpacing` when present) inline via `sx`. The `textSize` override field offers `default` + `xs…4xl`; when set it swaps the size token on the resolved track. The `font` override field offers `default` + `Text (Geist)` + `Display (Space Grotesk)`; when set it swaps the track (and thus the font stack).

**Rationale**: Mirrors `resolveHeadingStyles` (emits cell `fontSize/lineHeight/letterSpacing` from `SCALE_DISPLAY`). `SizeToken` is the canonical `xs|sm|md|lg|xl|2xl|3xl|4xl` scale — satisfies "font size set with xs rather than manual px." `SCALE_TEXT.md` is the locked body default (1rem/1.5rem).

**Alternatives considered**: Exposing a raw rem `fontSize` number like Heading's `Override · Font size (rem)` (rejected for the primary control — the spec explicitly wants theme steps, not px/rem entry; a rem escape hatch could be added later if design needs it but is out of scope).

## R3 — Font family override

**Decision**: Two font tracks only — **Text** = `CODE_ORG_TEXT_FONT_STACK` (Geist) and **Display** = `CODE_ORG_DISPLAY_FONT_STACK` (Space Grotesk), both from `themes/code.org/typography/fontStack.ts`. The `font` override emits `fontFamily` in `sx`.

**Rationale**: The code.org theme exposes exactly these two stacks (Geist for text roles, Space Grotesk for display roles), each already chained with the full Noto Sans i18n coverage. There is no third brand font. Expressing "font" as a track choice keeps authors on-theme with no free-text font entry.

**Alternatives considered**: Free-text font-family field (rejected — off-theme, breaks i18n chain, violates the theme-token constraint FR-005).

## R4 — Text color + contrast switching

**Decision**: When **no background color** is set, resolve text color with `resolvedCssVarForBrandColor(color, enclosingBackground)` where `enclosingBackground = useSectionBackground()`. When a **background color is set**, bypass the switch and use `cssVarForBrandColor(color)` directly.

**Rationale**: This is exactly `Icon.tsx`'s rule: `backgroundFill === 'none' ? resolvedCssVarForBrandColor(color, bg) : cssVarForBrandColor(color)`. Reusing `resolveTextColorForBackground` means zero new contrast code — it already encodes the full FR-007..FR-013 rule table (dark-text-on-dark→white, low-contrast shifts, white passthrough, transparent passthrough). Satisfies the spec's "contrast-switching unless the element has a background" with no extra logic.

**Alternatives considered**: A new contrast utility (rejected — duplicates a mature, tested function). A hex `colorOverride` like Heading's (optional; can be added as a secondary escape hatch but the primary control is the brand-token dropdown via `brandTextColorOptions`).

## R5 — Background + fixed 2px border

**Decision**: When `backgroundColor` is set, wrap the text run in a MUI `<Box>` with `backgroundColor: cssVarForBrandColor(backgroundColor)`, `border: 2px solid ${cssVarForBrandColor(borderColor)}` (fixed width, no override), plus chip padding and border-radius sourced from design (R7). When no background is set, no wrapper/border is rendered. `borderColor` defaults to the background color's family or a design-specified token when unset.

**Rationale**: Matches `Icon.tsx`'s backgrounded branch (`Box` with `border: \`${OUTLINE_WIDTH}px solid ${bg}\``), where the border width is a non-author-controlled local constant — directly analogous to the required fixed 2px. Brand color tokens map to CSS vars via `cssVarForBrandColor`.

**Alternatives considered**: Author-controlled border width (rejected — spec FR-008 fixes it at 2px with no control). CSS `outline` instead of `border` (rejected — border participates in box layout/padding the way a chip needs).

## R6 — Single leading/trailing icon, color inherited

**Decision**: Two fields, `iconNameLeft` and `iconNameRight` (Font Awesome v6 names, like the existing `Icon` component's `iconName`). Render at most one icon; **left takes precedence** if both are set. The text run is wrapped in an inline-flex element whose `color` is the resolved text color, and the icon (`FontAwesomeV6Icon`) is rendered with `color: 'inherit'` / `currentColor` so it always matches the text. No per-icon color/size fields (FR-009).

**Rationale**: Reuses the existing Font Awesome dependency and naming convention. Inheriting via `currentColor` is the cheapest way to satisfy "icons inherit the text color set in the default or element" with no extra color plumbing — and it automatically follows the contrast-switched color. The "left wins" precedence enforces "never both sides" deterministically (adjustable in tasks if design prefers a single position+name pair instead — see Open Question O1).

**Alternatives considered**: A single `iconName` + `iconPosition` (left/right) pair (cleaner; viable alternative — O1). Reusing the `Icon` component wholesale (rejected — it carries background-shape/fill machinery and only accepts `BrandColor`, not `currentColor`; for inline text we want pure glyph-follows-text-color).

## R7 — Per-type default style values (the one deferred item)

**Decision (draft, pending design/Figma + human confirmation)**: Each of the six types maps to a default style set. Proposed starting point, to be validated against design:

| Type          | tag   | track / size | weight   | transform | background              | notes                                                        |
| ------------- | ----- | ------------ | -------- | --------- | ----------------------- | ------------------------------------------------------------ |
| Custom        | span  | text / md    | regular  | none      | none                    | neutral baseline; everything overridable                     |
| Subtitle      | **p** | text / lg    | regular  | none      | none                    | only type defaulting to `<p>`                                |
| Overline      | span  | text / xs    | semibold | uppercase | none                    | reproduces existing `overline` role token (text/xs/semibold) |
| Statistic     | span  | display / lg | bold     | none      | none                    | large display number; exact size TBD from design             |
| Course Topics | span  | text / sm    | semibold | none      | brand fill + 2px border | chip/pill; fill + border + radius + padding from design      |
| Course Labs   | span  | text / sm    | semibold | none      | brand fill + 2px border | chip/pill; distinct fill from Course Topics                  |

**Rationale**: Anchors each type to existing role tokens where one exists (`overline`, body sizes) so the defaults are theme-consistent. The exact color tokens, the Statistic display size, and the chip fill/border/radius/padding for Course Topics / Course Labs come from the design source and are confirmed before or during implementation. This is the spec's single accepted open item (recorded as an assumption, not a blocker).

**Alternatives considered**: Hardcoding guessed pixel values (rejected — violates theme-token constraint and would diverge from Figma).

## R8 — Contentful registration & MCP status

**Decision**: Add a new `customText` component definition (`CustomTextContentfulDefinition.ts`) following the `HeadingContentfulComponentDefinition` shape (`id`, `name`, `category: '03: Content Building Blocks'`, `builtInStyles: ['cfTextAlign', 'cfMaxWidth']`, grouped `variables` with `validations.in` dropdowns and explicit defaults, color dropdowns built from `brandTextColorOptions(...)` / `brandColorOptionsWithDefault(...)`). Register it in `apps/marketing/src/contentful/registration/code.org/index.ts` (add import + a `{component, definition}` entry). The content `children` field follows the Heading pattern (`type: 'Text'`, `bindingSourceType: ['entry', 'manual']`).

**MCP status (honest limitation)**: The Contentful MCP server is **not connected in this session** — it does not appear among available tools. Per Constitution Principle V and FR-014/FR-016, the proposed content type is therefore **code-inferred only**. Before implementation: (1) connect Contentful MCP and confirm there is no existing `customText` type and that the field types/validations are valid; (2) present the exact fields/validations for a human to apply or approve in Contentful; (3) re-read the resulting state via MCP. No automated Contentful writes will be performed.

**Rationale**: The registration mechanics are fully determined from code (`code.org/index.ts`, `HeadingContentfulDefinition.ts`). Only the live Contentful schema confirmation is outstanding, and it is gated on a human + MCP per the constitution.

## R9 — Relationship to existing components (Overline, Lab/Curriculum snapshots)

**Decision**: Leave the existing `Overline` component and the `LabSnapshot` / `CurriculumSnapshot` components untouched. Custom Text's "Overline", "Course Topics", and "Course Labs" types provide lightweight text-element equivalents, not replacements for those richer components.

**Rationale**: Per the "match architecture to code lifespan" principle, this feature should not refactor or retire neighboring components. The overlap is at the visual-token level only (the new "Overline" type reuses the `overline` role token's values), which is captured as the single justified duplication in plan.md Complexity Tracking. Whether to later consolidate the standalone `Overline` into Custom Text is a separate decision.

## Open Questions (non-blocking; resolve during tasks/clarify)

- **O1 — Icon field shape**: two name fields (left/right, left-wins) vs. one `iconName` + `iconPosition` dropdown. Both satisfy "never both sides." Default plan: two name fields, left-wins. Confirm preferred authoring ergonomics.
- **O2 — Hex/rem escape hatches**: whether to also expose Heading-style `colorOverride` (hex) and raw `fontSize` (rem) as advanced overrides. Default plan: omit (theme tokens only per FR-005); add later only if design requires.
- **O3 — Chip geometry**: padding and border-radius defaults for the backgrounded types (Course Topics / Course Labs) — sourced from design (R7).
