import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import {ReactNode} from 'react';

import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';

import {BrandColor} from '@/components/common/colors';
import {fontAwesomeV6BrandIconsMap} from '@/components/common/constants';
import {RemoveMarginBottomProps} from '@/components/common/types';
import {useSectionBackground} from '@/components/contentful/section/SectionBackgroundContext';
import type {SizeToken} from '@/themes/code.org/typography/tokens';

import {
  resolveCustomTextStyles,
  type CustomTextFontTrack,
  type CustomTextTag,
  type CustomTextTransform,
  type CustomTextType,
  type CustomTextWeight,
} from './resolveCustomTextStyles';

type Sentinel = 'default';

export type CustomTextProps = Partial<RemoveMarginBottomProps> & {
  /** Text content. */
  children: ReactNode;
  /** Preset supplying all default style values. Defaults to 'custom'. */
  type?: CustomTextType;
  /** Semantic element override. 'default' inherits the type's tag. */
  htmlTag?: CustomTextTag | Sentinel;
  /** Text color token. 'default' inherits the type's color (e.g. Overline →
   *  Gray 6). Contrast-switches vs. the Section background. */
  color?: BrandColor | Sentinel;
  /** Theme size step on the resolved track. 'default' inherits. */
  textSize?: SizeToken | Sentinel;
  /** Numeric font-size override in rem. Wins over the resolved size cell. */
  fontSize?: number;
  /** Unitless line-height override. Wins over the resolved size cell. */
  lineHeight?: number;
  /** Font track override. 'default' inherits. */
  font?: CustomTextFontTrack | Sentinel;
  /** Weight override. 'default' inherits. */
  fontWeight?: CustomTextWeight | Sentinel;
  /** Case transform. 'default' inherits the type default; 'none' forces none. */
  textTransform?: CustomTextTransform | Sentinel;
  /** Stacking order. Applies with position: relative so the value is honored. */
  zIndex?: string;
  /** Leading icon (Font Awesome name). Takes precedence over the right icon. */
  iconNameLeft?: string;
  /** Trailing icon (Font Awesome name). Ignored if a left icon is set. */
  iconNameRight?: string;
  /** ClassName injected by Contentful native styling (cfTextAlign/cfMaxWidth). */
  className?: string;
};

const CustomText: React.FunctionComponent<CustomTextProps> = ({
  children,
  type = 'custom',
  htmlTag,
  color,
  textSize,
  fontSize,
  lineHeight,
  font,
  fontWeight,
  textTransform,
  zIndex,
  iconNameLeft,
  iconNameRight,
  removeMarginBottom = false,
  className,
}) => {
  const enclosingBackground = useSectionBackground();
  const {tag, sx, resolvedColor, icon} = resolveCustomTextStyles({
    type,
    htmlTag,
    color,
    textSize,
    fontSize,
    lineHeight,
    font,
    fontWeight,
    textTransform,
    iconNameLeft,
    iconNameRight,
    enclosingBackground,
  });

  const glyph = icon ? (
    <FontAwesomeV6Icon
      iconName={icon.name}
      iconStyle="solid"
      iconFamily={
        fontAwesomeV6BrandIconsMap.has(icon.name) ? 'brands' : undefined
      }
      // currentColor → inherits the resolved text color (FR-009).
      style={{fontSize: '1em', color: 'inherit'}}
    />
  ) : null;

  const content = icon ? (
    <Box
      component="span"
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.5em',
        color: 'inherit',
      }}
    >
      {icon.side === 'left' && glyph}
      <span>{children}</span>
      {icon.side === 'right' && glyph}
    </Box>
  ) : (
    children
  );

  return (
    <Typography
      component={tag}
      variant="inherit"
      className={className}
      // Custom Text is always a standalone element. Rendering it block-level
      // makes it establish its own line box at the text's size, so the
      // surrounding container hugs the text instead of reserving the root
      // 16px inline strut above/below it.
      sx={{
        ...sx,
        color: resolvedColor,
        display: 'block',
        // Normalized bottom margin so authors don't need spacer elements.
        // Toggleable off via the Design-tab checkbox.
        ...(removeMarginBottom ? {} : {marginBottom: 'var(--mui-spacing)'}),
        ...(zIndex && {position: 'relative', zIndex}),
      }}
    >
      {content}
    </Typography>
  );
};

export default CustomText;
