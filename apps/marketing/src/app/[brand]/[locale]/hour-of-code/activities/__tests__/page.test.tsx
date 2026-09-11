import {Brand} from '@/config/brand';
import {getIcons} from '@/config/metadata/icons';
import {HourOfAiCatalogPage} from '@/modules/activityCatalog/hourOfAi/catalogPage';
import {ActivityType} from '@/modules/activityCatalog/types/Activity';

import Page, {generateMetadata} from '../page';

jest.mock('@/modules/activityCatalog/hourOfAi/catalogPage', () => ({
  HourOfAiCatalogPage: jest.fn(() => null),
}));

jest.mock('next/navigation', () => ({
  notFound: jest.fn(() => {
    throw new Error('NEXT_NOT_FOUND');
  }),
}));

const params = (brand: string, locale = 'en-US') =>
  Promise.resolve({brand, locale});

describe('Hour of Code catalog (/hour-of-code/activities)', () => {
  it('renders the catalog for the Hour of AI brand', async () => {
    const element = await Page({params: params(Brand.HOUR_OF_AI)});

    expect(element.type).toBe(HourOfAiCatalogPage);
    expect(element.props).toEqual({activityType: ActivityType.HOUR_OF_CODE});
  });

  it.each([Brand.CODE_DOT_ORG, Brand.CS_FOR_ALL, Brand.HOUR_OF_CODE])(
    'returns notFound for the %s brand',
    async brand => {
      await expect(Page({params: params(brand)})).rejects.toThrow(
        'NEXT_NOT_FOUND',
      );
    },
  );

  it('canonicalises to /hour-of-code/activities', async () => {
    const metadata = await generateMetadata({params: params('unused')});

    expect(metadata.alternates?.canonical).toBe(
      'https://hourofai.org/en-US/hour-of-code/activities',
    );
  });

  it('keeps the locale in the canonical', async () => {
    const metadata = await generateMetadata({
      params: params('unused', 'es-ES'),
    });

    expect(metadata.alternates?.canonical).toBe(
      'https://hourofai.org/es-ES/hour-of-code/activities',
    );
  });

  it('titles itself Hour of Code Activities', async () => {
    const metadata = await generateMetadata({params: params('unused')});

    expect(metadata.title).toBe('Hour of Code Activities');
    expect(metadata.icons).toEqual(getIcons(Brand.HOUR_OF_AI));
  });
});
