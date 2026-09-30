import {Brand} from '@/config/brand';

const CODE_DOT_ORG_MEASUREMENT_ID = 'G-L9HT5MZ3HD';

export const GOOGLE_ANALYTICS_CONFIG: Record<Brand, string | undefined> = {
  [Brand.CODE_DOT_ORG]: CODE_DOT_ORG_MEASUREMENT_ID,
  [Brand.HOUR_OF_CODE]: 'G-Z6QQP1041C',
  [Brand.CS_FOR_ALL]: 'G-7B55KECV13',
  // Hour of AI reports into the Code.org property; split by hostname in GA.
  [Brand.HOUR_OF_AI]: CODE_DOT_ORG_MEASUREMENT_ID,
};

export function getGoogleAnalyticsMeasurementId(brand: Brand) {
  return GOOGLE_ANALYTICS_CONFIG[brand];
}
