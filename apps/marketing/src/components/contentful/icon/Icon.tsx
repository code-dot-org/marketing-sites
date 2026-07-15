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
import {RemoveMarginBottomProps} from '@/components/common/types';
import {useSectionBackground} from '@/components/contentful/section/SectionBackgroundContext';

export type IconBackgroundFill = 'none' | 'filled' | 'outline';
export type IconBackgroundShape = 'circle' | 'square';

// Bottom-margin rhythm shared with Heading/Paragraph. Toggleable off via the
// Design-tab checkbox (removeMarginBottom).
const MARGIN_BOTTOM = 'calc(2 * var(--mui-spacing))';

export type IconProps = Partial<RemoveMarginBottomProps> & {
  iconName: string;
  color?: BrandColor;
  backgroundFill?: IconBackgroundFill;
  backgroundShape?: IconBackgroundShape;
  backgroundColor?: BrandColor;
  iconSize?: number;
  className?: string;
};

// Shape outer dimension is 1.75 × the icon size — gives the icon comfortable
// padding without dwarfing it. Constants are Icon-local on purpose; they're
// shape geometry, not brand tokens.
const SHAPE_RATIO = 1.75;
const SQUARE_RADIUS = '25%';
const OUTLINE_WIDTH = 3;

const Icon: React.FC<IconProps> = ({
  iconName,
  color = 'purplePrimary',
  backgroundFill = 'none',
  backgroundShape = 'circle',
  backgroundColor = 'gray1',
  iconSize = 24,
  removeMarginBottom = false,
  className,
}) => {
  const marginBottom = removeMarginBottom ? undefined : MARGIN_BOTTOM;
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
    return (
      <span
        className={className}
        style={{display: 'inline-block', marginBottom}}
      >
        {glyph}
      </span>
    );
  }

  const outerSize = iconSize * SHAPE_RATIO;
  const bg = cssVarForBrandColor(backgroundColor);
  const borderRadius = backgroundShape === 'circle' ? '50%' : SQUARE_RADIUS;

  return (
    <Box
      className={classNames(className)}
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom,
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
