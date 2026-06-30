// Custom Text style resolution (spec 010).
//
// Precedence, mirroring resolveHeadingStyles:
//   1. Type default — the chosen Custom Text type seeds tag, font track,
//      size, weight, line-height, color, text-transform, and the background
//      treatment (fill / shape / fill color / border color).
//   2. Individual override fields — each set field overrides ONLY its own
//      dimension. A `'default'` sentinel (or `undefined`/'') inherits the
//      type default.
//   3. Background / contrast rule — the background FILL selection (not the
//      color) decides whether the element is backgrounded. When fill is not
//      'none' the contrast switch is bypassed (color applied directly) and a
//      fixed 1px border is emitted (filled adds the fill color; outline keeps
//      a transparent interior) — mirroring the Icon component. With fill
//      'none' the text color contrast-switches against the enclosing Section
//      background.

import {
  BrandColor,
  EnclosingBackground,
  cssVarForBrandColor,
  resolvedCssVarForBrandColor,
} from '@/components/common/colors';
import {
  CODE_ORG_DISPLAY_FONT_STACK,
  CODE_ORG_TEXT_FONT_STACK,
} from '@/themes/code.org/typography/fontStack';
import {
  SCALE_DISPLAY,
  SCALE_TEXT,
  WEIGHTS,
  type ScaleCell,
  type SizeToken,
  type TypographicTrack,
  type WeightToken,
} from '@/themes/code.org/typography/tokens';

export type CustomTextType =
  | 'custom'
  | 'subtitle'
  | 'overline'
  | 'statistic'
  | 'courseTopics'
  | 'courseLabs';

// Only <span> and <p> are supported. <span> is the default for every type
// except Subtitle, which uses <p>.
export type CustomTextTag = 'span' | 'p';
export type CustomTextFontTrack = TypographicTrack; // 'text' | 'display'
export type CustomTextTransform =
  | 'none'
  | 'uppercase'
  | 'lowercase'
  | 'capitalize';
export type CustomTextWeight = '400' | '500' | '600' | '700';
export type CustomTextBackgroundFill = 'none' | 'filled' | 'outline';
export type CustomTextBackgroundShape = 'pill' | 'roundedSquare';

// `'default'` is the Studio sentinel meaning "inherit the type default".
type Sentinel = 'default' | '';

interface CustomTextDefault {
  tag: CustomTextTag;
  track: CustomTextFontTrack;
  size: SizeToken;
  weight: WeightToken;
  color: BrandColor;
  textTransform: CustomTextTransform;
  // Unset → use the size cell's line-height. Single-line span types pin this
  // to 1; only the <p>-based Subtitle keeps the per-size default.
  lineHeight?: number;
  backgroundFill: CustomTextBackgroundFill;
  backgroundShape: CustomTextBackgroundShape;
  backgroundColor?: BrandColor; // fill color (used when fill is 'filled')
  borderColor?: BrandColor;
  padding?: string; // chip padding (used when backgrounded)
}

// Chip padding used when a backgrounded type doesn't specify its own.
const DEFAULT_CHIP_PADDING = '0.25em 0.5em';

// Per-type default style sets.
// TODO(design): the chip fills/borders, Statistic display size, and exact
// color tokens below are drafts from specs/010-custom-text/research.md R7 and
// must be confirmed against Figma before launch.
export const CUSTOM_TEXT_TYPE_DEFAULTS: Record<
  CustomTextType,
  CustomTextDefault
> = {
  custom: {
    tag: 'span',
    track: 'text',
    size: 'md',
    weight: 'regular',
    color: 'black',
    textTransform: 'none',
    lineHeight: 1,
    backgroundFill: 'none',
    backgroundShape: 'pill',
  },
  subtitle: {
    tag: 'p', // the only type defaulting to <p>
    track: 'text',
    size: 'xl',
    weight: 'regular',
    color: 'black',
    textTransform: 'none',
    // lineHeight intentionally unset → uses the size cell's line-height.
    backgroundFill: 'none',
    backgroundShape: 'pill',
  },
  overline: {
    tag: 'span',
    track: 'text',
    size: 'md',
    weight: 'semibold',
    color: 'black',
    textTransform: 'capitalize',
    lineHeight: 1,
    backgroundFill: 'none',
    backgroundShape: 'pill',
  },
  statistic: {
    tag: 'span',
    track: 'display',
    size: 'lg',
    weight: 'bold',
    color: 'purplePrimary',
    textTransform: 'none',
    lineHeight: 1,
    backgroundFill: 'none',
    backgroundShape: 'pill',
  },
  courseTopics: {
    tag: 'span',
    track: 'text',
    size: 'sm',
    weight: 'medium',
    color: 'purpleDark',
    textTransform: 'capitalize',
    lineHeight: 1,
    backgroundFill: 'filled',
    backgroundShape: 'pill',
    backgroundColor: 'white',
    borderColor: 'black',
    padding: '0.25em 0.5em',
  },
  courseLabs: {
    tag: 'span',
    track: 'text',
    size: 'sm',
    weight: 'semibold',
    color: 'blueDark',
    textTransform: 'capitalize',
    lineHeight: 1,
    backgroundFill: 'filled',
    backgroundShape: 'roundedSquare',
    backgroundColor: 'purpleLight',
    borderColor: 'purpleMid',
    padding: '0.25em 0.5em',
  },
};

