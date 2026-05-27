# UI Convention

Use this document for React/UI implementation guidance that is more specific
than the top-level constitution and `AGENTS.md`.

## Scope

This convention applies to interactive React components in `apps/marketing`,
`apps/marketing-storybook`, and related shared UI surfaces in this repository.

## Component Structure

- Match existing feature-component structure in
  `apps/marketing/src/components/contentful/corporateSite/*`: one
  feature-named top-level component file, one feature-named Contentful
  definition file, `index.ts` for exports, and generic helper filenames such as
  `types.ts`, `constants.ts`, `utils.ts`, and `theme.ts`.
- Prefer one behavior test file per tested component, following the existing
  `ComponentName.test.tsx` pattern.
- Keep a parent component's integration tests in its own test file, and give
  directly tested subcomponents their own matching test files such as
  `StateGapMapPanel.test.tsx` or `StateGapMapRenderer.test.tsx`.
- Use separate files for distinct subcomponents or non-component contracts such
  as data-shape validation, but avoid splitting a single component's behavior
  across multiple feature-grouped test files.
- Keep the `use client` boundary on the smallest top-level feature component
  that actually needs browser interaction; avoid splitting conventionally
  simple components into extra `.client.tsx` wrappers unless the repo already
  does so for that feature.
- Prefer local React event props and MUI composition over imperative DOM
  listener registration. If a third-party package forces DOM annotation or
  listener fallback for accessibility, keep that wrapper narrowly scoped and
  document the reason in feature docs or review notes.

## Interaction Utilities

- Prefer React- and MUI-level interaction utilities over raw `document` or
  `window` event listeners when the same behavior can be expressed without
  imperative global listeners.
- For outside-click or focus-dismiss behavior, prefer MUI or React composition
  such as `ClickAwayListener` or an explicit React backdrop/reset surface
  before adding manual global listeners.
- If raw global listeners are still required after evaluating existing
  utilities, call that out explicitly in the spec or review notes and treat it
  as a human-review point rather than a default implementation choice.

## Theme Inheritance

- Components that honor `data-theme` or similar inherited presentation context
  must derive text, surface, divider, border, and icon colors from that
  inherited mode rather than assuming the surrounding MUI provider already
  matches it.
- If a component supports both light and dark inherited presentation, Storybook
  review should verify computed styles or another direct rendering signal, not
  only visual inspection.
- CTA icons, end icons, and helper icons should explicitly inherit color when
  button or typography defaults do not guarantee it.

## Interactive Layout Stability

- Interactive components must not introduce width or height shifts between
  default, hover, focus, selected, and locked states.
- Stacked mobile layouts need explicit review for layout stability, especially
  when content below a primary interactive surface changes on hover or tap.
- Prefer stable layout footprints, shared action regions, or hidden layout
  stabilizers over arbitrary fixed heights when preventing state-driven content
  shift.
- If a workaround is introduced while debugging layout instability, remove the
  speculative workaround once the actual cause is confirmed.

## Storybook Coverage

- Each named canonical story state should include a `play` function that
  verifies the scenario it documents.
- Story coverage should validate both content correctness and state behavior,
  not only that the component renders.
- Theme inheritance stories should verify that the text and controls match the
  intended inherited mode.
- If a story represents a default, hover, locked, reset, or error state, the
  play function should assert the defining characteristic of that state.
