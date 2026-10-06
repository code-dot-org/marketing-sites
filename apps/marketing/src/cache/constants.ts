// Stale while revalidate, fresh for fifteen minutes, continue serving stale up to one year
// Additionally set stale-if-error to serve stale content if origin is unreachable
export const STALE_WHILE_REVALIDATE_FIFTEEN_MINUTES =
  's-maxage=900, stale-while-revalidate=31535100, stale-if-error=31535100';

// Stale while revalidate, fresh for an hour, continue serving stale up to one year
// Additionally set stale-if-error to serve stale content if origin is unreachable
export const STALE_WHILE_REVALIDATE_ONE_HOUR =
  's-maxage=3600, stale-while-revalidate=31535100, stale-if-error=31535100';

// Stale while revalidate, fresh for a day, continue serving stale up to one year
// Additionally set stale-if-error to serve stale content if origin is unreachable
export const STALE_WHILE_REVALIDATE_ONE_DAY =
  's-maxage=86400, stale-while-revalidate=31535100, stale-if-error=31535100';

// For responses that must never be shared through the CDN. CloudFront still
// holds them for the cache policy's MinTTL (1s) and, unless stale-if-error=0,
// may serve them past that while the origin is unreachable.
export const PRIVATE_NO_STORE = 'private, no-store, stale-if-error=0';

// The only query params in CloudFront's cache key (ApplicationCachingPolicy in
// cicd/3-app/template.yml.erb). Keep in sync: a cached response that varies on
// any other param is served to every visitor of the same path.
export const CDN_CACHE_KEY_QUERY_PARAMS = new Set([
  'utm_source',
  'utm_medium',
  'utm_campaign',
  'utm_term',
  'utm_content',
]);
