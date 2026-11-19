import {buildReportMetadata} from '@/modules/stateOfDigitalFluency/metadata';

describe('buildReportMetadata', () => {
  it('uses the absolute canonical URL for og:url', () => {
    const result = buildReportMetadata({kind: 'overview'}, 'en-US');

    expect(result.alternates?.canonical).toMatch(/^https:\/\/code\.org\/en-US/);
    expect(result.openGraph?.url).toBe(result.alternates?.canonical);
  });
});
