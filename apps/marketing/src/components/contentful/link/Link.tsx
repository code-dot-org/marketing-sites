import OpenInNew from '@mui/icons-material/OpenInNew';
import MuiLink from '@mui/material/Link';
import {useTheme} from '@mui/material/styles';
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
import {externalLinkIconProps} from '@/components/common/constants';
import {
  ComponentSize,
  RemoveMarginBottomProps,
} from '@/components/common/types';
import {useSectionBackground} from '@/components/contentful/section/SectionBackgroundContext';

type IconPosition = 'left' | 'right';
type Hierarchy = 'color' | 'black' | 'white';
type ResolvedSize = 'xs' | 's' | 'm' | 'l';

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
  /** Whether to render the link text in bold. Honored on csforall; ignored on code.org (Brand Links always Bold 700). */
  isStrong?: boolean;
  /** FontAwesome icon name (e.g. "arrow-right"). Suppressed when isLinkExternal is true. */
  icon?: string;
  /** Side to render the icon on. Defaults to right. */
  iconPosition?: IconPosition;
  /** Loading state (Brand Link). Renders a spinner alongside the label; label remains visible. */
  isPending?: boolean;
  /** Suppress the default underline on this link instance. */
  disableUnderline?: boolean;
  /** Render as an inline link inheriting the surrounding paragraph's font-family / font-size / line-height (used by RichText hyperlinks). */
  inline?: boolean;
  /** Aria label for the link */
  ariaLabel?: EntryFields.Text;
  /** Custom classname */
  className?: string | object;
};

// FR-029: accepts the `default` legacy alias not in the current BrandColor union.
const resolveHierarchy = (color: BrandColor | string): Hierarchy => {
  if (color === 'primary' || color === 'purplePrimary') return 'color';
  if (color === 'black') return 'black';
  if (color === 'default') return 'black';
  if (color === 'white') return 'white';
  return 'color';
};

const resolveBrandSize = (size: ComponentSize): ResolvedSize =>
  size === 'xs' ? 's' : size;

// `white` Hierarchy bypasses the contrast switch.
const applyContrastSwitch = (
  hierarchy: Hierarchy,
  enclosingBackground: EnclosingBackground,
): Hierarchy => {
  if (hierarchy === 'white') return 'white';
  const resolved = resolveTextColorForBackground(
    'primary',
    enclosingBackground,
  ).value;
  return resolved === 'white' ? 'white' : hierarchy;
};

const resolveLegacyLinkColor = (
  color: BrandColor,
  enclosingBackground: EnclosingBackground,
): string => {
  if (color === 'primary') {
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
  isPending = false,
  disableUnderline = false,
  inline = false,
  removeMarginBottom,
  ariaLabel,
  className,
}) => {
  const theme = useTheme();
  const enclosingBackground = useSectionBackground();

  // Tenant discriminator: code.org uses Geist, csforall uses Roboto Mono.
  const isBrandTenant = String(theme.typography.fontFamily).includes('Geist');

  const userIcon =
    !isLinkExternal && icon ? (
      <FontAwesomeV6Icon iconName={icon} iconStyle="solid" />
    ) : null;

  if (isBrandTenant) {
    const baseHierarchy = resolveHierarchy(color);
    const renderedHierarchy = applyContrastSwitch(
      baseHierarchy,
      enclosingBackground,
    );
    const renderedSize = resolveBrandSize(size);

    return (
      <MuiLink
        // Inline mode skips the `link--size-*` typography hook (FR for RichText).
        className={classNames(
          !inline && `link--size-${renderedSize}`,
          className,
        )}
        data-hierarchy={renderedHierarchy}
        data-loading={isPending ? 'true' : undefined}
        data-disable-underline={disableUnderline ? 'true' : undefined}
        data-inline={inline ? 'true' : undefined}
        href={href}
        aria-label={ariaLabel}
        target={isLinkExternal ? '_blank' : undefined}
        rel={isLinkExternal ? 'noopener noreferrer' : undefined}
        sx={{
          marginBottom: removeMarginBottom ? 0 : undefined,
          ...styles.container,
        }}
      >
        {userIcon && iconPosition === 'left' && userIcon}
        <span>{children}</span>
        {userIcon && iconPosition === 'right' && userIcon}
        {isLinkExternal && <FontAwesomeV6Icon {...externalLinkIconProps} />}
        {isPending && (
          <FontAwesomeV6Icon
            iconName="spinner"
            iconStyle="solid"
            animationType="spin"
          />
        )}
      </MuiLink>
    );
  }

  // csforall-legacy render path.
  return (
    <MuiLink
      className={classNames(`link--size-${size}`, className)}
      href={href}
      aria-label={ariaLabel}
      target={isLinkExternal ? '_blank' : undefined}
      rel={isLinkExternal ? 'noopener noreferrer' : undefined}
      sx={{
        color: resolveLegacyLinkColor(color, enclosingBackground),
        fontWeight: isStrong ? 600 : 500,
        marginBottom: removeMarginBottom ? 0 : undefined,
        textDecoration: 'none',
        ...styles.container,
      }}
    >
      {userIcon && iconPosition === 'left' && userIcon}
      <span
        style={disableUnderline ? undefined : {textDecoration: 'underline'}}
      >
        {children}
      </span>
      {userIcon && iconPosition === 'right' && userIcon}
      {isLinkExternal && <OpenInNew fontSize="inherit" />}
    </MuiLink>
  );
};

export default Link;