// Fixed border width for backgrounded styles — 1px for every fill, not
// author-controllable (FR-008, refined to 1px in amendment-1).
export const CUSTOM_TEXT_BORDER_WIDTH = '1px';

const SHAPE_RADIUS: Record<CustomTextBackgroundShape, string> = {
  pill: '999px',
  roundedSquare: '0.25rem',
};

const FONT_STACK: Record<CustomTextFontTrack, string> = {
  text: CODE_ORG_TEXT_FONT_STACK,
  display: CODE_ORG_DISPLAY_FONT_STACK,
};

const SCALE: Record<CustomTextFontTrack, Record<SizeToken, ScaleCell>> = {
  text: SCALE_TEXT,
  display: SCALE_DISPLAY,
};

// Strips the `'default'`/empty sentinels to `undefined` so `?? typeDefault`
// flows through. `'none'` is a real value and is preserved.
const inherit = <T extends string>(
  value: T | Sentinel | undefined,
): T | undefined =>
  value === undefined || value === '' || value === 'default'
    ? undefined
    : (value as T);

export interface ResolveCustomTextArgs {
  type: CustomTextType;
  htmlTag?: CustomTextTag | Sentinel;
  color?: BrandColor | Sentinel;
  backgroundFill?: CustomTextBackgroundFill | Sentinel;
  backgroundShape?: CustomTextBackgroundShape | Sentinel;
  backgroundColor?: BrandColor | Sentinel;
  borderColor?: BrandColor | Sentinel;
  textSize?: SizeToken | Sentinel;
  font?: CustomTextFontTrack | Sentinel;
  fontWeight?: CustomTextWeight | Sentinel;
  textTransform?: CustomTextTransform | Sentinel;
  iconNameLeft?: string;
  iconNameRight?: string;
  enclosingBackground?: EnclosingBackground;
}

export interface ResolveCustomTextResult {
  tag: CustomTextTag;
  sx: Record<string, unknown>;
  resolvedColor: string;
  background: {
    backgroundColor: string;
    border: string;
    borderRadius: string;
    padding: string;
  } | null;
  icon: {name: string; side: 'left' | 'right'} | null;
}

export const resolveCustomTextStyles = (
  args: ResolveCustomTextArgs,
): ResolveCustomTextResult => {
  const def =
    CUSTOM_TEXT_TYPE_DEFAULTS[args.type] ?? CUSTOM_TEXT_TYPE_DEFAULTS.custom;

  const tag = (inherit(args.htmlTag) as CustomTextTag) ?? def.tag;
  const track = (inherit(args.font) as CustomTextFontTrack) ?? def.track;
  const size = (inherit(args.textSize) as SizeToken) ?? def.size;
  const color = (inherit(args.color) as BrandColor) ?? def.color;
  const textTransform =
    (inherit(args.textTransform) as CustomTextTransform) ?? def.textTransform;

  const weightOverride = inherit(args.fontWeight) as
    | CustomTextWeight
    | undefined;
  const fontWeight = weightOverride
    ? Number(weightOverride)
    : WEIGHTS[def.weight];

  // Background treatment is driven by the FILL selection, not the color.
  const backgroundFill =
    (inherit(args.backgroundFill) as CustomTextBackgroundFill) ??
    def.backgroundFill;
  const backgroundShape =
    (inherit(args.backgroundShape) as CustomTextBackgroundShape) ??
    def.backgroundShape;
  const fillColor =
    (inherit(args.backgroundColor) as BrandColor) ?? def.backgroundColor;
  const borderColor =
    (inherit(args.borderColor) as BrandColor) ?? def.borderColor ?? color;

  const hasBackground = backgroundFill !== 'none';

  const cell = SCALE[track][size];
  const sx: Record<string, unknown> = {
    fontFamily: FONT_STACK[track],
    fontSize: cell.fontSize,
    lineHeight: def.lineHeight ?? cell.lineHeight,
    fontWeight,
    ...(cell.letterSpacing ? {letterSpacing: cell.letterSpacing} : {}),
    ...(textTransform !== 'none' ? {textTransform} : {}),
  };

  // Contrast switch fires only when the text sits directly on the Section
  // background (fill 'none'). Any fill (filled or outline) lets the
  // author-chosen color pass through, mirroring Icon's `backgroundFill` rule.
  const resolvedColor = hasBackground
    ? cssVarForBrandColor(color)
    : resolvedCssVarForBrandColor(color, args.enclosingBackground);

  const background = hasBackground
    ? {
        backgroundColor:
          backgroundFill === 'filled' && fillColor
            ? cssVarForBrandColor(fillColor)
            : 'transparent',
        border: `${CUSTOM_TEXT_BORDER_WIDTH} solid ${cssVarForBrandColor(
          borderColor,
        )}`,
        borderRadius: SHAPE_RADIUS[backgroundShape],
        padding: def.padding ?? DEFAULT_CHIP_PADDING,
      }
    : null;

  const icon = args.iconNameLeft
    ? {name: args.iconNameLeft, side: 'left' as const}
    : args.iconNameRight
      ? {name: args.iconNameRight, side: 'right' as const}
      : null;

  return {tag, sx, resolvedColor, background, icon};
};
