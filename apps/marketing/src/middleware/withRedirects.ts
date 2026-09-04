import {NextFetchEvent, NextRequest, NextResponse} from 'next/server';

import {STALE_WHILE_REVALIDATE_ONE_HOUR} from '@/cache/constants';
import {RedirectEntry, RedirectEntryResponse} from '@/cache/redirects/types';
import {getBrandFromHostname} from '@/config/brand';
import {getLocalhostAddress} from '@/config/host';
import {splitLocaleFromPathname} from '@/config/locale';
import {getBrandRedirects} from '@/middleware/redirects';

import {MiddlewareFactory} from './types';

// A destination that names a file — `/static/js/jquery.min.js`, `/images/x.png`
// — is an asset, not a page, and has no localized variant to send anyone to.
const FILE_DESTINATION = /\.[a-z0-9]{2,5}(?:\?|$)/i;

/**
 * Resolves a Contentful redirect destination to the URL we actually send.
 *
 * When a request like `/es/administrators` matches an entry authored as
 * `/administrators`, we re-apply the requested locale to the destination so the
 * visitor stays in the language they asked for and gets there in one hop,
 * rather than being handed to the locale negotiation in `withLocale`.
 *
 * An entry whose source matches the request path exactly was authored
 * deliberately for that path, so its destination is used verbatim. Asset
 * redirects are left alone too: most point at an absolute URL already, and a
 * relative one names a file that has no per-locale copy.
 */
function resolveDestination(
  redirectEntry: RedirectEntry,
  pathname: string,
  origin: string,
) {
  const {destination} = redirectEntry;

  // An absolute or external destination is used exactly as authored.
  if (!destination.startsWith('/')) {
    return destination;
  }

  const {locale} = splitLocaleFromPathname(pathname);
  const matchedExactly = redirectEntry.source === pathname;
  // Don't double-prefix if the author already put a locale in the destination.
  const {locale: destinationLocale} = splitLocaleFromPathname(destination);

  const shouldLocalize =
    Boolean(locale) &&
    !matchedExactly &&
    !destinationLocale &&
    !FILE_DESTINATION.test(destination);

  return `${origin}${shouldLocalize ? `/${locale}${destination}` : destination}`;
}

/**
 * This middleware reads Contentful redirects from the redirect config API endpoint and forwards requests as directed in Contentful.
 *
 * See: 'Redirect' content type in Contentful
 */
export const withRedirects: MiddlewareFactory = next => {
  return async (request: NextRequest, event: NextFetchEvent) => {
    const {pathname} = request.nextUrl;

    const hostname = request.headers.get('host');
    const brand = getBrandFromHostname(hostname);

    const redirectConfigUrl = new URL(
      `${getLocalhostAddress()}/api/private/redirects/${encodeURIComponent(brand)}/${encodeURIComponent(pathname)}`,
    );

    const redirectCacheByBrandResponse = await fetch(redirectConfigUrl, {
      method: 'GET',
    });

    const redirectEntryResponse: RedirectEntryResponse =
      await redirectCacheByBrandResponse.json();

    if (!redirectEntryResponse.redirectEntry) {
      const brandRedirects = getBrandRedirects(brand, request);

      if (brandRedirects) {
        return brandRedirects;
      }

      return next(request, event);
    }

    const redirectEntry = redirectEntryResponse.redirectEntry;

    const redirectUrl = resolveDestination(
      redirectEntry,
      pathname,
      request.nextUrl.origin,
    );

    if (redirectEntry) {
      const responseHeaders: HeadersInit = {
        'Cache-Control': STALE_WHILE_REVALIDATE_ONE_HOUR,
      };

      const etagValue = redirectCacheByBrandResponse.headers.get('ETag');
      if (etagValue) {
        responseHeaders['ETag'] = etagValue;
      }

      return NextResponse.redirect(redirectUrl, {
        status: redirectEntry.permanent ? 308 : 307,
        headers: responseHeaders,
      });
    }

    return next(request, event);
  };
};
