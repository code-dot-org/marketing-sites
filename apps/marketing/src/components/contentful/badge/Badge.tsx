'use client';

import {styled} from '@mui/material/styles';
import React from 'react';

import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';

import {backgroundToneFor} from '@/components/common/colors';
import {fontAwesomeV6BrandIconsMap} from '@/components/common/constants';
import {useSectionBackground} from '@/components/contentful/section/SectionBackgroundContext';
import {GEIST_FONT} from '@/themes/code.org/constants/fonts';
import {codeaiRadius} from '@/themes/code.org/constants/radius';
import {createFontStack} from '@/themes/common/constants';

export type BadgeColor =
  | 'black'
  | 'purple'
  | 'blue'
  | 'green'
  | 'orange'
  | 'pink';
export type BadgeSize = 'small' | 'medium' | 'large';
export type BadgeIconPosition = 'left' | 'right';
export type BadgeAppearance = 'auto' | 'light' | 'dark';

export interface BadgeProps {
  /** Badge label text */
  text?: string;
  /** Font Awesome icon name */
  iconName?: string;
  /** Accessible name — required for icon-only badges */
  ariaLabel?: string;
  /** Badge color family */
  color?: BadgeColor;
  /** Badge size */
  size?: BadgeSize;
  /** Which side of the text the icon renders on */
  iconPosition?: BadgeIconPosition;
  /** Render a circular icon-only badge; text is hidden */
  isIconOnly?: boolean;
  /** Variant override — 'auto' derives it from the enclosing Section tone */
  appearance?: BadgeAppearance;
  /** Custom classname */
  className?: string;
}

type BadgeVariant = 'light' | 'dark';

// Light variant (light bg + dark text) is for dark sections; dark variant
// (primary bg + white text) is for light sections. Black rides the gray ramp.
const BADGE_PALETTE: Record<
  BadgeColor,
  Record<BadgeVariant, {background: string; text: string}>
> = {
  black: {
    light: {background: 'var(--codeai-gray-1)', text: 'var(--codeai-gray-8)'},
    dark: {background: 'var(--codeai-gray-8)', text: '#ffffff'},
  },
  purple: {
    light: {
      background: 'var(--codeai-purple-light)',
      text: 'var(--codeai-purple-dark)',
    },
    dark: {background: 'var(--codeai-purple-primary)', text: '#ffffff'},
  },
  blue: {
    light: {
      background: 'var(--codeai-blue-light)',
      text: 'var(--codeai-blue-dark)',
    },
    dark: {background: 'var(--codeai-blue-primary)', text: '#ffffff'},
  },
  green: {
    light: {
      background: 'var(--codeai-green-light)',
      text: 'var(--codeai-green-dark)',
    },
    dark: {background: 'var(--codeai-green-primary)', text: '#ffffff'},
  },
  orange: {
    light: {
      background: 'var(--codeai-orange-light)',
      text: 'var(--codeai-orange-dark)',
    },
    dark: {background: 'var(--codeai-orange-primary)', text: '#ffffff'},
  },
  pink: {
    light: {
      background: 'var(--codeai-pink-light)',
      text: 'var(--codeai-pink-dark)',
    },
    dark: {background: 'var(--codeai-pink-primary)', text: '#ffffff'},
  },
};

// Figma badge metrics. The icon glyph is 12px at every size — only padding
// scales. `textSidePadding` is one step wider than `iconSidePadding` on
// medium, matching the design's asymmetric pill. Icon-only padding yields
// square 22/24/28px boxes around the 12px glyph.
const ICON_SIZE_PX = 12;
const SIZE_METRICS: Record<
  BadgeSize,
  {
    fontSize: string;
    lineHeight: string;
    paddingBlock: string;
    textSidePadding: string;
    iconSidePadding: string;
    iconOnlyPadding: string;
  }
