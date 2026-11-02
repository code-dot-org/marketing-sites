import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import {Fragment, ReactNode} from 'react';

import {BrandColor} from '@/components/common/colors';
import {RemoveMarginBottomProps} from '@/components/common/types';
import {useSectionBackground} from '@/components/contentful/section/SectionBackgroundContext';
import {
  resolvedTextCssVar,
  useBrandColors,
} from '@/themes/common/colors/brandColors';
import {useTypographyTokens} from '@/themes/common/typography/typographyTokens';

import {
  resolveHeadingStyles,
  type HeadingAppearanceValue,
  type HeadingLevelValue,
} from './resolveHeadingStyles';
import {splitAccent} from './splitAccent';

type HeadingTextTransform = 'none' | 'uppercase' | 'lowercase' | 'capitalize';

type HeadingAccentLineBreak = 'off' | 'always' | 'desktop';

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
  /**
   * Color for `*marked*` runs in string content. `'none'` (default) leaves
   * the content untouched, markers included.
   */
  accentColor?: BrandColor | 'none';
  /** Line break at each color change; `'desktop'` breaks at md (900px) up. */
  accentLineBreak?: HeadingAccentLineBreak;
};

const renderAccent = (
  text: string,
  accentCssColor: string,
  lineBreak: HeadingAccentLineBreak,
) =>
  splitAccent(text).map((segment, index, segments) => {
    const colorChanges =
      index > 0 && segments[index - 1].accent !== segment.accent;

    return (
      <Fragment key={index}>
        {colorChanges && lineBreak !== 'off' && (
          <Box
            component="br"
            sx={
              lineBreak === 'desktop'
                ? theme => ({
                    display: 'none',
                    [theme.breakpoints.up('md')]: {display: 'inline'},
                  })
                : undefined
            }
          />
        )}
        {segment.accent ? (
          <Box component="span" sx={{color: accentCssColor}}>
            {segment.text}
          </Box>
        ) : (
          segment.text
        )}
      </Fragment>
    );
  });

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
  accentColor = 'none',
  accentLineBreak = 'off',
}) => {
  const enclosingBackground = useSectionBackground();
  const brandColors = useBrandColors();
  const typographyTokens = useTypographyTokens();
  const {
    semanticTag,
    variantTag,
    sx: resolvedSx,
  } = resolveHeadingStyles(
    {
      visualAppearance,
      appearance,
      fontSize,
      lineHeight,
      fontWeight,
      fontKerning,
      textTransform,
    },
    typographyTokens,
  );

  const sx = {
    ...resolvedSx,
    // colorOverride wins over the contrast switch (spec 006 FR-014).
    color:
      colorOverride ||
      resolvedTextCssVar(brandColors, color, enclosingBackground),
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
      {accentColor !== 'none' && typeof children === 'string'
        ? renderAccent(
            children,
            resolvedTextCssVar(brandColors, accentColor, enclosingBackground),
            accentLineBreak,
          )
        : children}
    </Typography>
  );
};

export default Heading;
