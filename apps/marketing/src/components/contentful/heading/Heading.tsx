import Typography from '@mui/material/Typography';
import {ReactNode} from 'react';

import {RemoveMarginBottomProps} from '@/components/common/types';
import {SPACE_GROTESK_FONT} from '@/themes/code.org/constants/fonts';

type HeadingSemanticTag = 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';

// Existing Contentful Heading visualAppearance values that
// were set before using the MUI Typography component.
type HeadingVisualAppearance =
  | 'heading-xxl'
  | 'heading-xl'
  | 'heading-lg'
  | 'heading-md'
  | 'heading-sm'
  | 'heading-xs';

export type HeadingProps = RemoveMarginBottomProps & {
  /** Heading content */
  children: ReactNode;
  /** Heading visual appearance */
  visualAppearance: HeadingVisualAppearance;
  /** Heading color */
  color?: 'primary' | 'white';
  /** ClassName passed by Contentful to apply styles
   * that are set through Contentful native editor */
  className?: string;
  /** Opt this heading into the Space Grotesk alt style. */
  useAltFont?: boolean;
  /** rem override; only used when useAltFont is true. */
  fontSize?: number;
  /** Unitless line-height override; only used when useAltFont is true. */
  lineHeight?: number;
  /** Weight override; only used when useAltFont is true. */
  fontWeight?: '500' | '700';
  /** Hex color override; only used when useAltFont is true. */
  colorOverride?: string;
  /** Font kerning override; only used when useAltFont is true. */
  fontKerning?: 'auto' | 'normal' | 'none';
};

// Maps Contentful Heading visualAppearance values with
// MUI Typography `component` and `variant` prop values.
const visualAppearanceToSemanticTagMap: Record<
  HeadingVisualAppearance,
  HeadingSemanticTag
> = {
  'heading-xxl': 'h1',
  'heading-xl': 'h2',
  'heading-lg': 'h3',
  'heading-md': 'h4',
  'heading-sm': 'h5',
  'heading-xs': 'h6',
};

// Per-level fluid default applied only when the alt font is on and
// no explicit fontSize is given. Scales from mobile min to desktop max.
const ALT_FONT_RESPONSIVE_SIZE: Record<HeadingVisualAppearance, string> = {
  'heading-xxl': 'clamp(2.5rem, 5vw + 1rem, 4rem)',
  'heading-xl': 'clamp(2rem, 4vw + 0.5rem, 3rem)',
  'heading-lg': 'clamp(1.5rem, 3vw + 0.25rem, 2rem)',
  'heading-md': 'clamp(1.25rem, 2vw + 0.25rem, 1.75rem)',
  'heading-sm': 'clamp(1.125rem, 1.5vw + 0.5rem, 1.5rem)',
  'heading-xs': 'clamp(1rem, 1vw + 0.5rem, 1.25rem)',
};

const ALT_FONT_DEFAULT_COLOR = '#1F1976';

const Heading: React.FunctionComponent<HeadingProps> = ({
  children,
  visualAppearance,
  color,
  removeMarginBottom,
  className,
  useAltFont,
  fontSize,
  lineHeight,
  fontWeight,
  colorOverride,
  fontKerning,
}) => {
  const tag = visualAppearanceToSemanticTagMap[visualAppearance];

  if (useAltFont) {
    const altSx = {
      fontFamily: `${SPACE_GROTESK_FONT}, sans-serif`,
      fontSize:
        fontSize !== undefined
          ? `${fontSize}rem`
          : ALT_FONT_RESPONSIVE_SIZE[visualAppearance],
      lineHeight: lineHeight ?? 1,
      fontWeight: fontWeight ? Number(fontWeight) : 700,
      color: colorOverride || ALT_FONT_DEFAULT_COLOR,
      fontKerning: fontKerning ?? 'auto',
    };

    return (
      <Typography
        className={className}
        component={tag}
        variant={tag}
        gutterBottom={!removeMarginBottom}
        sx={altSx}
      >
        {children}
      </Typography>
    );
  }

  return (
    <Typography
      className={className}
      color={color}
      component={tag}
      variant={tag}
      gutterBottom={!removeMarginBottom}
    >
      {children}
    </Typography>
  );
};

export default Heading;
