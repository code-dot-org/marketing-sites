# Contentful Component Convention

## Purpose

This convention defines the required workflow for adding or changing
Contentful-backed marketing components. In Contentful's terminology, these are
custom components for Studio Experiences. The registration path is manual and
easy to partially complete, so this document exists to reduce regressions.

## How Studio Experiences Work

The official Contentful model matters here because this repo is not using a
generic CMS renderer. It is using Contentful Studio Experiences.

- An experience is an annotated Contentful content type with required fields
  such as `slug`, `componentTree`, `dataSource`, and `unboundValues`.
- The Studio editor renders the site inside an iframe using a Preview
  Configuration URL, so preview-host configuration and security headers are part
  of the authoring contract.
- Custom components are registered through the Experiences SDK with
  `defineComponents(...)`.
- Each registration pairs a React component with a component definition and any
  registration options.
- The component definition controls how the component appears in Studio,
  including identity, grouping, allowed children, variables, defaults, and
  built-in style controls.
- `ExperienceRoot` renders the experience tree using the fetched experience
  payload and the registered component map.
- Contentful wraps registered components in a container by default. If that
  wrapper is disabled, the component must support the required props used by the
  editor, including styling and canvas-node attributes.

## Repo-Specific Studio Experiences Flow

This repository implements Studio Experiences in a deliberately SSR-first way
with a narrow client bridge.

- `apps/marketing/src/app/[brand]/[locale]/[[...paths]]/page.tsx` is the
  server entry point for experience pages.
- `apps/marketing/src/contentful/get-experience.ts` fetches the experience by
  slug with `fetchBySlug(...)`, while skipping the fetch when the editor passes
  the experience in editor mode.
- The server page extracts Studio-generated styles with
  `detachExperienceStyles(...)`, serializes the experience, and preserves the
  server-rendered page shell.
- `apps/marketing/src/contentful/components/ExperiencePageLoader.tsx` is the
  required client boundary that calls `registerContentfulComponents(brand)` and
  mounts `ExperienceRoot`.
- `apps/marketing/src/contentful/registration/index.ts` delegates to
  brand-specific registration tables under
  `apps/marketing/src/contentful/registration/*`.
- `apps/marketing-storybook` provides the review surface for these components,
  often with mock payloads and in-memory entities instead of live CMS data.

## Contentful MCP As Source Of Truth

When available in an AI-assisted workflow, the Contentful MCP is the preferred
way to inspect actual content types, entries, assets, and editor-side schema.

For now, contributors should treat the Contentful MCP workflow as read-only by
default even if write-capable tooling is later scaffolded.

- Use Contentful MCP to confirm content type fields, requiredness,
  localization, validations, and reference constraints before treating a schema
  assumption as fact.
- Use Contentful MCP to inspect representative entries or assets when planning
  component work that depends on real editor data.
- Distinguish clearly between MCP-confirmed information and application-code
  inference in speckit research and planning artifacts.
- Do not use MCP as a reason to bypass privacy guardrails; avoid inspecting or
  copying unnecessary personal data and prefer schema inspection over content
  browsing when that is sufficient.
- If a schema or content write is needed, show the exact proposed changes to a
  human first, wait for confirmation or manual application, then re-read the
  final Contentful state through MCP instead of assuming the change landed as
  intended.

## Data Modeling Rules

- Where practical, new structured marketing data SHOULD be modeled in
  Contentful rather than ad hoc application-only structures.
- When feature work introduces new or changed structured data, perform a
  Contentful data-model review during planning even if the conclusion is that no
  Contentful change is needed.
- Prefer extending an existing content type before creating a new one.
- If a new content type is proposed, document why an existing type cannot be
  reused or extended without making authoring or validation meaningfully worse.
- Optimize models for human-friendly editorial storage while minimizing the
  total number of content types in the space.
- Maintain a strong preference for reuse and consolidation because content type
  count is limited.

## Studio Guardrails

- Keep the overall page SSR-first even though Studio requires a client boundary
  for `ExperienceRoot` and component registration.
- Do not move page fetching or page-level composition into client boot code.
- Treat preview URL setup, iframe embedding, and Content Security Policy as part
  of the feature contract, not incidental environment details.
- Keep component definitions editor-safe: explicit variables, stable names, safe
  defaults, and predictable groups.
- Prefer the default Contentful wrapper unless there is a concrete reason to
  disable it. If the wrapper is disabled, support the required experience props.
- Do not place real student, teacher, parent, donor, or support-request
  personal data in Contentful content, preview content, or Storybook demo data.

## Layering Rules

- `apps/design-system-storybook` is for atomic and molecular design-system
  components.
- `apps/marketing-storybook` is for higher-level marketing components composed
  from design-system components and Contentful payloads.
- All new React components MUST use MUI.
- Marketing components SHOULD be built directly with MUI rather than the
  deprecated legacy design-system components whenever practical.
- Legacy design-system components may still be used when an equivalent
  component has not yet been migrated to MUI.
- If a touched legacy component can be replaced with a MUI equivalent through a
  limited, low-risk migration that does not force broader downstream changes,
  prefer making that migration in the same work.
- MUI replacements for migrated components SHOULD preserve the current visual
  appearance 1:1 unless the spec explicitly calls for a design change.
- If a design-system change is required, land that work first and ensure the
  design-system Storybook CI checks pass before building on it in marketing.

## Required Workflow

### 1. Decide the layer

- If the component is reusable UI infrastructure, build it in
  `packages/component-library`.
