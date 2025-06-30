/**
 * @jest-environment node
 */
import {NextRequest} from 'next/server';

import {getRedirectEntry} from '@/cache/redirects/getRedirectEntry';
import {getLocalhostDomain} from '@/config/host';

import {GET} from '../route';

jest.mock('@/cache/redirects/getRedirectEntry', () => ({
  getRedirectEntry: jest.fn(),
}));
jest.mock('@/config/host', () => ({
  getLocalhostDomain: jest.fn(),
}));

function makeRequest({
  host,
  pathname,
  brand,
}: {
  host?: string;
  pathname?: string;
  brand?: string;
}) {
  const url = new URL('http://test/api/private/redirects');
  if (pathname) url.searchParams.set('pathname', pathname);
  if (brand) url.searchParams.set('brand', brand);
  return {
    headers: {get: (key: string) => (key === 'host' ? host : undefined)},
    nextUrl: url,
  } as unknown as NextRequest;
}

describe('GET /api/private/redirects', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (getLocalhostDomain as jest.Mock).mockReturnValue('localhost:3000');
  });

  it('returns 400 if pathname is missing', async () => {
    const req = makeRequest({host: 'localhost:3000', brand: 'code.org'});
    const res = await GET(req);
    expect(res.status).toBe(400);
    const text = await res.text();
    expect(text).toMatch(/Missing required parameter pathname/);
  });

  it('returns 400 if brand is missing', async () => {
    const req = makeRequest({host: 'localhost:3000', pathname: '/foo'});
    const res = await GET(req);
    expect(res.status).toBe(400);
    const text = await res.text();
    expect(text).toMatch(/Missing required parameter brand/);
  });

  it('returns 404 if no redirect entry is found', async () => {
    (getRedirectEntry as jest.Mock).mockResolvedValue(undefined);
    const req = makeRequest({
      host: 'localhost:3000',
      pathname: '/foo',
      brand: 'code.org',
    });
    const res = await GET(req);
    expect(res.status).toBe(404);
    const text = await res.text();
    expect(text).toMatch(/Not Found/);
  });

  it('returns the redirect entry as JSON if found', async () => {
    const entry = {to: '/bar', status: 302};
    (getRedirectEntry as jest.Mock).mockResolvedValue(entry);
    const req = makeRequest({
      host: 'localhost:3000',
      pathname: '/foo',
      brand: 'code.org',
    });
    const res = await GET(req);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json).toEqual(entry);
  });
});
