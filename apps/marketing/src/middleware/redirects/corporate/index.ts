import {NextRequest} from 'next/server';

import {getStudioBaseUrl} from '@/config/studio';
import {getCachedRedirectResponse} from '@/middleware/utils/getCachedRedirectResponse';

export function getRedirects(request: NextRequest) {
  const fullPath = request.nextUrl.pathname;
  const urlQuery = request.nextUrl.search;
  const pathParts = fullPath.split('/').filter(Boolean);

  const maybeLocale = pathParts[0];

  // Permanently redirect /es-LA to /es
  // Code may be removed after January 2026 (to allow time for SEO crawlers to update)
  if (maybeLocale === 'es-LA') {
    const restOfPath = pathParts.slice(1).join('/');
    const redirectUrl = new URL(`/es/${restOfPath}`, request.nextUrl.origin);

    return getCachedRedirectResponse(redirectUrl, {status: 308});
  }

  // Permanently redirect /zh-TW to /zh-Hant
  // Code may be removed after January 2026 (to allow time for SEO crawlers to update)
  if (maybeLocale === 'zh-TW') {
    const restOfPath = pathParts.slice(1).join('/');
    const redirectUrl = new URL(
      `/zh-Hant/${restOfPath}`,
      request.nextUrl.origin,
    );

    return getCachedRedirectResponse(redirectUrl, {status: 308});
  }

  // Permanently redirect /applab/docs/:slug to studio.code.org/docs/applab/:slug
  if (pathParts[0] === 'applab' && pathParts[1] === 'docs') {
    const restOfPath = pathParts.slice(2).join('/');
    const redirectUrl = new URL(
      `/docs/applab/${restOfPath}`,
      getStudioBaseUrl(),
    );

    return getCachedRedirectResponse(redirectUrl, {status: 308});
  }

  // Permanently redirect /educate/* to studio.code.org/catalog
  if (pathParts[0] === 'educate') {
    const redirectUrl = new URL(`/catalog`, getStudioBaseUrl());

    return getCachedRedirectResponse(redirectUrl, {status: 308});
  }

  // Permanently redirect /congrats/*?s=course_name_base64 to studio.code.org/congrats/*?s=course_name_base64
  if (pathParts[0] === 'congrats') {
    const redirectUrl = new URL(fullPath + urlQuery, getStudioBaseUrl());

    return getCachedRedirectResponse(redirectUrl, {status: 308});
  }

  // Permanently redirect /certificates/:session_id to studio.code.org/api/hour/certificates/:session_id
  // The :session_id parameter always starts with an underscore (e.g., "_1_537adb90bcf397109ef4358f4c66c493")
  if (pathParts[0] === 'certificates' && pathParts[1].startsWith('_')) {
    const redirectUrl = new URL(
      `/api/hour/${fullPath}` + urlQuery,
      getStudioBaseUrl(),
    );

    return getCachedRedirectResponse(redirectUrl, {status: 308});
  }
}
