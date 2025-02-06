import {figtree} from '@/config/fonts/figtree';
import {
  getNotoFallbackFonts,
  notoSans,
  notoSansMath,
} from '@/config/fonts/noto';
import {
  barlowSemiCondensedMedium,
  barlowSemiCondensedSemiBold,
} from '@/config/fonts/barlow';
import {FontMapping, FontVariableMapping} from '@/config/fonts/types';
import {SUPPORTED_LOCALES, SupportedLocale} from '@/config/locales';

export const DEFAULT_FONTS = [
  figtree,
  notoSans,
  notoSansMath,
  barlowSemiCondensedMedium,
  barlowSemiCondensedSemiBold,
];

export const FONTS_BY_LOCALE: FontMapping = SUPPORTED_LOCALES.reduce(
  (accumulator: FontMapping, locale: SupportedLocale) => {
    accumulator[locale] = [...DEFAULT_FONTS, ...getNotoFallbackFonts(locale)];
    return accumulator;
  },
  Object.create({}),
);

export const FONT_VARIABLES_BY_LOCALE: FontVariableMapping = Object.entries(
  FONTS_BY_LOCALE,
).reduce((accumulator: FontVariableMapping, [locale, fonts]) => {
  accumulator[locale] = fonts.map(font => font.variable);
  return accumulator;
}, Object.create({}));
