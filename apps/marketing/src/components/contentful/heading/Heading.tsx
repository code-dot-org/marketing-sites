import Typography from '@mui/material/Typography';
import {ReactNode} from 'react';

import {
  BrandColor,
  resolvedCssVarForBrandColor,
} from '@/components/common/colors';
import {RemoveMarginBottomProps} from '@/components/common/types';
import {useSectionBackground} from '@/components/contentful/section/SectionBackgroundContext';
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

type HeadingTextTransform = 'none' | 'uppercase' | 'lowercase' | 'capitalize';

export type HeadingProps = RemoveMarginBottomProps & {
  /** Heading content */
  children: ReactNode;
  /** Heading visual appearance */
  visualAppearance: HeadingVisualAppearance;
  /** Heading color */
  color?: BrandColor;
  /** ClassName passed by Contentful to apply styles
   * that are set through Contentful native editor */
  className?: string;
  /** rem override */
  fontSize?: number;
  /** Unitless line-height override */
  lineHeight?: number;
  /** Weight override */
  fontWeight?: '500' | '700';
  /** Hex color override */
  colorOverride?: string;
  /** Font kerning override */
  fontKerning?: 'auto' | 'normal' | 'none';
  /** Text-case transform; 'none' is treated as unset */
  textTransform?: HeadingTextTransform;
  /** Stacking order. Applies with position: relative so the value is honored. */
  zIndex?: string;
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

// Fluid per-level default size: scales from mobile min to desktop max.
const HEADING_RESPONSIVE_SIZE: Record<HeadingVisualAppearance, string> = {
  'heading-xxl': 'clamp(2.5rem, 5vw + 1rem, 4rem)',
  'heading-xl': 'clamp(2rem, 4vw + 0.5rem, 3rem)',
  'heading-lg': 'clamp(1.5rem, 3vw + 0.25rem, 2rem)',
  'heading-md': 'clamp(1.25rem, 2vw + 0.25rem, 1.75rem)',
  'heading-sm': 'clamp(1.125rem, 1.5vw + 0.5rem, 1.5rem)',
  'heading-xs': 'clamp(1rem, 1vw + 0.5rem, 1.25rem)',
};

const Heading: React.FunctionComponent<HeadingProps> = ({
  children,
  visualAppearance,
  color = 'black',
  removeMarginBottom,
  className,
  fontSize,
  lineHeight,
  fontWeight,
  colorOverride,
  fontKerning,
  textTransform = 'none',
  zIndex,
}) => {
  const tag = visualAppearanceToSemanticTagMap[visualAppearance];
  const enclosingBackground = useSectionBackground();

  const sx = {
    fontFamily: `"${SPACE_GROTESK_FONT}", sans-serif`,
    fontSize:
      fontSize !== undefined
        ? `${fontSize}rem`
        : HEADING_RESPONSIVE_SIZE[visualAppearance],
    lineHeight: lineHeight ?? 1,
    fontWeight: fontWeight ? Number(fontWeight) : 500,
    // colorOverride wins over the contrast switch (FR-014).
    color:
      colorOverride || resolvedCssVarForBrandColor(color, enclosingBackground),
    fontKerning: fontKerning ?? 'normal',
    ...(textTransform !== 'none' && {textTransform}),
    ...(zIndex && {position: 'relative', zIndex}),
  };

  return (
    <Typography
      className={className}
      component={tag}
      variant={tag}
      gutterBottom={!removeMarginBottom}
      sx={sx}
    >
      {children}
    </Typography>
  );
};

export default Heading;
