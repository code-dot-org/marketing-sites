import redirectCacheByBrandPromise from '@/cache/redirects/redirectCacheByBrand';
import {RedirectEntry} from '@/cache/redirects/types';
import {Brand} from '@/config/brand';
import {splitLocaleFromPathname} from '@/config/locale';

/**
 * Fetches a redirect entry by pathname and brand from the redirect cache.
 * The redirect cache by brand is loaded asynchronously via the Nextjs internal data cache
 *
 * Matching is exact first, then falls back to the locale-stripped path. That
 * means a single entry authored as `/administrators` covers `/administrators`
 * and every localized variation of it, while an entry deliberately authored
 * with a locale prefix (`/en-US/about/annual-report`) still wins for that
 * exact path. Both lookups hit the same in-memory map, so the fallback costs
 * nothing.
 *
 * @param pathname - The pathname to look up in the redirect cache
 * @param brand - The brand to look up in the redirect cache
 */
export async function getRedirectEntry(
  pathname: string,
  brand: Brand,
): Promise<RedirectEntry | undefined> {
  const redirectCacheByBrand = await redirectCacheByBrandPromise();

  const redirectCache = redirectCacheByBrand?.[brand];

  if (!redirectCache) {
    return undefined;
  }

  const exactMatch = redirectCache[pathname];

  if (exactMatch) {
    return exactMatch;
  }

  const {pathnameWithoutLocale} = splitLocaleFromPathname(pathname);

  return pathnameWithoutLocale === pathname
    ? undefined
    : redirectCache[pathnameWithoutLocale];
}
