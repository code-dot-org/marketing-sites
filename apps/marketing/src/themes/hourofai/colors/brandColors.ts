import type {BrandColorTokens} from '@/themes/common/colors/types';

import {hourOfAiColor} from './palette';

export const HOUR_OF_AI_BRAND_COLORS: BrandColorTokens = {
  cssVar: value => hourOfAiColor(value)?.cssVar ?? 'inherit',

  resolveText: (value, background) => {
    const text = hourOfAiColor(value);
    if (!text) return value;
    if (background === 'transparent') return text.value;
    // No enclosing background means the white page.
    const tone = background
      ? (hourOfAiColor(background)?.tone ?? 'light')
      : 'light';
    return (tone === 'dark' ? text.onDark : text.onLight) ?? text.value;
  },

  backgroundTone: value =>
    value ? (hourOfAiColor(value)?.tone ?? 'light') : 'light',

  textOnFill: value => {
    const fill = hourOfAiColor(value);
    if (!fill) return undefined;
    return fill.tone === 'dark'
      ? 'var(--palette-white)'
      : 'var(--palette-black)';
  },
};
