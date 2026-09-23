// Hour of AI brand palette. Values reuse the shared stored keys so content and
// component defaults carry over; `hex` must match the `--palette-*` values in
// packages/component-library-styles/brandColors.scss.

export type HourOfAiColorValue =
  | 'black'
  | 'purpleDark'
  | 'pinkPrimary'
  | 'pinkLight'
  | 'bluePrimary'
  | 'blueLight'
  | 'white';

export interface HourOfAiColor {
  value: HourOfAiColorValue;
  displayName: string;
  hex: string;
  cssVar: string;
  /** Tone as a Section background. */
  tone: 'dark' | 'light';
  /** Swap when used as text on a background of the given tone. */
  onDark?: HourOfAiColorValue;
  onLight?: HourOfAiColorValue;
  /** Below AA for body text on white; offered only where text is large. */
  largeTextOnly?: boolean;
}

export const HOUR_OF_AI_COLORS: readonly HourOfAiColor[] = [
  {
    value: 'black',
    displayName: 'Black',
    hex: '#212121',
    cssVar: 'var(--palette-black)',
    tone: 'dark',
    onDark: 'white',
  },
  {
    value: 'purpleDark',
    displayName: 'Dark Purple',
    hex: '#1F1976',
    cssVar: 'var(--palette-dark-purple)',
    tone: 'dark',
    onDark: 'white',
  },
  {
    value: 'pinkPrimary',
    displayName: 'Pink',
    hex: '#E11970',
    cssVar: 'var(--palette-pink)',
    tone: 'dark',
    onDark: 'pinkLight',
  },
  {
    value: 'pinkLight',
    displayName: 'Light Pink',
    hex: '#FBDAE8',
    cssVar: 'var(--palette-light-pink)',
    tone: 'light',
    onLight: 'pinkPrimary',
  },
  // A light background for contrast: White on Blue is 3.07:1, Black is 5.25:1.
  {
    value: 'bluePrimary',
    displayName: 'Blue',
    hex: '#0099F3',
    cssVar: 'var(--palette-blue)',
    tone: 'light',
    onDark: 'blueLight',
    largeTextOnly: true,
  },
  {
    value: 'blueLight',
    displayName: 'Light Blue',
    hex: '#D5EFFF',
    cssVar: 'var(--palette-light-blue)',
    tone: 'light',
    onLight: 'bluePrimary',
    largeTextOnly: true,
  },
  {
    value: 'white',
    displayName: 'White',
    hex: '#FFFFFF',
    cssVar: 'var(--palette-white)',
    tone: 'light',
    onLight: 'black',
  },
];

// Off-palette stored values (and shared component defaults) → closest color.
// Mirrored by the `--codeai-*` remaps in brandColors.scss.
export const HOUR_OF_AI_COLOR_ALIASES: Readonly<
  Record<string, HourOfAiColorValue>
> = {
  primary: 'black',
  purplePrimary: 'purpleDark',
  purpleMid: 'pinkPrimary',
  purpleLight: 'blueLight',
  pinkDark: 'purpleDark',
  pinkMid: 'pinkPrimary',
  blueDark: 'purpleDark',
  blueMid: 'bluePrimary',
  greenDark: 'purpleDark',
  greenPrimary: 'bluePrimary',
  greenMid: 'bluePrimary',
  greenLight: 'blueLight',
  orangeDark: 'purpleDark',
  orangePrimary: 'pinkPrimary',
  orangeMid: 'pinkPrimary',
  orangeLight: 'pinkLight',
  gray1: 'blueLight',
  gray2: 'blueLight',
  gray3: 'blueLight',
  gray4: 'blueLight',
  gray5: 'blueLight',
  gray6: 'pinkPrimary',
  gray7: 'black',
  gray8: 'black',
  gray9: 'black',
  gradientPurple: 'purpleDark',
  gradientBlue: 'bluePrimary',
  gradientGreen: 'bluePrimary',
  gradientOrange: 'pinkPrimary',
  gradientPink: 'pinkPrimary',
};

export const hourOfAiColor = (value: string): HourOfAiColor | undefined => {
  const key = HOUR_OF_AI_COLOR_ALIASES[value] ?? value;
  return HOUR_OF_AI_COLORS.find(c => c.value === key);
};

export const hourOfAiHex = (value: HourOfAiColorValue): string =>
  HOUR_OF_AI_COLORS.find(c => c.value === value)!.hex;
