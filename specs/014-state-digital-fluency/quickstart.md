# Quickstart: State of Digital Fluency report pages

## Pages, locally

The app reads only the Contentful `reportData` entry; the synthetic fixture is for tests and Storybook. With `apps/marketing/.env` pointed at the Code.org space:

```bash
cd apps/marketing
yarn dev
```

- Preview view, which shows the draft entry and its warnings: `http://preview-code.marketing-sites.localhost:3001/en-US/state-of-digital-fluency` (the first visit can 404 while the draft cookie is set; reload)
- Public view: `http://code.marketing-sites.localhost:3001/en-US/state-of-digital-fluency`. It returns 404 until the entry is published. That's the launch gate.
- The other pages use the same base path: `/al`, `/al/report`, `/report` and `/methodology`.

## Pages on real data

The spec 013 pipeline writes the draft. Run it with its workflow (`digital-fluency-data-pipeline.yml`) or the sheet menu once the relay exists. Then open the preview host above. Public pages show the data only after "Publish to Production".

## Components

```bash
yarn workspace @code-dot-org/marketing-storybook storybook
yarn workspace @code-dot-org/marketing-storybook test:ui:ci
```

## Regenerating the map paths (rarely)

```bash
cd apps/marketing && yarn tsx scripts/generateUsStatePaths.ts
```

## Validation before merge

```bash
yarn lint:fix && yarn lint && yarn test
yarn workspace @code-dot-org/marketing-storybook test:ui:ci
yarn release:dryrun
```
