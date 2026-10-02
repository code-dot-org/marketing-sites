import {Brand} from '@/config/brand';

const CODE_DOT_ORG_MEASUREMENT_ID = 'G-L9HT5MZ3HD';

/** The first ID loads gtag.js; any others are added as extra destinations. */
export const GOOGLE_ANALYTICS_CONFIG: Record<Brand, string[]> = {
  [Brand.CODE_DOT_ORG]: [CODE_DOT_ORG_MEASUREMENT_ID],
  [Brand.HOUR_OF_CODE]: ['G-Z6QQP1041C'],
  [Brand.CS_FOR_ALL]: ['G-7B55KECV13'],
  // Hour of AI reports into the Code.org property (split by hostname in GA)
  // and, while it migrates, its own property too.
  [Brand.HOUR_OF_AI]: [CODE_DOT_ORG_MEASUREMENT_ID, 'G-3XHRM7XDVT'],
};

export function getGoogleAnalyticsMeasurementIds(brand: Brand): string[] {
  return GOOGLE_ANALYTICS_CONFIG[brand] ?? [];
}
