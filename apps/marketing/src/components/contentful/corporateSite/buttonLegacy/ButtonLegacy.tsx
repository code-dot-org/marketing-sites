// This Button component is used specifically on Code.org
import Typography from '@mui/material/Typography';
import {EntryFields} from 'contentful';
import React, {useMemo} from 'react';

import {
  ButtonColor,
  ButtonSize,
  ButtonType,
  LinkButton,
} from '@code-dot-org/component-library/button';
import {FontAwesomeV6IconProps} from '@code-dot-org/component-library/fontAwesomeV6Icon';

import {
  externalLinkIconProps,
  fontAwesomeV6BrandIconsMap,
} from '@/components/common/constants';

type ButtonProps = {
  /** Button text */
  text?: string;
  /** Button color */
  color: Extract<ButtonColor, 'purple' | 'black' | 'white'>;
  /** Button type (semantic) */
  type: Extract<ButtonType, 'primary' | 'secondary' | 'tertiary'>;
  /** Button size — Brand Buttons scale `s` / `m` / `l` / `xl` (default `m`). */
  size?: ButtonSize;
  /** Button link href */
  href?: string;
  /** Whether Link is for internal pages, or external web page. (external links are opened in new tab) */
  isLinkExternal?: boolean;
  /** Button left icon name (Font Awesome) */
  iconLeftName?: string;
  /** Button right icon name (Font Awesome). When set, takes precedence over the external-link fallback icon. */
  iconRightName?: string;
  /** Render as a square icon-only button. Hides text; uses `iconLeftName` as the glyph. */
  isIconOnly?: boolean;
  /** Aria label for the button */
  ariaLabel?: EntryFields.Text;
};

const buildIcon = (
  iconName: string | undefined,
): FontAwesomeV6IconProps | undefined => {
  if (!iconName) return undefined;
  return {
    iconName,
    iconStyle: 'solid',
    iconFamily: fontAwesomeV6BrandIconsMap.has(iconName) ? 'brands' : undefined,
  };
};

const Button: React.FunctionComponent<ButtonProps> = ({
  text,
  color,
  type,
  size = 'm',
  href,
  isLinkExternal = false,
  ariaLabel,
  iconLeftName,
  iconRightName,
  isIconOnly = false,
}) => {
  const authorIconLeft = useMemo(() => buildIcon(iconLeftName), [iconLeftName]);
  const authorIconRight = useMemo(
    () => buildIcon(iconRightName),
    [iconRightName],
  );

  // FR-019: author right icon wins; external-link icon is the fallback.
  const effectiveIconRight =
    authorIconRight ?? (isLinkExternal ? externalLinkIconProps : undefined);

  const sharedProps = {
    size,
    href,
    target: isLinkExternal ? '_blank' : '_self',
    type,
    color,
    ariaLabel,
  } as const;

  // "Icon only" needs a glyph — GenericButton throws without one, which
  // crashes the experience builder. Until the author fills in Left Icon
  // Name, fall back to the regular text button below.
  if (isIconOnly && authorIconLeft) {
    return (
      <LinkButton
        {...sharedProps}
        isIconOnly
        icon={authorIconLeft}
        // Icon-only buttons have no visible text, so the hidden text is the
        // fallback accessible name (same pattern as Badge).
        ariaLabel={ariaLabel || text}
      />
    );
  }

  // GenericButton also throws when text is missing on a regular button —
  // show the editor placeholder instead (same pattern as Image/RichText).
  if (!text) {
    return (
      <Typography variant="body3" sx={{color: 'var(--text-neutral-primary)'}}>
        <em>
          <strong>🔘 Button placeholder.</strong> Add button "Text", or set a
          "Left Icon Name" to use "Icon Only".
        </em>
      </Typography>
    );
  }

  return (
    <LinkButton
      {...sharedProps}
      text={text}
      iconLeft={authorIconLeft}
      iconRight={effectiveIconRight}
    />
  );
};

export default Button;
