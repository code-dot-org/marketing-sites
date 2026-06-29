import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import {ReactNode} from 'react';

import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';

import {BrandColor} from '@/components/common/colors';
import {fontAwesomeV6BrandIconsMap} from '@/components/common/constants';
import {useSectionBackground} from '@/components/contentful/section/SectionBackgroundContext';
import type {SizeToken} from '@/themes/code.org/typography/tokens';

import {
  resolveCustomTextStyles,
  type CustomTextBackgroundFill,
  type CustomTextBackgroundShape,
  type CustomTextFontTrack,
  type CustomTextTag,
  type CustomTextTransform,
  type CustomTextType,
  type CustomTextWeight,
} from './resolveCustomTextStyles';

type Sentinel = 'default';

export type CustomTextProps = {
  /** Text content. */
  children: ReactNode;
  /** Preset supplying all default style values. Defaults to 'custom'. */
  type?: CustomTextType;
  /** Semantic element override. 'default' inherits the type's tag. */
  htmlTag?: CustomTextTag | Sentinel;
  /** Text color token. Contrast-switches vs. Section bg unless backgrounded. */
  color?: BrandColor;
  /** Background fill treatment. 'default' inherits; 'none' = no background. */
  backgroundFill?: CustomTextBackgroundFill | Sentinel;
  /** Background shape (border radius). 'default' inherits. */
  backgroundShape?: CustomTextBackgroundShape | Sentinel;
  /** Fill color token (used when fill is 'filled'). 'default' inherits. */
  backgroundColor?: BrandColor | Sentinel;
  /** Border color token. Used by filled/outline fills; width fixed at 1px. */
  borderColor?: BrandColor | Sentinel;
  /** Theme size step on the resolved track. 'default' inherits. */
  textSize?: SizeToken | Sentinel;
  /** Font track override. 'default' inherits. */
  font?: CustomTextFontTrack | Sentinel;
  /** Weight override. 'default' inherits. */
  fontWeight?: CustomTextWeight | Sentinel;
  /** Case transform. 'default' inherits the type default; 'none' forces none. */
  textTransform?: CustomTextTransform | Sentinel;
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
  backgroundFill,
  backgroundShape,
  backgroundColor,
  borderColor,
  textSize,
  font,
  fontWeight,
  textTransform,
  iconNameLeft,
  iconNameRight,
  className,
}) => {
  const enclosingBackground = useSectionBackground();
  const {tag, sx, resolvedColor, background, icon} = resolveCustomTextStyles({
    type,
    htmlTag,
    color,
    backgroundFill,
    backgroundShape,
    backgroundColor,
    borderColor,
    textSize,
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

  const text = (
    <Typography
      component={tag}
      variant="inherit"
      className={background ? undefined : className}
      // Custom Text is always a standalone element. Rendering the plain
      // (non-backgrounded) text as block-level makes it establish its own line
      // box at the text's size, so the surrounding container hugs the text
      // instead of reserving the root 16px inline strut above/below it.
      sx={{
        ...sx,
        color: resolvedColor,
        ...(background ? {} : {display: 'block'}),
      }}
    >
      {content}
    </Typography>
  );

  if (!background) {
    return text;
  }

  // Backgrounded chip: fill + 1px border + shape radius + padding wrap the text
  // run. inline-flex + center + line-height:1 makes the chip hug the actual
  // text line box (not the inherited 16px strut), so the shape isn't taller
  // than the glyph. fontSize is pinned to the text size so the em padding
  // (carried on `background`) tracks the text.
  return (
    <Box
      component="span"
      className={className}
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        lineHeight: 1,
        fontSize: sx.fontSize as string,
        ...background,
      }}
    >
      {text}
    </Box>
  );
};

export default CustomText;
