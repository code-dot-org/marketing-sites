import Box from '@mui/material/Box';
import classNames from 'classnames';
import React from 'react';

import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';

import {
  BrandColor,
  cssVarForBrandColor,
  resolvedCssVarForBrandColor,
} from '@/components/common/colors';
import {fontAwesomeV6BrandIconsMap} from '@/components/common/constants';
import {useSectionBackground} from '@/components/contentful/section/SectionBackgroundContext';

export type IconBackgroundFill = 'none' | 'filled' | 'outline';
export type IconBackgroundShape = 'circle' | 'square';
// Stored value for backgroundColor: any universal BrandColor, OR the literal
// Icon-local Light Grey hex. Confined to this component — NOT added to the
// shared BRAND_COLORS manifest.
export const ICON_LIGHT_GREY = '#f6f6f6';
export type IconBackgroundColor = BrandColor | typeof ICON_LIGHT_GREY;

export interface IconProps {
  iconName: string;
  color?: BrandColor;
  backgroundFill?: IconBackgroundFill;
  backgroundShape?: IconBackgroundShape;
  backgroundColor?: IconBackgroundColor;
  iconSize?: number;
  className?: string;
}

// Shape outer dimension is 1.75 × the icon size — gives the icon comfortable
// padding without dwarfing it. Constants are Icon-local on purpose; they're
// shape geometry, not brand tokens.
const SHAPE_RATIO = 1.75;
const SQUARE_RADIUS = '25%';
const OUTLINE_WIDTH = 3;

const resolveBackground = (value: IconBackgroundColor): string =>
  value === ICON_LIGHT_GREY
    ? ICON_LIGHT_GREY
    : cssVarForBrandColor(value as BrandColor);

const Icon: React.FC<IconProps> = ({
  iconName,
  color = 'purplePrimary',
  backgroundFill = 'none',
  backgroundShape = 'circle',
  backgroundColor = ICON_LIGHT_GREY,
  iconSize = 32,
  className,
}) => {
  const enclosingBackground = useSectionBackground();
  // Contrast switch fires only when the icon sits "naked" on the Section
  // background. With a fill or outline, the icon's local background is
  // author-controlled and the chosen glyph color passes through.
  const glyphColor =
    backgroundFill === 'none'
      ? resolvedCssVarForBrandColor(color, enclosingBackground)
      : cssVarForBrandColor(color);

  const iconFamily = fontAwesomeV6BrandIconsMap.has(iconName)
    ? 'brands'
    : undefined;

  const glyph = (
    <FontAwesomeV6Icon
      iconName={iconName}
      iconStyle="solid"
      iconFamily={iconFamily}
      style={{fontSize: `${iconSize}px`, color: glyphColor}}
    />
  );

  if (backgroundFill === 'none') {
    return <span className={className}>{glyph}</span>;
  }

  const outerSize = iconSize * SHAPE_RATIO;
  const bg = resolveBackground(backgroundColor);
  const borderRadius = backgroundShape === 'circle' ? '50%' : SQUARE_RADIUS;

  return (
    <Box
      className={classNames(className)}
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: `${outerSize}px`,
        height: `${outerSize}px`,
        borderRadius,
        backgroundColor: backgroundFill === 'filled' ? bg : 'transparent',
        border:
          backgroundFill === 'outline'
            ? `${OUTLINE_WIDTH}px solid ${bg}`
            : 'none',
      }}
    >
      {glyph}
    </Box>
  );
};

export default Icon;
