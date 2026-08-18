import {Brand} from '@/config/brand';
import {ActivityCatalogPage} from '@/modules/activityCatalog/page/activityCatalogPage';

import ActivitiesPage, {generateMetadata} from '../page';

jest.mock('@/modules/activityCatalog/page/activityCatalogPage', () => ({
  ActivityCatalogPage: jest.fn(() => null),
}));

jest.mock('next/navigation', () => ({
  notFound: jest.fn(() => {
    throw new Error('NEXT_NOT_FOUND');
  }),
}));

const params = (brand: string, activityType = 'hour-of-ai') =>
  Promise.resolve({brand, locale: 'en-US', activityType});

// CSFORALL-COMPAT: remove with the /activities/[activityType] route when
// csforall is retired.
describe('CSforAll activities page (/activities/[activityType])', () => {
  it('renders the shared catalog page for the CSforAll brand', async () => {
    const element = await ActivitiesPage({params: params(Brand.CS_FOR_ALL)});

    expect(element.type).toBe(ActivityCatalogPage);
    expect(element.props).toEqual({
      brand: Brand.CS_FOR_ALL,
      activityType: 'hour-of-ai',
    });
  });

  it.each([Brand.CODE_DOT_ORG, Brand.HOUR_OF_CODE])(
    'returns notFound for the %s brand',
    async brand => {
      await expect(ActivitiesPage({params: params(brand)})).rejects.toThrow(
        'NEXT_NOT_FOUND',
      );
    },
  );

  it('returns notFound for an invalid activity type', async () => {
    await expect(
      ActivitiesPage({params: params(Brand.CS_FOR_ALL, 'not-a-type')}),
    ).rejects.toThrow('NEXT_NOT_FOUND');
  });

  it('keeps the csforall.org canonical and URL structure', async () => {
    const metadata = await generateMetadata({params: params('unused')});

    expect(metadata.alternates?.canonical).toBe(
      'https://csforall.org/en-US/activities/hour-of-ai',
    );
  });

  it('keeps the locale in the canonical', async () => {
    const metadata = await generateMetadata({
      params: Promise.resolve({locale: 'es-ES', activityType: 'hour-of-code'}),
    });

    expect(metadata.alternates?.canonical).toBe(
      'https://csforall.org/es-ES/activities/hour-of-code',
    );
  });
});
