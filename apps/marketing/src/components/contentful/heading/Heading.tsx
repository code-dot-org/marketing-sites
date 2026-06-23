import Typography from '@mui/material/Typography';
import {ReactNode} from 'react';

import {
  BrandColor,
  resolvedCssVarForBrandColor,
} from '@/components/common/colors';
import {RemoveMarginBottomProps} from '@/components/common/types';
import {useSectionBackground} from '@/components/contentful/section/SectionBackgroundContext';

import {
  resolveHeadingStyles,
  type HeadingAppearanceValue,
  type HeadingLevelValue,
} from './resolveHeadingStyles';

type HeadingTextTransform = 'none' | 'uppercase' | 'lowercase' | 'capitalize';

export type HeadingProps = RemoveMarginBottomProps & {
  /** Heading content */
  children: ReactNode;
  /**
   * "Heading Level" — selects the rendered <h*> semantic tag and seeds the
   * canonical role token (size, weight, line-height, letter-spacing,
   * per-breakpoint steps). Field name kept as `visualAppearance` for
   * Contentful back-compat with existing entries.
   */
  visualAppearance: HeadingLevelValue;
  /**
   * "Visual Appearance" (spec 009 US3) — orthogonal to the semantic tag.
   * `default` inherits the Heading Level's canonical role; `display-*` cells
   * override the size/weight/line-height/letter-spacing/per-breakpoint table
   * while preserving the chosen <h*> tag.
   */
  appearance?: HeadingAppearanceValue;
  /** Heading color */
  color?: BrandColor;
  /** ClassName passed by Contentful to apply styles
   * that are set through Contentful native editor */
  className?: string;
  /** rem override */
  fontSize?: number;
  /** Unitless line-height override */
  lineHeight?: number;
  /**
   * Weight override. `'default'` sentinel (or omitted) inherits the
   * Heading Level's canonical weight; numeric values override.
   */
  fontWeight?: 'default' | '400' | '500' | '600' | '700';
  /** Hex color override */
  colorOverride?: string;
  /** Font kerning override */
  fontKerning?: 'auto' | 'normal' | 'none';
  /** Text-case transform; 'none' is treated as unset */
  textTransform?: HeadingTextTransform;
  /** Stacking order. Applies with position: relative so the value is honored. */
  zIndex?: string;
};

const Heading: React.FunctionComponent<HeadingProps> = ({
  children,
  visualAppearance,
  appearance = 'default',
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
  const enclosingBackground = useSectionBackground();
  const {
    semanticTag,
    variantTag,
    sx: resolvedSx,
  } = resolveHeadingStyles({
    visualAppearance,
    appearance,
    fontSize,
    lineHeight,
    fontWeight,
    fontKerning,
    textTransform,
  });

  const sx = {
    ...resolvedSx,
    // colorOverride wins over the contrast switch (spec 006 FR-014).
    color:
      colorOverride || resolvedCssVarForBrandColor(color, enclosingBackground),
    ...(zIndex && {position: 'relative', zIndex}),
  };

  return (
    <Typography
      className={className}
      component={semanticTag}
      variant={variantTag}
      gutterBottom={!removeMarginBottom}
      sx={sx}
    >
      {children}
    </Typography>
  );
};

export default Heading;
