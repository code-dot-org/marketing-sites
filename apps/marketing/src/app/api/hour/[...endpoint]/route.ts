import {NextRequest} from 'next/server';

import {getStudioBaseUrl} from '@/config/studio';
import {getCachedRedirectResponse} from '@/middleware/utils/getCachedRedirectResponse';

export async function GET(request: NextRequest) {
  const {pathname, search} = request.nextUrl;
  const redirectUrl = new URL(pathname + search, getStudioBaseUrl());

  return getCachedRedirectResponse(redirectUrl, {status: 308});
}
