/**
 * @jest-environment node
 */
import {NextRequest} from 'next/server';

import {getCachedRedirectResponse} from '@/middleware/utils/getCachedRedirectResponse';

import {GET} from '../route';

jest.mock('@/config/studio', () => ({
  getStudioBaseUrl: jest.fn(() => 'https://studio.code.org'),
}));

jest.mock('@/middleware/utils/getCachedRedirectResponse', () => ({
  getCachedRedirectResponse: jest.fn((url, opts) => ({
    url: url.toString(),
    status: opts.status,
  })),
}));

describe('GET /api/hour/[...endpoint]', () => {
  it('redirects pathname', async () => {
    const req = new NextRequest('https://code.org/api/hour/begin_mc.png');
    const res = await GET(req);

    const expectedUrl = new URL(
      '/api/hour/begin_mc.png',
      'https://studio.code.org',
    );

    expect(getCachedRedirectResponse).toHaveBeenCalledWith(expectedUrl, {
      status: 308,
    });
    expect(res).toEqual({url: expectedUrl.toString(), status: 308});
  });

  it('redirects pathname with query', async () => {
    const req = new NextRequest(
      'https://code.org/api/hour/begin/mc?company=code_org',
    );
    const res = await GET(req);

    const expectedUrl = new URL(
      '/api/hour/begin/mc?company=code_org',
      'https://studio.code.org',
    );

    expect(getCachedRedirectResponse).toHaveBeenCalledWith(expectedUrl, {
      status: 308,
    });
    expect(res).toEqual({url: expectedUrl.toString(), status: 308});
  });
});
