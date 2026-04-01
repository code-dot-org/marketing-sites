# SEO Convention

## Purpose

This repository serves public marketing pages where SEO is part of the product
surface, not a post-launch cleanup item. This convention defines the default
expectations for metadata, indexing, structured data, and sitemap behavior in
`apps/marketing`.

## Current Repo Model

The marketing app already has an established SEO implementation:

- public Experience pages generate metadata server-side from Contentful-backed
  SEO fields
- `robots.txt` is runtime-aware and blocks crawling outside production or on
  disallowed hosts
- `sitemap.xml` is generated at runtime from Contentful Experience entries and
  excludes pages marked `noindex`
- locale alternates are currently emitted in the sitemap
- structured data already exists for organization, FAQ, and video surfaces

Contributors should preserve this model unless a spec documents an intentional
exception.

## Core Rules

- SEO metadata MUST be generated on the server.
- Public marketing pages SHOULD have explicit page-level SEO metadata rather
  than relying on generic root defaults.
- Canonical URLs, indexing behavior, and sitemap behavior are runtime contracts.
- `noindex` and `nofollow` decisions MUST stay consistent across page metadata
  and sitemap inclusion.
- Preview, draft, error, and non-canonical host flows MUST not leak into
  publicly indexable SEO surfaces.
- Structured data SHOULD be added only when the page actually matches the
  schema and the repo can keep the markup accurate over time.

## Metadata Rules

- Every public, indexable page SHOULD define:
  - title
  - description
  - canonical URL
  - Open Graph title, description, and image as applicable
- Titles SHOULD be specific, concise, and page-unique.
- Descriptions SHOULD describe the actual page content and user value.
- Canonical URLs SHOULD be absolute and SHOULD match the preferred public URL.
- Do not expose multiple conflicting canonical signals for the same page.
- If a page is intentionally not indexable, make that explicit through page
  metadata rather than relying on sitemap omission alone.

## Contentful Experience Rules

- For Contentful Experience pages, prefer using the existing SEO metadata path
  rather than inventing page-local metadata logic.
- If a Contentful Experience page is intended to be public and indexable,
  ensure its Contentful SEO metadata is populated or that the feature defines an
  acceptable fallback.
- If a Contentful Experience page is marked `noindex`, it SHOULD also be
  excluded from sitemap output through the existing sitemap behavior.
- If a feature changes the SEO field shape or editorial workflow, review the
  affected content model, metadata generation, and test surfaces together.

## Sitemap Rules

- For Contentful Experience pages, sitemap inclusion already works through the
  existing runtime sitemap route as long as the page is a Contentful Experience
  entry with a slug and is not marked `noindex`.
- Do not add bespoke sitemap wiring for standard Contentful Experience pages
  unless the existing route cannot represent the page correctly.
- Non-Experience routes, custom programmatic pages, or pages outside the
  default Experience query MUST explicitly review whether sitemap entries need
  to be added.
- Locale-aware pages SHOULD preserve alternate locale links when included in
  the sitemap.

## Robots And Indexing Rules

- `robots.txt` behavior MUST stay aligned with environment and hostname rules.
- Do not allow preview, draft, staging, or disallowed hostnames to become
  crawlable through SEO changes.
- Do not use `robots.txt` as a substitute for canonicalization logic.

## Structured Data Rules

- Structured data SHOULD follow Google-supported schema types and general
  structured-data guidelines.
- Structured data MUST match visible page content and other metadata.
- Add schema only when the page type genuinely qualifies, such as:
  - organization
  - FAQ
  - video
  - other Google-supported rich-result types with a clear product need
- If structured data is added, include the smallest meaningful test or review
  coverage for it.

## Review Checklist

Before merge, confirm:

- page-level metadata is present or intentionally omitted with a reason
- canonical behavior matches the preferred public URL
- `noindex` behavior matches sitemap behavior
- preview and draft remain non-indexable
- sitemap impact was reviewed
- structured data remains accurate if present
- SEO behavior is covered by the right test or review surface

## References

- [Google Search Central: Title links](https://developers.google.com/search/docs/advanced/appearance/good-titles-snippets)
- [Google Search Central: Canonical URLs](https://developers.google.com/search/docs/crawling-indexing/consolidate-duplicate-urls)
- [Google Search Central: Localized versions of pages](https://developers.google.com/search/docs/specialty/international/localized-versions)
- [Google Search Central: Structured data search gallery](https://developers.google.com/search/docs/appearance/structured-data/search-gallery)
- [Google Search Central: General structured data guidelines](https://developers.google.com/search/docs/appearance/structured-data/sd-policies)
- [Google Search Central: Video SEO best practices](https://developers.google.com/search/docs/advanced/guidelines/video)
