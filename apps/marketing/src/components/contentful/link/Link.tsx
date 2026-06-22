import OpenInNew from '@mui/icons-material/OpenInNew';
import MuiLink from '@mui/material/Link';
import classNames from 'classnames';
import {EntryFields} from 'contentful';
import React, {ReactNode} from 'react';

import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';

import {
  BrandColor,
  cssVarForBrandColor,
  EnclosingBackground,
  resolveTextColorForBackground,
} from '@/components/common/colors';
import {
  ComponentSize,
  RemoveMarginBottomProps,
} from '@/components/common/types';
import {useSectionBackground} from '@/components/contentful/section/SectionBackgroundContext';

type IconPosition = 'left' | 'right';

export type LinkProps = RemoveMarginBottomProps & {
  /** Link Label */
  children: ReactNode;
  /** Link URL */
  href: string;
  /** Link color */
  color?: BrandColor;
  /** Link size */
  size?: ComponentSize;
  /** Whether Link is for internal code.org pages, or external web page. (external links are opened in new tab) */
  isLinkExternal: boolean;
  /** Whether to render the link text in bold */
  isStrong?: boolean;
  /** FontAwesome icon name (e.g. "arrow-right"). Suppressed when isLinkExternal is true. */
  icon?: string;
  /** Side to render the icon on. Defaults to right. */
  iconPosition?: IconPosition;
  /** Aria label for the link */
  ariaLabel?: EntryFields.Text;
  /** Custom classname */
  className?: string | object;
};

// Text Link's "Primary" intentionally diverges from Paragraph/Heading so links
// stay visually distinct from body copy.
const resolveLinkColor = (
  color: BrandColor,
  enclosingBackground: EnclosingBackground,
): string => {
  if (color === 'primary') {
    // Primary stays the brand purple on light/mid backgrounds for visual
    // distinctness, but routes through the contrast switch on dark CodeAI
    // backgrounds so links remain readable.
    const resolved = resolveTextColorForBackground(
      'primary',
      enclosingBackground,
    );
    return resolved.value === 'primary'
      ? 'var(--codeai-purple-primary)'
      : cssVarForBrandColor(resolved.value);
  }
  return cssVarForBrandColor(
    resolveTextColorForBackground(color, enclosingBackground).value,
  );
};

const styles = {
  container: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 0.5,
    'html[dir="rtl"] & svg': {
      transform: 'scaleX(-1)',
    },
  },
};

const Link: React.FunctionComponent<LinkProps> = ({
  children,
  href,
  color = 'primary',
  size = 'm',
  isLinkExternal,
  isStrong = false,
  icon,
  iconPosition = 'right',
  removeMarginBottom,
  ariaLabel,
  className,
}) => {
  const userIcon =
    !isLinkExternal && icon ? (
      <FontAwesomeV6Icon iconName={icon} iconStyle="solid" />
    ) : null;
  const enclosingBackground = useSectionBackground();

  return (
    <MuiLink
      className={classNames(`link--size-${size}`, className)}
      href={href}
      aria-label={ariaLabel}
      target={isLinkExternal ? '_blank' : undefined}
      rel={isLinkExternal ? 'noopener noreferrer' : undefined}
      sx={{
        color: resolveLinkColor(color, enclosingBackground),
        fontWeight: isStrong ? 600 : 500,
        marginBottom: removeMarginBottom ? 0 : undefined,
        textDecoration: 'none',
        ...styles.container,
      }}
    >
      {userIcon && iconPosition === 'left' && userIcon}
      <span style={{textDecoration: 'underline'}}>{children}</span>
      {userIcon && iconPosition === 'right' && userIcon}
      {isLinkExternal && <OpenInNew fontSize="inherit" />}
    </MuiLink>
  );
};

export default Link;
