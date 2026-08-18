import {Brand} from '@/config/brand';
import {ActivityCatalogPage} from '@/modules/activityCatalog/page/activityCatalogPage';
import {ActivityType} from '@/modules/activityCatalog/types/Activity';

import HourOfCodeActivitiesPage, {generateMetadata} from '../page';

jest.mock('@/modules/activityCatalog/page/activityCatalogPage', () => ({
  ActivityCatalogPage: jest.fn(() => null),
}));

jest.mock('next/navigation', () => ({
  notFound: jest.fn(() => {
    throw new Error('NEXT_NOT_FOUND');
  }),
}));

const params = (brand: string, locale = 'en-US') =>
  Promise.resolve({brand, locale});

describe('Hour of Code activities page (/hour-of-code/activities)', () => {
  it('renders the shared catalog page for the Code.org brand', async () => {
    const element = await HourOfCodeActivitiesPage({
      params: params(Brand.CODE_DOT_ORG),
    });

    expect(element.type).toBe(ActivityCatalogPage);
    expect(element.props).toEqual({
      brand: Brand.CODE_DOT_ORG,
      activityType: ActivityType.HOUR_OF_CODE,
    });
  });

  it.each([Brand.CS_FOR_ALL, Brand.HOUR_OF_CODE])(
    'returns notFound for the %s brand',
    async brand => {
      await expect(
        HourOfCodeActivitiesPage({params: params(brand)}),
      ).rejects.toThrow('NEXT_NOT_FOUND');
    },
  );

  it('uses the code.org canonical with the new URL structure', async () => {
    const metadata = await generateMetadata({params: params('unused')});

    expect(metadata.alternates?.canonical).toBe(
      'https://code.org/en-US/hour-of-code/activities',
    );
  });
});
