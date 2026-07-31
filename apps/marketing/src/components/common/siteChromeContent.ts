// LEGACY-ENV-COMPAT: result type for the CMS-driven header/footer fetches.
// The 'legacy-environment' arm exists only for the launch transition window,
// when the production Contentful environment doesn't have the siteHeader /
// siteFooter content types yet. Remove that arm (or collapse the union back
// to `content | null`) when the production environment serves the new model.
export type SiteChromeContentResult<T> =
  | {status: 'ok'; content: T}
  // Contentful unavailable, no published entry, or a transient fetch error.
  | {status: 'unavailable'}
  // The content type doesn't exist in this environment (old production env).
  | {status: 'legacy-environment'};
