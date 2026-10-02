import {Brand} from '@/config/brand';

import {
  getGoogleAnalyticsMeasurementIds,
  GOOGLE_ANALYTICS_CONFIG,
} from '../index';

describe('Google Analytics Config', () => {
  it('should return the correct measurement IDs for CODE_DOT_ORG', () => {
    const measurementIds = getGoogleAnalyticsMeasurementIds(Brand.CODE_DOT_ORG);
    expect(measurementIds).toEqual(GOOGLE_ANALYTICS_CONFIG[Brand.CODE_DOT_ORG]);
  });

  it('should return the correct measurement IDs for HOUR_OF_CODE', () => {
    const measurementIds = getGoogleAnalyticsMeasurementIds(Brand.HOUR_OF_CODE);
    expect(measurementIds).toEqual(GOOGLE_ANALYTICS_CONFIG[Brand.HOUR_OF_CODE]);
  });

  it('should load the CODE_DOT_ORG and Hour of AI tags for HOUR_OF_AI', () => {
    const measurementIds = getGoogleAnalyticsMeasurementIds(Brand.HOUR_OF_AI);
    expect(measurementIds).toEqual(['G-L9HT5MZ3HD', 'G-3XHRM7XDVT']);
  });

  it('should return no IDs for an unknown brand', () => {
    const measurementIds = getGoogleAnalyticsMeasurementIds(
      'UNKNOWN_BRAND' as Brand,
    );
    expect(measurementIds).toEqual([]);
  });
});
