import {NextFetchEvent, NextRequest} from 'next/server';

import {isIndexableHost} from '@/config/indexing';

import {MiddlewareFactory} from './types';

/**
 * Sends `X-Robots-Tag: noindex, nofollow` on every non-production host.
 *
 * The page-level Contentful SEO flags render `<meta name="robots">` into the
 * HTML, which is cached per path and shared by every hostname of a brand (the
 * `withBrand` rewrite puts the brand, not the host, in the path). So the meta
 * tag cannot vary by host — this header, set per request, can.
 */
export const withRobotsTag: MiddlewareFactory = next => {
  return async (request: NextRequest, event: NextFetchEvent) => {
    const response = await next(request, event);

    if (!isIndexableHost(request.headers.get('host'))) {
      response.headers.set('X-Robots-Tag', 'noindex, nofollow');
    }

    return response;
  };
};
