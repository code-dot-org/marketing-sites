import {Brand} from '@/config/brand';

import {
  getGoogleAnalyticsMeasurementId,
  GOOGLE_ANALYTICS_CONFIG,
} from '../index';

describe('Google Analytics Config', () => {
  it('should return the correct measurement ID for CODE_DOT_ORG', () => {
    const measurementId = getGoogleAnalyticsMeasurementId(Brand.CODE_DOT_ORG);
    expect(measurementId).toBe(GOOGLE_ANALYTICS_CONFIG[Brand.CODE_DOT_ORG]);
  });

  it('should return the correct measurement ID for HOUR_OF_CODE', () => {
    const measurementId = getGoogleAnalyticsMeasurementId(Brand.HOUR_OF_CODE);
    expect(measurementId).toBe(GOOGLE_ANALYTICS_CONFIG[Brand.HOUR_OF_CODE]);
  });

  it('should share the CODE_DOT_ORG measurement ID for HOUR_OF_AI', () => {
    const measurementId = getGoogleAnalyticsMeasurementId(Brand.HOUR_OF_AI);
    expect(measurementId).toBe('G-L9HT5MZ3HD');
  });

  it('should return undefined for an unknown brand', () => {
    const measurementId = getGoogleAnalyticsMeasurementId(
      'UNKNOWN_BRAND' as Brand,
    );
    expect(measurementId).toBeUndefined();
  });
});
