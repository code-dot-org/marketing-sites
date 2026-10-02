import {Brand} from '@/config/brand';

/** Title for pages without a meta title; undefined uses the root layout's. */
export const BRAND_DEFAULT_TITLE: {[brand in Brand]: string | undefined} = {
  [Brand.CODE_DOT_ORG]: undefined,
  [Brand.HOUR_OF_CODE]: undefined,
  [Brand.CS_FOR_ALL]: undefined,
  [Brand.HOUR_OF_AI]: 'Hour of AI',
};
