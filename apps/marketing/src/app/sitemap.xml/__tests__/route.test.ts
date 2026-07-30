import {STALE_WHILE_REVALIDATE_ONE_DAY} from '@/cache/constants';
import {getStage} from '@/config/stage';
import {getContentfulClient} from '@/contentful/client';
import {getAllEntriesForContentType} from '@/contentful/get-entries';

import {GET} from '../route';

jest.mock('@/contentful/client');
jest.mock('@/contentful/get-entries');
jest.mock('@tinyhttp/etag', () => ({
  eTag: jest.fn(() => 'mock-etag'),
}));
jest.mock('@/cache/constants', () => ({
  STALE_WHILE_REVALIDATE_ONE_DAY:
    'public, max-age=0, stale-while-revalidate=86400',
}));
jest.mock('@/config/locale', () => ({
  SUPPORTED_LOCALE_CODES: ['en-US', 'fr'],
}));
jest.mock('@/config/stage', () => ({
  getStage: jest.fn(),
}));

const mockRequest = (host = 'code.marketing-sites.localhost') =>
  ({
    headers: {
      get: (key: string) => (key === 'host' ? host : undefined),
    },
  }) as unknown as Request;

describe('GET /sitemap.xml', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.CONTENTFUL_EXPERIENCE_CONTENT_TYPE_ID = 'test-content-type-id';
  });

  it('returns empty response if contentful client is not available', async () => {
    (getContentfulClient as jest.Mock).mockReturnValue(undefined);

    const response = await GET(mockRequest());
    expect(response).toBeInstanceOf(Response);
    const text = await response.text();
    expect(text).toBe('');
  });

  it('returns sitemap xml with correct headers', async () => {
    (getContentfulClient as jest.Mock).mockReturnValue({});
    (getAllEntriesForContentType as jest.Mock).mockResolvedValue([
      {
        fields: {
          slug: '/test',
        },
        sys: {updatedAt: '2024-01-01T00:00:00Z'},
      },
    ]);

    const response = await GET(mockRequest('mysite.com'));
    expect(response.headers.get('Cache-Control')).toBe(
      STALE_WHILE_REVALIDATE_ONE_DAY,
    );
    expect(response.headers.get('ETag')).toBe('mock-etag');
    const body = await response.text();
    expect(body).toContain('test');
    expect(body).toContain('code.marketing-sites.localhost');
  });

  it('returns sitemap xml with canonical hostname', async () => {
    (getContentfulClient as jest.Mock).mockReturnValue({});
    (getAllEntriesForContentType as jest.Mock).mockResolvedValue([
      {
        fields: {
          slug: '/test',
        },
        sys: {updatedAt: '2024-01-01T00:00:00Z'},
      },
    ]);
    (getStage as jest.Mock).mockReturnValue('production');

    const response = await GET(mockRequest('mysite.com'));
    expect(response.headers.get('Cache-Control')).toBe(
      STALE_WHILE_REVALIDATE_ONE_DAY,
    );
    expect(response.headers.get('ETag')).toBe('mock-etag');
    const body = await response.text();
    expect(body).toContain('test');
    expect(body).not.toContain('marketing-sites');
    expect(body).toContain('code.org');
  });

  it('skips entries with noIndex set', async () => {
    (getContentfulClient as jest.Mock).mockReturnValue({});
    (getAllEntriesForContentType as jest.Mock).mockResolvedValue([
      {
        fields: {
          slug: '/hidden',
          noIndex: true,
        },
        sys: {updatedAt: '2024-01-01T00:00:00Z'},
      },
    ]);

    const response = await GET(mockRequest());
    const body = await response.text();
    expect(body).not.toContain('/hidden');
  });

  it('skips entries without a slug', async () => {
    (getContentfulClient as jest.Mock).mockReturnValue({});
    (getAllEntriesForContentType as jest.Mock).mockResolvedValue([
      {
        fields: {
          slug: '',
        },
        sys: {updatedAt: '2024-01-01T00:00:00Z'},
      },
    ]);

    const response = await GET(mockRequest());
    const body = await response.text();
    expect(body).not.toContain('<url>');
  });

  it('handles root slug "/" correctly', async () => {
    jest.resetAllMocks();
    (getContentfulClient as jest.Mock).mockReturnValue({});
    (getAllEntriesForContentType as jest.Mock).mockResolvedValue([
      {
        fields: {
          slug: '/',
        },
        sys: {updatedAt: '2024-01-01T00:00:00Z'},
      },
    ]);

    const response = await GET(mockRequest());
    const body = await response.text();
    // Should not have double slash
    expect(body).toContain(
      '<loc>https://code.marketing-sites.localhost/en-US</loc>',
    );
    expect(body).toContain(
      '<loc>https://code.marketing-sites.localhost/fr</loc>',
    );
    // does not exist on Code.org, only CSForAll
    expect(body).not.toContain('/en-US/activities/hour-of-ai');
  });

  it('includes hreflang alternate links and x-default in sitemap entries', async () => {
    jest.resetAllMocks();
    (getContentfulClient as jest.Mock).mockReturnValue({});
    (getAllEntriesForContentType as jest.Mock).mockResolvedValue([
      {
        fields: {
          slug: '/hreftest',
        },
        sys: {updatedAt: '2024-01-01T00:00:00Z'},
      },
    ]);

    const response = await GET(mockRequest());
    const body = await response.text();
    // Check for alternate links for each supported locale
    expect(body).toContain(
      '<xhtml:link rel="alternate" hreflang="en-US" href="https://code.marketing-sites.localhost/en-US/hreftest"',
    );
    expect(body).toContain(
      '<xhtml:link rel="alternate" hreflang="fr" href="https://code.marketing-sites.localhost/fr/hreftest"',
    );
    // Check for x-default which is the canonical URL
    expect(body).toContain(
      '<xhtml:link rel="alternate" hreflang="x-default" href="https://code.marketing-sites.localhost/en-US/hreftest"',
    );
  });

  // LEGACY-ENV-COMPAT: remove with the legacy seoMetadata fallback in route.ts.
  describe('legacy environment fallback', () => {
    const unknownFieldError = () => {
      const error = new Error(
        JSON.stringify({message: 'No field with id "noIndex" found.'}),
      );
      error.name = 'UnknownField';
      return error;
    };

    it('falls back to the legacy seoMetadata query when noIndex is unknown', async () => {
      (getContentfulClient as jest.Mock).mockReturnValue({});
      (getAllEntriesForContentType as jest.Mock)
        .mockRejectedValueOnce(unknownFieldError())
        .mockResolvedValueOnce([
          {
            fields: {slug: '/visible'},
            sys: {updatedAt: '2024-01-01T00:00:00Z'},
          },
          {
            fields: {
              slug: '/legacy-hidden',
              seoMetadata: {
                fields: {hidePageFromSearchEnginesNoindex: true},
              },
            },
            sys: {updatedAt: '2024-01-01T00:00:00Z'},
          },
        ]);

      const response = await GET(mockRequest());
      const body = await response.text();

      expect(body).toContain('/visible');
      expect(body).not.toContain('/legacy-hidden');
      expect(getAllEntriesForContentType).toHaveBeenCalledTimes(2);
      expect(getAllEntriesForContentType).toHaveBeenLastCalledWith(
        expect.anything(),
        'test-content-type-id',
        {
          'fields.slug[exists]': 'true',
          include: 1,
          select: 'fields.slug,fields.seoMetadata,sys.updatedAt',
        },
      );
    });

    it('does not fall back on non-UnknownField errors', async () => {
      (getContentfulClient as jest.Mock).mockReturnValue({});
      (getAllEntriesForContentType as jest.Mock).mockRejectedValue(
        new Error('network down'),
      );

      const response = await GET(mockRequest());

      expect(response.status).toBe(503);
      expect(response.headers.get('Cache-Control')).toBe('no-store');
      expect(getAllEntriesForContentType).toHaveBeenCalledTimes(1);
    });

    it('returns an uncached 503 when both queries fail', async () => {
      (getContentfulClient as jest.Mock).mockReturnValue({});
      (getAllEntriesForContentType as jest.Mock)
        .mockRejectedValueOnce(unknownFieldError())
        .mockRejectedValueOnce(new Error('network down'));

      const response = await GET(mockRequest());

      expect(response.status).toBe(503);
      expect(response.headers.get('Cache-Control')).toBe('no-store');
    });
  });

  it('includes hour of ai activities on CSForAll', async () => {
    jest.resetAllMocks();
    (getContentfulClient as jest.Mock).mockReturnValue({});
    (getAllEntriesForContentType as jest.Mock).mockResolvedValue([
      {
        fields: {
          slug: '/',
        },
        sys: {updatedAt: '2024-01-01T00:00:00Z'},
      },
    ]);

    const response = await GET(
      mockRequest('csforall.marketing-sites.code.org'),
    );
    const body = await response.text();
    // Should not have double slash
    expect(body).toContain('/en-US/activities/hour-of-ai');

    expect(body).toContain('/fr/activities/hour-of-ai');
  });
});
