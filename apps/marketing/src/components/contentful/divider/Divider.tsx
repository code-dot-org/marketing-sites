import MuiDivider from '@mui/material/Divider';
import classNames from 'classnames';
import React, {HTMLAttributes} from 'react';

import {BrandColor, cssVarForBrandColor} from '@/components/common/colors';
import type {SpacingProps} from '@/components/common/types';

// Legacy Divider color values, kept so existing Contentful entries continue
// to render via the original `.divider--color-{value}` CSS classes in
// `apps/marketing/src/themes/code.org/styleOverrides/divider.ts`. The Studio
// dropdown labels these as "Primary (legacy)" etc. and groups them at the
// bottom of the color list.
const DIVIDER_LEGACY_COLORS = ['primary', 'strong', 'white'] as const;
export type DividerLegacyColor = (typeof DIVIDER_LEGACY_COLORS)[number];

export type DividerProps = HTMLAttributes<HTMLElement> & {
  /** Divider color — accepts any CodeAI brand color value, or one of the
   * three legacy values (`primary`, `strong`, `white`) that render via the
   * existing class-based theme overrides. */
  color?: DividerLegacyColor | BrandColor;
  /** Divider margin */
  margin?: keyof SpacingProps;
  /** Divider direction. Vertical relies on `flexItem` stretching, so it only
   * shows inside row-direction flex containers. */
  direction?: 'horizontal' | 'vertical';
  /** Divider line thickness — small is 1px, medium is 2px */
  width?: 'small' | 'medium';
  /** Divider custom className */
  className?: string;
};

const isLegacyDividerColor = (
  value: DividerLegacyColor | BrandColor,
): value is DividerLegacyColor =>
  (DIVIDER_LEGACY_COLORS as readonly string[]).includes(value);

const Divider: React.FC<DividerProps> = ({
  color = 'primary',
  margin = 'm',
  direction = 'horizontal',
  width = 'small',
  className,
}) => {
  const legacy = isLegacyDividerColor(color);
  const vertical = direction === 'vertical';
  const sx = {
    ...(legacy ? {} : {borderColor: cssVarForBrandColor(color as BrandColor)}),
    // Small adds nothing: MUI's default `thin` border stays as-is. Vertical
    // dividers draw their line on the right border in MUI.
    ...(width === 'medium'
      ? {[vertical ? 'borderRightWidth' : 'borderBottomWidth']: '2px'}
      : {}),
  };
  return (
    <MuiDivider
      className={classNames(
        legacy && `divider--color-${color}`,
        `divider--margin-${margin}`,
        vertical && 'divider--vertical',
        className,
      )}
      orientation={direction}
      variant="fullWidth"
      flexItem
      sx={Object.keys(sx).length ? sx : undefined}
    />
  );
};

export default Divider;
