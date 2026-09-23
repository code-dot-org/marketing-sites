// Presets for Contentful Studio's design panel. Values must stay
// whitespace-free — the SDK's token resolver splits on spaces.
import {DesignTokensDefinition} from '@contentful/experiences-core/types';

import {brandRadius} from '@/themes/common/radius';

const brandBorderRadius = {
  none: brandRadius('none'),
  small: brandRadius('sm'),
  medium: brandRadius('md'),
  large: brandRadius('lg'),
};

export const hourOfAiDesignTokens: DesignTokensDefinition = {
  borderRadius: brandBorderRadius,
};
