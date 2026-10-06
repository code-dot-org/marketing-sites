import {NextRequest, NextResponse} from 'next/server';

import {
  CDN_CACHE_KEY_QUERY_PARAMS,
  PRIVATE_NO_STORE,
  STALE_WHILE_REVALIDATE_ONE_HOUR,
} from '@/cache/constants';

/**
 * Sets the Cache-Control header on a redirect response to cache the redirect on the CDN.
 * Only for redirects whose destination doesn't depend on the request's query string;
 * use getQueryPreservingRedirectResponse otherwise.
 * @param url The URL to redirect to.
 * @param init Optional ResponseInit to customize the response.
 */
export function getCachedRedirectResponse(
  url: string | URL,
  init?: ResponseInit,
): NextResponse {
  const response = NextResponse.redirect(url, init);

  // Cache the redirect on Cloudfront
  response.headers.set('Cache-Control', STALE_WHILE_REVALIDATE_ONE_HOUR);

  return response;
}

/**
 * Which request query params a redirect carries over:
 * - `all`: every param. Only for first-party destinations.
 * - `cdn-cache-key`: only the params in the CDN cache key (UTM), which keeps
 *   the redirect cacheable and avoids passing arbitrary params to third parties.
 */
type QueryCarryOver = 'all' | 'cdn-cache-key';

// Raw `key=value` pairs, as received; re-encoding them could change their meaning.
function getRawQueryPairs(search: string) {
  return search.replace(/^\?/, '').split('&').filter(Boolean);
}

function getRawKey(pair: string) {
  return pair.split('=', 1)[0];
}

function decodeKey(rawKey: string) {
  try {
    return decodeURIComponent(rawKey.replace(/\+/g, ' '));
  } catch {
    return rawKey;
  }
}

// Matches raw names exactly: an encoded variant such as `utm%5Fsource` might
// not be in CloudFront's cache key, so it's treated as uncacheable.
function isInCdnCacheKey(pair: string) {
  return CDN_CACHE_KEY_QUERY_PARAMS.has(getRawKey(pair));
}

/**
 * Redirects to `url`, carrying over the request's query params as received.
 * Params already on `url` take precedence.
 *
 * The redirect is only cached on the CDN when every carried param is in the
 * CDN cache key; otherwise the cached redirect (params included) would be
 * served to every visitor of the same path.
 * @param url The absolute URL to redirect to.
 * @param request The incoming request whose query params are carried over.
 * @param init Optional ResponseInit, plus:
 *   - `carryOver`: which params to carry over (default `all`).
 *   - `neverCache`: for destinations that need the request's params. A cached
 *     param-less redirect would otherwise be served to requests that have them.
 */
export function getQueryPreservingRedirectResponse(
  url: string | URL,
  request: NextRequest,
  {
    carryOver = 'all',
    neverCache = false,
    ...init
  }: ResponseInit & {carryOver?: QueryCarryOver; neverCache?: boolean} = {},
): NextResponse {
  const redirectUrl = new URL(url);
  const destinationKeys = new Set(redirectUrl.searchParams.keys());

  const carriedPairs = getRawQueryPairs(request.nextUrl.search ?? '').filter(
    pair =>
      (carryOver === 'all' || isInCdnCacheKey(pair)) &&
      !destinationKeys.has(decodeKey(getRawKey(pair))),
  );

  if (carriedPairs.length > 0) {
    redirectUrl.search = [
      ...getRawQueryPairs(redirectUrl.search),
      ...carriedPairs,
    ].join('&');
  }

  const response = NextResponse.redirect(redirectUrl, init);

  response.headers.set(
    'Cache-Control',
    !neverCache && carriedPairs.every(isInCdnCacheKey)
      ? STALE_WHILE_REVALIDATE_ONE_HOUR
      : PRIVATE_NO_STORE,
  );

  return response;
}
