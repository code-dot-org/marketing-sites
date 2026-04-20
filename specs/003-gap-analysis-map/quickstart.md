# Quickstart: Interactive Gap Analysis Map

## Goal

Verify the interactive gap analysis map works as a cache-friendly, theme-aware marketing component with correct state selection, locking, reset, and download behavior.

## Expected implementation shape

- A higher-level marketing component lives in [`apps/marketing`](/var/home/sliang/git-workspaces/marketing-sites/apps/marketing).
- Review fixtures live in [`apps/marketing-storybook`](/var/home/sliang/git-workspaces/marketing-sites/apps/marketing-storybook).
- The component reads from a structured in-repo dataset that matches [state-gap-data.schema.json](/var/home/sliang/git-workspaces/marketing-sites/specs/003-gap-analysis-map/contracts/state-gap-data.schema.json), including explicit unavailable-state metadata when metrics are incomplete.
- The US geography is rendered through a vetted npm React map package wrapped locally for theming, keyboard support, and ARIA labeling rather than through hand-maintained SVG path geometry.
- Interaction state should prefer React and MUI composition utilities, such as click-away helpers or an explicit React backdrop reset surface, over raw global event listeners when the same behavior is available.
- The component folder should follow existing marketing conventions: `StateGapMap.tsx` as the interactive entry point, `StateGapMapContentfulDefinition.ts` for registration metadata, `index.ts` for exports, and generic helper modules such as `data.ts`, `types.ts`, `utils.ts`, and `theme.ts`.
- The containing page remains server-rendered; only the map interaction surface hydrates on the client.

## Local verification

1. Start the marketing app with `yarn workspace @code-dot-org/marketing dev`.
2. Open the branded local page where the feature is integrated, using the repo's hostname pattern such as `http://code.marketing-sites.localhost:3001/...`.
3. Confirm the page loads normally with existing metadata and no preview/draft behavior leakage.
4. Hover several contiguous states and verify the panel updates with the expected state name, tier, access, participation, and gap.
5. Lock a state by click or keyboard activation and confirm the panel remains stable while the pointer moves away.
6. Use the close control and outside-click reset to confirm the selection clears correctly.
7. Verify each small East Coast state remains individually selectable.
8. Verify Alaska and Hawaii render in West Coast insets and are selectable.
9. Verify states with missing links hide unavailable actions.
10. Verify states with incomplete metrics render the neutral unavailable treatment in both the map legend and selected-state panel.
11. Verify the component is legible on transparent/light presentation and also within an inherited dark `data-theme` context if a story or page fixture provides one.

## Storybook verification

1. Start Storybook with `yarn workspace @code-dot-org/marketing-storybook storybook`.
2. Review stories that cover:
   - default state
   - hover preview
   - locked panel
   - missing-data fallback
   - neutral unavailable legend treatment
   - East Coast small-state targeting
   - Alaska/Hawaii inset layout
   - light/transparent and dark inherited theme presentation
3. Run Storybook tests with `yarn workspace @code-dot-org/marketing-storybook test:ui:ci`.

## Automated verification

1. Run focused marketing tests with `yarn workspace @code-dot-org/marketing test`.
2. Run linting for touched workspaces with `yarn workspace @code-dot-org/marketing lint` and `yarn workspace @code-dot-org/marketing-storybook lint` if story files change.
3. Run any added page-level UI coverage with `yarn workspace @code-dot-org/marketing test:ui:ci` only if the implementation adds or updates Playwright coverage for the integrated page.

## Release confidence checklist

- Public page cache behavior is unchanged.
- No new third-party runtime dependency or token requirement was introduced.
- The client boundary is isolated to the interactive map behavior.
- Theme inheritance works without forcing a dark-only container.
- Accessibility checks pass for keyboard and assistive technology access.
