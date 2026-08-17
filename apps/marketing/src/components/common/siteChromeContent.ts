// Result type for the CMS-driven header/footer fetches.
export type SiteChromeContentResult<T> =
  | {status: 'ok'; content: T}
  // Contentful unavailable, no published entry, or a transient fetch error.
  | {status: 'unavailable'};