> = {
  small: {
    fontSize: '12px',
    lineHeight: '18px',
    paddingBlock: '2px',
    textSidePadding: '8px',
    iconSidePadding: '8px',
    iconOnlyPadding: '5px',
  },
  medium: {
    fontSize: '14px',
    lineHeight: '20px',
    paddingBlock: '2px',
    textSidePadding: '10px',
    iconSidePadding: '8px',
    iconOnlyPadding: '6px',
  },
  large: {
    fontSize: '14px',
    lineHeight: '20px',
    paddingBlock: '4px',
    textSidePadding: '12px',
    iconSidePadding: '12px',
    iconOnlyPadding: '8px',
  },
};

interface BadgeOwnerState {
  variant: BadgeVariant;
  color: BadgeColor;
  size: BadgeSize;
  iconPosition: BadgeIconPosition;
  hasIcon: boolean;
  isIconOnly: boolean;
}

const BadgeRoot = styled('span', {
  shouldForwardProp: prop => prop !== 'ownerState',
})<{ownerState: BadgeOwnerState}>(({ownerState}) => {
  const {background, text} =
    BADGE_PALETTE[ownerState.color][ownerState.variant];
  const metrics = SIZE_METRICS[ownerState.size];

  // Logical inline padding keyed to the icon slot so RTL flips for free.
  const padding = ownerState.isIconOnly
    ? {padding: metrics.iconOnlyPadding}
    : {
        paddingBlock: metrics.paddingBlock,
        paddingInlineStart:
          ownerState.hasIcon && ownerState.iconPosition === 'left'
            ? metrics.iconSidePadding
            : metrics.textSidePadding,
        paddingInlineEnd:
          ownerState.hasIcon && ownerState.iconPosition === 'right'
            ? metrics.iconSidePadding
            : metrics.textSidePadding,
      };

  return {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
    fontFamily: createFontStack(GEIST_FONT),
    fontWeight: 600,
    fontSize: metrics.fontSize,
    lineHeight: metrics.lineHeight,
    whiteSpace: 'nowrap',
    borderRadius: ownerState.isIconOnly
      ? '9999px'
      : codeaiRadius('sm', '0.5rem'),
    backgroundColor: background,
    color: text,
    ...padding,
  };
});

const Badge: React.FC<BadgeProps> = ({
  text,
  iconName,
  ariaLabel,
  color = 'purple',
  size = 'medium',
  iconPosition = 'left',
  isIconOnly = false,
  appearance = 'auto',
  className,
}) => {
  const enclosingBackground = useSectionBackground();

  // 'auto' shows the light variant only on dark sections; light/mid/white,
  // transparent, and page-root backgrounds all get the dark variant.
  const variant: BadgeVariant =
    appearance !== 'auto'
      ? appearance
      : enclosingBackground &&
          enclosingBackground !== 'transparent' &&
          backgroundToneFor(enclosingBackground) === 'dark'
        ? 'light'
        : 'dark';

  const icon = iconName ? (
    <FontAwesomeV6Icon
      iconName={iconName}
      iconStyle="solid"
      iconFamily={
        fontAwesomeV6BrandIconsMap.has(iconName) ? 'brands' : undefined
      }
      style={{fontSize: `${ICON_SIZE_PX}px`}}
      aria-hidden="true"
    />
  ) : undefined;

  // Icon-only needs the icon to exist; otherwise fall back to a text badge.
  const iconOnly = isIconOnly && Boolean(icon);

  return (
    <BadgeRoot
      className={className}
      ownerState={{
        variant,
        color,
        size,
        iconPosition,
        hasIcon: Boolean(icon),
        isIconOnly: iconOnly,
      }}
      role={iconOnly ? 'img' : undefined}
      aria-label={iconOnly ? ariaLabel || text : ariaLabel}
    >
      {iconOnly ? (
        icon
      ) : (
        <>
          {iconPosition === 'left' && icon}
          {text}
          {iconPosition === 'right' && icon}
        </>
      )}
    </BadgeRoot>
  );
};

export default Badge;
