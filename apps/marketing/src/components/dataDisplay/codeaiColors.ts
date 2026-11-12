/**
 * CodeAI palette as hex, for SVG attributes and MUI X charts, which can't
 * resolve CSS variables. Mirrors the `--codeai-*` values in
 * packages/component-library-styles/primitiveColors.scss (pinned by
 * __tests__/codeaiColors.test.ts). Anything styled through CSS should use
 * the variables or a BrandColor prop instead.
 */
export const CODEAI = {
  white: '#FFFFFF',
  black: '#000000',
  purpleDark: '#1F1976',
  purplePrimary: '#4C42CF',
  purpleMid: '#ACA8EA',
  purpleLight: '#E4E2F8',
  blueDark: '#06338D',
  bluePrimary: '#0099F3',
  blueMid: '#6FCAFF',
  blueLight: '#D5EFFF',
  greenDark: '#003F25',
  greenPrimary: '#34BD43',
  greenMid: '#7CDB87',
  greenLight: '#CCF1D0',
  orangeDark: '#611D00',
  orangePrimary: '#F46800',
  orangeMid: '#FFA868',
  orangeLight: '#FFE3CE',
  pinkDark: '#7D0C3D',
  pinkPrimary: '#E11970',
  pinkMid: '#F07FB0',
  pinkLight: '#FBDAE8',
  gray1: '#F2F2F2',
  gray2: '#E4E6E9',
  gray3: '#D1D4D8',
  gray4: '#AFB8C2',
  gray5: '#87909A',
  gray6: '#5F6872',
  gray7: '#4B545E',
  gray8: '#292F36',
  gray9: '#141414',
} as const;

export type CodeaiColor = keyof typeof CODEAI;

/** The CSS variable for a palette color, with its hex as the fallback. */
export const codeaiVar = (name: CodeaiColor) =>
  name === 'white' || name === 'black'
    ? CODEAI[name]
    : `var(--codeai-${name.replace(/([A-Z])|(\d)/g, (_, upper, digit) =>
        upper ? `-${upper.toLowerCase()}` : `-${digit}`,
      )}, ${CODEAI[name]})`;

/** A hex color darkened toward black by `amount` (0–1), for hover shading. */
export const shade = (hex: string, amount = 0.2) =>
  `#${[1, 3, 5]
    .map(i =>
      Math.round(parseInt(hex.slice(i, i + 2), 16) * (1 - amount))
        .toString(16)
        .padStart(2, '0'),
    )
    .join('')}`;
