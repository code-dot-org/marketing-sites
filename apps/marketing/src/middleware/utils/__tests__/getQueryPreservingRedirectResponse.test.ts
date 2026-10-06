import {NextRequest} from 'next/server';

import {
  PRIVATE_NO_STORE,
  STALE_WHILE_REVALIDATE_ONE_HOUR,
} from '@/cache/constants';

import {getQueryPreservingRedirectResponse} from '../getCachedRedirectResponse';

function makeRequest(search: string) {
  return {nextUrl: {search}} as unknown as NextRequest;
}

function redirect(
  url: string,
  search: string,
  options?: Parameters<typeof getQueryPreservingRedirectResponse>[2],
) {
  const response = getQueryPreservingRedirectResponse(
    url,
    makeRequest(search),
    options,
  );
  return {
    location: response.headers.get('location'),
    cacheControl: response.headers.get('Cache-Control'),
    status: response.status,
  };
}

describe('getQueryPreservingRedirectResponse', () => {
  describe('carrying over all params (default)', () => {
    it('redirects without a query string and caches the redirect', () => {
      expect(redirect('https://example.com/en-US/home', '')).toEqual({
        location: 'https://example.com/en-US/home',
        cacheControl: STALE_WHILE_REVALIDATE_ONE_HOUR,
        status: 307,
      });
    });

    it('caches the redirect when only CDN cache key params are carried', () => {
      expect(
        redirect('https://example.com/en-US/home', '?utm_source=a&utm_term=b'),
      ).toMatchObject({
        location: 'https://example.com/en-US/home?utm_source=a&utm_term=b',
        cacheControl: STALE_WHILE_REVALIDATE_ONE_HOUR,
      });
    });

    it('does not cache the redirect when any other param is carried', () => {
      expect(
        redirect('https://example.com/en-US/home', '?utm_source=a&term=robots'),
      ).toMatchObject({
        location: 'https://example.com/en-US/home?utm_source=a&term=robots',
        cacheControl: PRIVATE_NO_STORE,
      });
    });

    it('treats encoded CDN cache key names as uncacheable', () => {
      expect(
        redirect('https://example.com/page', '?utm%5Fsource=a'),
      ).toMatchObject({
        location: 'https://example.com/page?utm%5Fsource=a',
        cacheControl: PRIVATE_NO_STORE,
      });
    });

    it('carries params over exactly as received', () => {
      expect(
        redirect(
          'https://studio.example.com/congrats',
          '?s=YWJj+ZA==&q=a%20b&flag&x=%2F',
        ).location,
      ).toBe(
        'https://studio.example.com/congrats?s=YWJj+ZA==&q=a%20b&flag&x=%2F',
      );
    });

    it('keeps repeated params', () => {
      expect(redirect('https://example.com/page', '?g=k&g=5').location).toBe(
        'https://example.com/page?g=k&g=5',
      );
    });

    it('keeps destination params over request params with the same name', () => {
      expect(
        redirect('https://example.com/page?t=14', '?t=1&t=2&ref=a').location,
      ).toBe('https://example.com/page?t=14&ref=a');
    });

    it('keeps the destination hash after the query string', () => {
      expect(
        redirect('https://example.com/page#section', '?ref=a').location,
      ).toBe('https://example.com/page?ref=a#section');
    });
  });

  describe('carrying over only CDN cache key params', () => {
    const options = {carryOver: 'cdn-cache-key'} as const;

    it('drops other params and caches the redirect', () => {
      expect(
        redirect(
          'https://other.example.org/x',
          '?term=robots&utm_source=a&email=me%40example.com',
          options,
        ),
      ).toMatchObject({
        location: 'https://other.example.org/x?utm_source=a',
        cacheControl: STALE_WHILE_REVALIDATE_ONE_HOUR,
      });
    });

    it('drops encoded CDN cache key names', () => {
      expect(
        redirect('https://other.example.org/x', '?utm%5Fsource=a', options),
      ).toMatchObject({
        location: 'https://other.example.org/x',
        cacheControl: STALE_WHILE_REVALIDATE_ONE_HOUR,
      });
    });
  });

  describe('never caching', () => {
    it('does not cache the redirect even without params', () => {
      expect(
        redirect('https://studio.example.com/congrats/x', '', {
          neverCache: true,
        }).cacheControl,
      ).toBe(PRIVATE_NO_STORE);
    });

    it('does not cache the redirect with only CDN cache key params', () => {
      expect(
        redirect('https://studio.example.com/congrats/x', '?utm_source=a', {
          neverCache: true,
        }).cacheControl,
      ).toBe(PRIVATE_NO_STORE);
    });
  });

  it('passes the response init through', () => {
    expect(redirect('https://example.com/page', '', {status: 308}).status).toBe(
      308,
    );
  });
});
