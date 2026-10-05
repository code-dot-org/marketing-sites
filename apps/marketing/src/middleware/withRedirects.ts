import {NextFetchEvent, NextRequest} from 'next/server';

import {RedirectEntryResponse} from '@/cache/redirects/types';
import {getBrandFromHostname} from '@/config/brand';
import {getLocalhostAddress} from '@/config/host';
import {getBrandRedirects} from '@/middleware/redirects';
import {getQueryPreservingRedirectResponse} from '@/middleware/utils/getCachedRedirectResponse';

import {MiddlewareFactory} from './types';

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

    const redirectUrl = redirectEntry.destination.startsWith('/')
      ? `${request.nextUrl.origin}${redirectEntry.destination}`
      : redirectEntry.destination;

    // Destinations can be third-party, so only UTM params are carried over
    const response = getQueryPreservingRedirectResponse(redirectUrl, request, {
      status: redirectEntry.permanent ? 308 : 307,
      carryOver: 'cdn-cache-key',
    });

    const etagValue = redirectCacheByBrandResponse.headers.get('ETag');
    if (etagValue) {
      response.headers.set('ETag', etagValue);
    }

    return response;
  };
};
