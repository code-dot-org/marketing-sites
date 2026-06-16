// Design tokens consumed by Contentful Studio's design panel. These populate
// the native Container/Section pickers (background color, border, border
// radius) with our brand-named options — no component override required.
import {DesignTokensDefinition} from '@contentful/experiences-core/types';

import {BRAND_COLORS} from '@/components/common/colors';

const brandColor = Object.fromEntries(
  BRAND_COLORS.map(({value, cssVar}) => [value, cssVar]),
);

// 2px solid preset per brand color. Authors can adjust width manually in the
// border picker once a preset is chosen.
const brandBorderPreset = Object.fromEntries(
  BRAND_COLORS.map(({value, cssVar}) => [
    value,
    {width: '2px', style: 'solid' as const, color: cssVar},
  ]),
);

export const codeOrgDesignTokens: DesignTokensDefinition = {
  color: brandColor,
  border: brandBorderPreset,
};
