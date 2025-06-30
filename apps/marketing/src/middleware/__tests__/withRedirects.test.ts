import {NextResponse} from 'next/server';

import {withRedirects} from '../withRedirects';

jest.mock('@/config/brand', () => ({
  getBrandFromHostname: jest.fn(() => 'Code.org'),
}));
jest.mock('@/config/host', () => ({
  getLocalhostAddress: jest.fn(() => 'http://localhost:3000'),
}));

global.fetch = jest.fn();

describe('withRedirects middleware', () => {
  const next = jest.fn();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const event = {} as any;
  const makeRequest = (pathname = '/foo', host = 'localhost:3000') =>
    ({
      nextUrl: {pathname, origin: 'http://localhost:3000'},
      headers: {get: (key: string) => (key === 'host' ? host : undefined)},
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    }) as any;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('calls next if redirect config API returns 404', async () => {
    (fetch as jest.Mock).mockResolvedValue({status: 404});
    await withRedirects(next)(makeRequest(), event);
    expect(next).toHaveBeenCalled();
  });

  it('permanent redirects to absolute destination with correct status', async () => {
    (fetch as jest.Mock).mockResolvedValue({
      status: 200,
      json: async () => ({
        destination: 'https://external.com',
        permanent: true,
      }),
    });
    const response = await withRedirects(next)(makeRequest(), event);
    expect(response).toEqual(
      NextResponse.redirect('https://external.com', {status: 308}),
    );
  });

  it('temporary redirects to relative destination with correct status', async () => {
    (fetch as jest.Mock).mockResolvedValue({
      status: 200,
      json: async () => ({destination: '/bar', permanent: false}),
    });
    const response = await withRedirects(next)(makeRequest('/foo'), event);
    expect(response).toEqual(
      NextResponse.redirect('http://localhost:3000/bar', {status: 307}),
    );
  });
});
