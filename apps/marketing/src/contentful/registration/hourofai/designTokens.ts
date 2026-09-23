// Presets for Contentful Studio's design panel. Values must stay
// whitespace-free — the SDK's token resolver splits on spaces.
import {DesignTokensDefinition} from '@contentful/experiences-core/types';

import {brandRadius} from '@/themes/common/radius';
import {HOUR_OF_AI_COLORS} from '@/themes/hourofai/colors/palette';

const brandColor = Object.fromEntries(
  HOUR_OF_AI_COLORS.map(({value, cssVar}) => [value, cssVar]),
);

// 2px solid preset per palette color.
const brandBorderPreset = Object.fromEntries(
  HOUR_OF_AI_COLORS.map(({value, cssVar}) => [
    value,
    {width: '2px', style: 'solid' as const, color: cssVar},
  ]),
);

const brandBorderRadius = {
  none: brandRadius('none'),
  small: brandRadius('sm'),
  medium: brandRadius('md'),
  large: brandRadius('lg'),
};

export const hourOfAiDesignTokens: DesignTokensDefinition = {
  color: brandColor,
  border: brandBorderPreset,
  borderRadius: brandBorderRadius,
};
