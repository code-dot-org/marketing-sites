import {
  backgroundToneFor,
  BrandColor,
  cssVarForBrandColor,
  resolveTextColorForBackground,
} from '@/components/common/colors';
import type {BrandColorTokens} from '@/themes/common/colors/types';

// Also the fallback for themes without their own `mixins.brandColors`.
export const CODE_ORG_BRAND_COLORS: BrandColorTokens = {
  cssVar: value => cssVarForBrandColor(value as BrandColor),
  resolveText: (value, background) =>
    resolveTextColorForBackground(value as BrandColor, background).value,
  backgroundTone: value => backgroundToneFor(value as BrandColor),
};
