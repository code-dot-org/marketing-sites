import {buildCatalogMetadata} from '@/modules/activityCatalog/hourOfAi/metadata';

describe('buildCatalogMetadata', () => {
  it('uses the absolute canonical URL for og:url', () => {
    const result = buildCatalogMetadata({locale: 'en-US'});

    expect(result.alternates?.canonical).toMatch(
      /^https:\/\/hourofai\.org\/en-US/,
    );
    expect(result.openGraph?.url).toBe(result.alternates?.canonical);
  });
});
