import {NextRequest, NextResponse} from 'next/server';

import {getRedirectEntry} from '@/cache/redirects/getRedirectEntry';
import {Brand} from '@/config/brand';
import {getLocalhostDomain} from '@/config/host';

/**
 * API route to get a redirect entry by pathname and brand.
 * GET /api/private/redirects?pathname=[path]&brand=[brand]
 */

export async function GET(request: NextRequest) {
  const host = request.headers.get('host');

  if (getLocalhostDomain() !== host) {
    return new Response(`Invalid host: ${host}`, {status: 403});
  }

  const pathname = request.nextUrl.searchParams.get('pathname');
  const brand = request.nextUrl.searchParams.get('brand') as Brand;

  if (!pathname) {
    return new Response('Missing required parameter pathname', {status: 400});
  }

  if (!brand) {
    return new Response('Missing required parameter brand', {status: 400});
  }

  const redirectEntry = await getRedirectEntry(pathname, brand);

  if (redirectEntry) {
    return NextResponse.json(redirectEntry);
  }

  return new Response('Not Found', {
    status: 404,
  });
}
