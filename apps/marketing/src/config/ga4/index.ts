import {Brand} from '@/config/brand';

export const GOOGLE_ANALYTICS_CONFIG: Record<Brand, string | undefined> = {
  [Brand.CODE_DOT_ORG]: 'G-L9HT5MZ3HD',
  [Brand.HOUR_OF_CODE]: 'G-Z6QQP1041C',
  [Brand.CS_FOR_ALL]: 'G-7B55KECV13',
  // TODO(hourofai): no GA4 property provisioned yet. Analytics is skipped while
  // this is undefined; replace with the measurement id before launch.
  [Brand.HOUR_OF_AI]: undefined,
};

export function getGoogleAnalyticsMeasurementId(brand: Brand) {
  return GOOGLE_ANALYTICS_CONFIG[brand];
}
