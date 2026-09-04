import {getRedirectEntry} from '@/cache/redirects/getRedirectEntry';
import redirectCacheByBrandPromise from '@/cache/redirects/redirectCacheByBrand';
import {RedirectEntry} from '@/cache/redirects/types';
import {Brand} from '@/config/brand';

jest.mock('@/cache/redirects/redirectCacheByBrand', () => ({
  __esModule: true,
  default: jest.fn(),
}));

const mockCache = redirectCacheByBrandPromise as jest.Mock;

const entry = (source: string, destination: string): RedirectEntry => ({
  brand: Brand.CODE_DOT_ORG,
  source,
  destination,
  permanent: true,
});

const PAGE = entry('/administrators', '/districts');
const LOCALE_SCOPED = entry('/en-US/about/annual-report', '/about/impact');

describe('getRedirectEntry locale fallback', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockCache.mockResolvedValue({
      [Brand.CODE_DOT_ORG]: {
        '/administrators': PAGE,
        '/en-US/about/annual-report': LOCALE_SCOPED,
      },
    });
  });

  it('matches an unprefixed path exactly', async () => {
    await expect(
      getRedirectEntry('/administrators', Brand.CODE_DOT_ORG),
    ).resolves.toBe(PAGE);
  });

  it.each(['en-US', 'es', 'hi', 'zh-Hant'])(
    'falls back to the unprefixed entry for /%s/administrators',
    async locale => {
      await expect(
        getRedirectEntry(`/${locale}/administrators`, Brand.CODE_DOT_ORG),
      ).resolves.toBe(PAGE);
    },
  );

  it('prefers an exact match over the locale-stripped fallback', async () => {
    await expect(
      getRedirectEntry('/en-US/about/annual-report', Brand.CODE_DOT_ORG),
    ).resolves.toBe(LOCALE_SCOPED);
  });

  it('returns undefined when neither form matches', async () => {
    await expect(
      getRedirectEntry('/es/nothing-here', Brand.CODE_DOT_ORG),
    ).resolves.toBeUndefined();
  });

  it('does not strip a first segment that is not a supported locale', async () => {
    await expect(
      getRedirectEntry('/administrators/legacy', Brand.CODE_DOT_ORG),
    ).resolves.toBeUndefined();
  });

  it('returns undefined when the brand has no cache', async () => {
    mockCache.mockResolvedValue(undefined);
    await expect(
      getRedirectEntry('/administrators', Brand.CODE_DOT_ORG),
    ).resolves.toBeUndefined();
  });
});
