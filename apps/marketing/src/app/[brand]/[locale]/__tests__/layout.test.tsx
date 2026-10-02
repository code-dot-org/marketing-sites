import {render} from '@testing-library/react';
import {draftMode, headers} from 'next/headers';

import {Brand, getBrandFromHostname} from '@/config/brand';
import {getGoogleAnalyticsMeasurementIds} from '@/config/ga4';
import {SupportedLocale} from '@/config/locale';
import {getStage} from '@/config/stage';

import Layout from '../layout';

jest.mock('next/headers', () => ({
  headers: jest.fn(),
  draftMode: jest.fn(),
}));

jest.mock('@/config/brand', () => ({
  ...jest.requireActual('@/config/brand'),
  getBrandFromHostname: jest.fn(),
}));

jest.mock('@/config/ga4', () => ({
  getGoogleAnalyticsMeasurementIds: jest.fn(),
}));

jest.mock('@/config/stage', () => ({
  getStage: jest.fn(),
}));

jest.mock('@/providers/onetrust/OneTrustLoader', () => () => (
  <div>OneTrustLoader</div>
));
jest.mock(
  '@/providers/onetrust/OneTrustProvider',
  () =>
    ({children}: {children: React.ReactNode}) => (
      <div>OneTrustProvider {children}</div>
    ),
);
jest.mock(
  '@/providers/googleAnalytics/GoogleAnalyticsLoader',
  () =>
    ({measurementIds}: {measurementIds: string[]}) => (
      <div>GoogleAnalyticsLoader {measurementIds.join(' ')}</div>
    ),
);
jest.mock(
  '@/providers/statsig/StatsigProvider',
  () =>
    ({children}: {children: React.ReactNode}) => (
      <div>StatsigProvider {children}</div>
    ),
);

jest.mock(
  '@/config/jsonLd/OrganizationJsonLd',
  () =>
    ({brand}: {brand: string}) => <div>OrganizationJsonLd for {brand}</div>,
);

// The Code.org footer is an async server component (it fetches Contentful
// content), which @testing-library/react cannot render.
jest.mock('@/components/footer/Footer', () => ({
  getFooter: jest.fn(async () => <footer>Footer</footer>),
}));

// Same for the Code.org header.
jest.mock('@/components/header/Header', () => ({
  getHeader: jest.fn(() => <header>Header</header>),
}));

jest.mock('next/navigation', () => ({
  useRouter: jest.fn(() => ({
    push: jest.fn(),
  })),
  usePathname: jest.fn(() => '/example-path'),
  useServerInsertedHTML: jest.fn(),
}));

describe('Layout', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the layout with children', async () => {
    const brand = Brand.CODE_DOT_ORG;

    (headers as jest.Mock).mockResolvedValue({
      get: jest.fn().mockReturnValue('example.com'),
    });
    (getBrandFromHostname as jest.Mock).mockReturnValue(brand);
    (getGoogleAnalyticsMeasurementIds as jest.Mock).mockReturnValue([
      'GA-123456',
    ]);
    (getStage as jest.Mock).mockReturnValue('production');
    (draftMode as jest.Mock).mockReturnValue(false);

    const {findByText} = render(
      await Layout({
        children: <div>Child Component</div>,
        params: Promise.resolve({
          brand: 'code.org' as Brand,
          locale: 'en-US' as SupportedLocale,
        }),
      }),
    );

    expect(await findByText('OneTrustLoader')).toBeInTheDocument();
    expect(await findByText('OneTrustProvider')).toBeInTheDocument();
    expect(
      await findByText('GoogleAnalyticsLoader GA-123456'),
    ).toBeInTheDocument();
    expect(await findByText('StatsigProvider')).toBeInTheDocument();
    expect(await findByText('Child Component')).toBeInTheDocument();
    expect(
      await findByText(`OrganizationJsonLd for ${brand}`),
    ).toBeInTheDocument();
  });

  it('sets the html lang attribute based on locale', async () => {
    const locale = 'zh-CN';

    (headers as jest.Mock).mockResolvedValue({
      get: jest.fn().mockReturnValue('example.com'),
    });
    (getBrandFromHostname as jest.Mock).mockReturnValue('code.org');
    (getGoogleAnalyticsMeasurementIds as jest.Mock).mockReturnValue([
      'GA-123456',
    ]);
    (getStage as jest.Mock).mockReturnValue('production');

    const {container} = render(
      await Layout({
        children: <div>Child Component</div>,
        params: Promise.resolve({
          brand: 'code.org' as Brand,
          locale: locale as SupportedLocale,
        }),
      }),
    );

    expect(container.querySelector('html')?.getAttribute('lang')).toBe(locale);
    expect(container.querySelector('html')?.getAttribute('dir')).toBe('ltr');
  });

  it('sets the RTL attribute based if locale is RTL language', async () => {
    const locale = 'ar';

    (headers as jest.Mock).mockResolvedValue({
      get: jest.fn().mockReturnValue('example.com'),
    });
    (getBrandFromHostname as jest.Mock).mockReturnValue('code.org');
    (getGoogleAnalyticsMeasurementIds as jest.Mock).mockReturnValue([
      'GA-123456',
    ]);
    (getStage as jest.Mock).mockReturnValue('production');

    const {container} = render(
      await Layout({
        children: <div>Child Component</div>,
        params: Promise.resolve({
          brand: 'code.org' as Brand,
          locale: locale as SupportedLocale,
        }),
      }),
    );

    expect(container.querySelector('html')?.getAttribute('dir')).toBe('rtl');
  });
});
