import {NextRequest} from 'next/server';

import {
  getCachedRedirectResponse,
  getQueryPreservingRedirectResponse,
} from '@/middleware/utils/getCachedRedirectResponse';

import {getRedirects} from '../index';

const studioBaseUrl = 'https://studio.code.org';
jest.mock('@/config/studio', () => ({
  getStudioBaseUrl: jest.fn(() => studioBaseUrl),
}));
jest.mock('@/middleware/utils/getCachedRedirectResponse', () => ({
  getCachedRedirectResponse: jest.fn((url, opts) => ({
    url: url.toString(),
    status: opts.status,
  })),
  getQueryPreservingRedirectResponse: jest.fn((url, request, opts) => ({
    url: url.toString(),
    status: opts.status,
  })),
}));

function createMockRequest(
  pathname: string,
  search = '',
  origin = 'https://example.com',
) {
  return {
    nextUrl: {
      pathname,
      search,
      origin,
    },
  } as unknown as NextRequest;
}

describe('getRedirects', () => {
  afterEach(() => jest.clearAllMocks());

  it('redirects /es-LA to /es', () => {
    const req = createMockRequest('/es-LA');
    getRedirects(req);
    expect(getCachedRedirectResponse).toHaveBeenCalledWith(
      new URL('/es', req.nextUrl.origin),
      {status: 308},
    );
  });

  it('redirects /es-LA/foo/bar to /es/foo/bar', () => {
    const req = createMockRequest('/es-LA/foo/bar');
    getRedirects(req);
    expect(getCachedRedirectResponse).toHaveBeenCalledWith(
      new URL('/es/foo/bar', req.nextUrl.origin),
      {status: 308},
    );
  });

  it('redirects /applab/docs/abc to studio.code.org/docs/applab/abc', () => {
    const req = createMockRequest('/applab/docs/abc');
    getRedirects(req);
    expect(getCachedRedirectResponse).toHaveBeenCalledWith(
      new URL('/docs/applab/abc', 'https://studio.code.org'),
      {status: 308},
    );
  });

  it('redirects /educate/foo to studio.code.org/catalog', () => {
    const req = createMockRequest('/educate/foo');
    getRedirects(req);
    expect(getCachedRedirectResponse).toHaveBeenCalledWith(
      new URL('/catalog', 'https://studio.code.org'),
      {status: 308},
    );
  });

  it('redirects /congrats/:course_name to studio.code.org/congrats/:course_name', () => {
    const reqPath = '/congrats/course_name';
    const req = createMockRequest(reqPath);

    getRedirects(req);

    expect(getQueryPreservingRedirectResponse).toHaveBeenCalledWith(
      new URL(reqPath, studioBaseUrl),
      req,
      {status: 308, neverCache: true},
    );
  });

  it('redirects /congrats?s=course_name_base64 to studio.code.org/congrats?s=course_name_base64', () => {
    const reqPath = '/congrats';
    const reqQuery = '?s=course_name_base64';
    const req = createMockRequest(reqPath, reqQuery);

    getRedirects(req);

    // The query string is carried over by the helper, uncached since `s` isn't in the CDN cache key
    expect(getQueryPreservingRedirectResponse).toHaveBeenCalledWith(
      new URL(reqPath, studioBaseUrl),
      req,
      {status: 308, neverCache: true},
    );
  });

  it('redirects /certificates/:session_id to studio.code.org/api/hour/certificates/:session_id', () => {
    const sessionID = '_1_537adb90bcf397109ef4358f4c66c493';
    const req = createMockRequest(`/certificates/${sessionID}`);

    getRedirects(req);

    expect(getQueryPreservingRedirectResponse).toHaveBeenCalledWith(
      new URL(`/api/hour/certificates/${sessionID}`, studioBaseUrl),
      req,
      {status: 308, neverCache: true},
    );
  });

  it('does not redirect /certificates/blank to studio.code.org/api/hour/certificates/:session_id', () => {
    const req = createMockRequest('/certificates/blank');

    getRedirects(req);

    expect(getQueryPreservingRedirectResponse).not.toHaveBeenCalled();
  });

  it('does not throw for /certificates without a session id', () => {
    const req = createMockRequest('/certificates');

    expect(getRedirects(req)).toBeUndefined();
  });

  it('returns undefined for unrelated paths', () => {
    const req = createMockRequest('/other/path');
    const result = getRedirects(req);
    expect(result).toBeUndefined();
    expect(getCachedRedirectResponse).not.toHaveBeenCalled();
    expect(getQueryPreservingRedirectResponse).not.toHaveBeenCalled();
  });
});
