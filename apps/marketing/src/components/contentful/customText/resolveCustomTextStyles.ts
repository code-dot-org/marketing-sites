// Custom Text style resolution (spec 010).
//
// Precedence, mirroring resolveHeadingStyles:
//   1. Type default — the chosen Custom Text type seeds tag, font track,
//      size, weight, color, and text-transform.
//   2. Individual override fields — each set field overrides ONLY its own
//      dimension. A `'default'` sentinel (or `undefined`/'') inherits the
//      type default.
//   3. Contrast rule — the text color contrast-switches against the
//      enclosing Section background.
//
// Line-height always comes from the resolved size cell, so the type/size
// pairing renders with the scale's defined leading.

import {
  BrandColor,
  EnclosingBackground,
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

export type CustomTextType = 'custom' | 'subtitle' | 'overline' | 'statistic';

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

// `'default'` is the Studio sentinel meaning "inherit the type default".
type Sentinel = 'default' | '';

interface CustomTextDefault {
  tag: CustomTextTag;
  track: CustomTextFontTrack;
  size: SizeToken;
  weight: WeightToken;
  color: BrandColor;
  textTransform: CustomTextTransform;
}

// Per-type default style sets.
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
  },
  subtitle: {
    tag: 'p', // the only type defaulting to <p>
    track: 'text',
    size: 'xl',
    weight: 'regular',
    color: 'black',
    textTransform: 'none',
  },
  overline: {
    tag: 'span',
    track: 'text',
    size: 'md',
    weight: 'semibold',
    color: 'black',
    textTransform: 'capitalize',
  },
  statistic: {
    tag: 'span',
    track: 'display',
    size: '2xl',
    weight: 'bold',
    color: 'purplePrimary',
    textTransform: 'none',
  },
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

  const cell = SCALE[track][size];
  const sx: Record<string, unknown> = {
    fontFamily: FONT_STACK[track],
    fontSize: cell.fontSize,
    lineHeight: cell.lineHeight,
    fontWeight,
    ...(cell.letterSpacing ? {letterSpacing: cell.letterSpacing} : {}),
    ...(textTransform !== 'none' ? {textTransform} : {}),
  };

  const resolvedColor = resolvedCssVarForBrandColor(
    color,
    args.enclosingBackground,
  );

  const icon = args.iconNameLeft
    ? {name: args.iconNameLeft, side: 'left' as const}
    : args.iconNameRight
      ? {name: args.iconNameRight, side: 'right' as const}
      : null;

  return {tag, sx, resolvedColor, icon};
};
