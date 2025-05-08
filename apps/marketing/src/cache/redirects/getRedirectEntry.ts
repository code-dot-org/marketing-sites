import redirectCacheByBrandPromise from '@/cache/redirects/redirectCacheByBrand';
import {RedirectEntry} from '@/cache/redirects/types';
import {Brand} from '@/config/brand';

export async function getRedirectEntry(
  pathname: string,
  brand: Brand,
): Promise<RedirectEntry | undefined> {
  const redirectCacheByBrand = await redirectCacheByBrandPromise();

  const redirectCache = redirectCacheByBrand?.[brand];

  return redirectCache?.[pathname];
}
