import {draftMode} from 'next/headers';
import {NextFetchEvent, NextRequest, NextResponse} from 'next/server';

import {getBrandFromHostname} from '@/config/brand';
import {PREVIEW_HOSTNAMES} from '@/config/preview';

import {MiddlewareFactory} from './types';

/**
 * This middleware detects the brand via the hostname of the request and injects it into the top level [brand]
 * param to enable multi-tenancy in this application.
 *
 * See: https://github.com/vercel/platforms
 *
 * This effectively routes requests as such:
 *
 * localhost.code.org:3001/en-US/home -> /localhost.code.org:3001/en-US/home
 */
export const withBrand: MiddlewareFactory = next => {
  return async (request: NextRequest, event: NextFetchEvent) => {
    const {pathname} = request.nextUrl;

    // Do not add brand for static asset directories in development
    // /assets does not exist in production, it is only used by Next.js dev server
    // Those assets are served via /_next/static/
    if (
      process.env.NODE_ENV === 'development' &&
      pathname.startsWith('/assets')
    ) {
      return await next(request, event);
    }

    // Get hostname of request (e.g. test.code.org, code.org, localhost.code.org:3001)
    const hostname = request.headers.get('host');
    const brand = getBrandFromHostname(hostname);
    const isPreviewHostname = PREVIEW_HOSTNAMES.has(hostname);
    const draft = await draftMode();

    if (!draft.isEnabled && isPreviewHostname) {
      draft.enable();
    }

    const searchParams = request.nextUrl.searchParams.toString();
    // Get the pathname of the request.est (e.g. /, /about, /blog/first-post)
    const path = `${pathname}${
      searchParams.length > 0 ? `?${searchParams}` : ''
    }`;

    // rewrite everything else to `/[domain]/[slug] dynamic route
    return NextResponse.rewrite(new URL(`/${brand}${path}`, request.url));
  };
};