- If the component is a marketing-specific composition or Contentful building
  block, build it in `apps/marketing/src/components/contentful/...`.
- If the feature introduces new or changed structured data, first review
  whether the data should live in Contentful and whether an existing content
  type can be reused or extended.
- If the change depends on Contentful schema details, confirm the target
  content type or entry shape through MCP before implementation.
- If the change proposes schema updates, prepare a human-readable change list
  for the content type rather than silently mutating it.

### 2. Implement the component

- Add the React component in the correct marketing contentful directory.
- Use MUI and shared design-system components instead of introducing new local
  primitives.
- Prefer direct MUI-based marketing implementations over wrapping deprecated
  design-system components for new work.
- If a touched legacy design-system dependency can be swapped to a contained
  MUI equivalent without broad fallout, prefer doing so during the change.
- Include accessibility behavior that meets or exceeds WCAG AA.
- Keep the component compatible with Studio rendering expectations.
- If registration will disable the default wrapper, ensure the component
  forwards the editor props needed for styling and canvas interactions.

### 3. Add the Contentful definition

- Create or update the matching `*ContentfulDefinition.ts` file.
- Keep authoring controls explicit and editor-safe.
- Document defaults and fallback behavior in code where the component is
  otherwise hard to understand.
- Use stable component ids and names.
- Define variables, defaults, groups, and built-in style controls deliberately
  so authoring stays constrained and predictable.

### 4. Register it by brand

- Update the appropriate brand registration file under
  `apps/marketing/src/contentful/registration/`.
- Confirm whether the component belongs to one brand or multiple brands.
- If registration differs by brand, make the divergence explicit and documented.
- Register the component through the brand table consumed by
  `registerContentfulComponents(...)`.
- Include any registration options intentionally, such as wrapper width or
  wrapper behavior.
- If the component binds to existing entry types, confirm the relevant field
  names and constraints through MCP before wiring the component.
- If new or changed fields are required, present the field ids, names, types,
  validations, localization settings, and requiredness for human confirmation,
  then re-read the content type after the change.
- If a new content type is proposed, document the reuse options that were
  considered first and why the new type is still the clearest editor model.

### 5. Preserve editor compatibility

- Confirm the experience still renders correctly in the Studio iframe preview.
- If preview or editor rendering breaks, review preview URL configuration,
  hostname handling, and CSP/security headers before treating the component as
  done.

### 6. Add review surfaces

- Add or update stories in `apps/marketing-storybook`.
- Add or update mock payloads in `stories/__mocks__` or in-memory entities when
  needed.
- Ensure the marketing Storybook can review the change without production CMS
  state.
- Use synthetic or redacted data only in CMS examples, Storybook fixtures, and
  screenshots.

### 7. Add tests

- Add focused Jest coverage where logic, fallback behavior, or transformations
  are non-trivial.
- Add or update Storybook-based checks through the relevant CI path.
- Add Playwright coverage only if the component changes a true runtime contract
  or a cross-system flow.

### 8. Evaluate “All The Things”

- If the component is a user-visible page-building block that should be covered
  in the integrated CMS test surface, update the “All The Things” workflow and
  tests.
- Treat “All The Things” as a lightweight smoke test for the integration
  between Contentful Studio Experiences and the marketing app, not as the
  primary validation surface for component behavior.
- Keep detailed component behavior covered in Storybook and focused tests; use
  “All The Things” to confirm the Contentful-to-app wiring still works end to
  end.
- Do not add everything by default; use judgment.

## Completion Checklist

A Contentful-backed component change is not done until all applicable items are
complete:

- component implementation
- Contentful definition
- brand registration
- MCP-confirmed content model assumptions when schema detail matters
- data-model review for any new or changed structured feature data
- human-confirmed or human-applied Contentful write steps when schema/content
  changes are required
- Storybook review surface
- mock data or in-memory entities
- required tests
- cache or revalidation review if the data flow changed
- preview/editor compatibility review if Studio rendering behavior changed

## Guardrails

- Do not merge a Contentful component that only works in code and not in
  registration.
- Do not bypass the design system when a reusable primitive is the right layer.
- Do not add a marketing component that cannot be reviewed in marketing
  Storybook.
- Do not add new accessibility debt; all React components must meet or exceed
  WCAG AA.
- Do not assume Studio preview failures are "just Contentful." Broken iframe
  embedding, bad preview URLs, or missing registration are shipping blockers for
  authoring.
- Do not silently mutate Contentful content types, entries, or assets from an
  AI-assisted workflow. Recommend, confirm, then re-read.
- Do not create a new content type for implementation convenience alone when an
  existing type can be extended without harming editor clarity.
- Do not keep a touched marketing component on the deprecated design system by
  default when a low-risk, visually equivalent MUI migration is already within
  scope.

## Official References

- [Set up Experiences SDK with Next.js](https://www.contentful.com/developers/docs/experiences/set-up-experiences-sdk-with-nextjs/)
- [Register custom components](https://www.contentful.com/developers/docs/experiences/register-custom-components/)
- [Component definition schema](https://www.contentful.com/developers/docs/experiences/component-definition-schema/)
- [Custom components](https://www.contentful.com/developers/docs/experiences/custom-components/)
- [Component wrapper](https://www.contentful.com/developers/docs/experiences/component-wrapper/)
- [Data structures](https://www.contentful.com/developers/docs/experiences/data-structures/)
- [Troubleshooting](https://www.contentful.com/developers/docs/experiences/troubleshooting/)
- [Configure Experiences](https://www.contentful.com/help/studio/experiences/configure-experiences/)
