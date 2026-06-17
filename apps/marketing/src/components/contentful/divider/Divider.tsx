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
  className,
}) => {
  const legacy = isLegacyDividerColor(color);
  return (
    <MuiDivider
      className={classNames(
        legacy && `divider--color-${color}`,
        `divider--margin-${margin}`,
        className,
      )}
      orientation="horizontal"
      variant="fullWidth"
      flexItem
      sx={
        legacy
          ? undefined
          : {borderColor: cssVarForBrandColor(color as BrandColor)}
      }
    />
  );
};

export default Divider;
