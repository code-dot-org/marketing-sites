/**
 * This file contains constants that are used across the component library
 */

import {ComponentSizeXSToL, DropdownColor, TextScaleSize} from '@/common/types';
import {FontAwesomeV6IconProps} from '@/fontAwesomeV6Icon';
import {VisualAppearance} from '@/typography';

/**
 *  This is the map of component size to body text size (visualAppearance)
 */
export const componentSizeToBodyTextSizeMap: {
  [key in ComponentSizeXSToL]: VisualAppearance;
} = {
  l: 'body-one',
  m: 'body-two',
  s: 'body-three',
  xs: 'body-four',
};

/**
 * Maps the SimpleList Text-scale size token to the DSCO Typography
 * `visualAppearance` value (spec 009 amendment-5). Text cells xs/sm/md/lg
 * map to the existing body1–body4 variants; larger cells (xl/2xl/3xl/4xl)
 * map to body-one as a fallback; the SCSS class for the cell overrides the
 * label `font-size` via `--font-size-text-*` CSS variables.
 */
export const textScaleSizeToBodyTextSizeMap: {
  [key in TextScaleSize]: VisualAppearance;
} = {
  'text-xs': 'body-four',
  'text-sm': 'body-three',
  'text-md': 'body-two',
  'text-lg': 'body-one',
  'text-xl': 'body-one',
  'text-2xl': 'body-one',
  'text-3xl': 'body-one',
  'text-4xl': 'body-one',
};

export const dropdownColors: {[key in DropdownColor]: DropdownColor} = {
  white: 'white',
  black: 'black',
  gray: 'gray',
};

export const externalLinkIconProps: FontAwesomeV6IconProps = {
  iconName: 'up-right-from-square',
  iconStyle: 'solid',
};
