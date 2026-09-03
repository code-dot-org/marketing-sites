import {Brand} from '@/config/brand';

import CDOTheme from './code.org';
import CSForAllTheme from './csforall';
import HourOfAiTheme from './hourofai';

export function getMuiTheme(brand: Brand) {
  switch (brand) {
    case Brand.CS_FOR_ALL:
      return CSForAllTheme;
    case Brand.HOUR_OF_AI:
      return HourOfAiTheme;
    case Brand.CODE_DOT_ORG:
    default:
      return CDOTheme;
  }
}

export async function getCriticalFonts(brand: Brand) {
  switch (brand) {
    case Brand.CS_FOR_ALL:
      return await import('@/themes/csforall/critical-fonts');
    case Brand.HOUR_OF_AI:
      return await import('@/themes/hourofai/critical-fonts');
    case Brand.CODE_DOT_ORG:
    default:
      return await import('@/themes/code.org/critical-fonts');
  }
}
