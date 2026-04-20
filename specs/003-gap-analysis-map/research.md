# Research: Interactive Gap Analysis Map

## Decision 1: Use a vetted React US map package plus structured local data instead of a runtime basemap dependency or a hand-maintained SVG path map

- **Decision**: Model the map with a maintained npm React US map package backed by a structured local dataset rather than a Mapbox-powered basemap, a runtime-fetched dashboard dependency, or a hand-maintained in-repo SVG path map.
- **Rationale**: The feature is a thematic, non-pannable United States visualization with fixed geographies, categorical fills, and a small set of interactions. A vetted React map package keeps the public page cache-friendly, avoids introducing tokenized third-party dependency risk to a hot public route, and reduces maintenance burden compared with carrying raw SVG geometry in the repo. It also provides established inset handling for Alaska/Hawaii and small-state geometry that can be augmented locally for accessibility and interaction semantics.
- **Alternatives considered**:
  - Reuse `react-map-gl` / Mapbox from the existing adoption map: rejected because the feature does not need geospatial panning, zooming, vector tiles, or runtime token dependence.
  - Maintain a bespoke SVG path map in-repo: rejected because it adds geometry maintenance cost and makes future changes harder than using a package that already solves the base rendering.
  - Embed or proxy the existing external dashboard: rejected because it does not match the desired interaction model and would reduce control over availability, accessibility, and theming.

## Decision 2: Keep the page server-rendered and isolate the interaction to a small client island

- **Decision**: Render the containing page and section composition on the server, with a narrow client boundary responsible only for state hover, lock, reset, keyboard/touch interaction, and panel updates.
- **Rationale**: This matches the repository's SSR-first rule, preserves cacheability, minimizes hydration cost, and limits risk to a contained interaction surface instead of pushing more of the page into client boot code.
- **Alternatives considered**:
  - Make the whole section a broad client component: rejected because it increases hydration scope without product benefit.
  - Fetch state data client-side after render: rejected because the data is static enough to ship with the page and client fetching would add latency and failure modes.

## Decision 3: Use a repo-managed data contract for v1 and defer Contentful authoring

- **Decision**: Store state metric records in a repo-managed structured file for the initial release and keep the component contract intentionally compatible with future JSON or CMS sourcing.
- **Rationale**: The product requirement prioritizes maintainable data separation, not immediate editorial tooling. This avoids speculative Contentful modeling before the interaction is proven, while still preserving a migration path.
- **Alternatives considered**:
  - Add Contentful-managed state records now: rejected because no relevant content model has been confirmed through Contentful MCP and the feature can ship without CMS dependence.
  - Hardcode state values directly in the component: rejected because it violates the spec's maintainability goal.

## Decision 4: Build the feature as a higher-level marketing component with MUI composition

- **Decision**: Place the implementation in `apps/marketing` as a higher-level marketing component composed with MUI, and add review fixtures to `apps/marketing-storybook`.
- **Rationale**: This feature combines stateful interaction, data display, theming inheritance, and page-level composition, which fits the marketing layer better than the atomic shared design system. MUI is the required component base for new React work in this repo.
- **Alternatives considered**:
  - Create new shared package primitives first: rejected because the feature is not yet proven reusable beyond this surface.
  - Reuse or expand deprecated legacy design-system components: rejected because the repo guidance prefers direct MUI for new marketing-facing work.

## Decision 5: Make small-state targeting and Alaska/Hawaii placement part of the map contract, not an implementation afterthought

- **Decision**: Treat East Coast small-state visibility/selectability and Alaska/Hawaii West Coast inset placement as explicit design constraints in the geometry and interaction model.
- **Rationale**: These are product requirements that directly affect usability. Planning them up front prevents a contiguous-US-only rendering from becoming inaccessible or visually incomplete.
- **Alternatives considered**:
  - Use a standard contiguous map without special treatment: rejected because several states would be too difficult to perceive or select.
  - Solve small states with a separate fallback dropdown: rejected because it weakens the map as the primary exploration surface.

## Decision 6: Theme from the surrounding experience rather than forcing a dark skin

- **Decision**: The component should render on transparent or light backgrounds by default and inherit the containing experience's `data-theme` when present, while preserving accessible contrast in both light and dark modes.
- **Rationale**: This matches the updated product direction and reduces integration friction across branded marketing experiences.
- **Alternatives considered**:
  - Ship a dark-only map: rejected by product direction and less flexible for reuse.
  - Add a standalone theme switch inside the component: rejected because the containing page already owns theme choice.

## Decision 7: Validate primarily with unit tests plus marketing Storybook, reserving Playwright for integration confidence

- **Decision**: Use focused Jest and Testing Library coverage for interaction logic, `apps/marketing-storybook` for reviewable fixtures, and optional focused Playwright only if the integrated page needs end-to-end protection.
- **Rationale**: Most risk sits in interaction state transitions and visual review rather than infrastructure or backend integration.
- **Alternatives considered**:
  - Rely only on manual visual review: rejected because locking/resetting/fallback behavior is easy to regress.
  - Default to heavy end-to-end coverage for all behavior: rejected because it would be slower and less targeted than component-level tests for this feature.
