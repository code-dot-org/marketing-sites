import {NextFetchEvent, NextRequest, NextResponse} from 'next/server';

import {isIndexableHost} from '@/config/indexing';

import {withRobotsTag} from '../withRobotsTag';

jest.mock('@/config/indexing', () => ({
  isIndexableHost: jest.fn(),
}));

describe('withRobotsTag middleware', () => {
  const mockEvent = {} as NextFetchEvent;

  function makeRequest(host: string | null) {
    return {
      headers: {get: () => host},
    } as unknown as NextRequest;
  }

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('adds noindex on a non-indexable host', async () => {
    (isIndexableHost as jest.Mock).mockReturnValue(false);
    const next = jest.fn().mockResolvedValue(NextResponse.next());

    const response = await withRobotsTag(next)(
      makeRequest('preview-code.marketing-sites.code.org'),
      mockEvent,
    );

    expect(response.headers.get('X-Robots-Tag')).toBe('noindex, nofollow');
  });

  it('leaves an indexable host untouched', async () => {
    (isIndexableHost as jest.Mock).mockReturnValue(true);
    const next = jest.fn().mockResolvedValue(NextResponse.next());

    const response = await withRobotsTag(next)(
      makeRequest('code.org'),
      mockEvent,
    );

    expect(response.headers.get('X-Robots-Tag')).toBeNull();
  });

  it('stamps redirects returned by the inner layers', async () => {
    (isIndexableHost as jest.Mock).mockReturnValue(false);
    const next = jest
      .fn()
      .mockResolvedValue(
        NextResponse.redirect('https://test-code.org/en-US', {status: 308}),
      );

    const response = await withRobotsTag(next)(
      makeRequest('test-code.org'),
      mockEvent,
    );

    expect(response.status).toBe(308);
    expect(response.headers.get('X-Robots-Tag')).toBe('noindex, nofollow');
  });

  it('checks the request host', async () => {
    (isIndexableHost as jest.Mock).mockReturnValue(true);
    const next = jest.fn().mockResolvedValue(NextResponse.next());

    await withRobotsTag(next)(makeRequest('code.org'), mockEvent);

    expect(isIndexableHost).toHaveBeenCalledWith('code.org');
  });
});
