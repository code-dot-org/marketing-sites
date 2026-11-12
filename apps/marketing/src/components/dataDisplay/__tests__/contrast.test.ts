// The Storybook a11y addon has colour-contrast off, so the report's colour
// pairs are checked here: text 4.5:1 (3:1 when large), graphics 3:1.
import {
  TIER_BADGES,
  TIER_COLORS,
  TIER_SECTION_BACKGROUNDS,
  UNSCORED_SECTION_BACKGROUND,
} from '@/modules/stateOfDigitalFluency/constants';

import {CODEAI as C} from '../codeaiColors';

const channel = (hex: string, i: number) => {
  const v = parseInt(hex.slice(1 + i * 2, 3 + i * 2), 16) / 255;
  return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
};

const luminance = (hex: string) =>
  0.2126 * channel(hex, 0) +
  0.7152 * channel(hex, 1) +
  0.0722 * channel(hex, 2);

const contrast = (a: string, b: string) => {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
};

// Badge's light appearance (Badge.tsx BADGE_PALETTE): Light fill, Dark text;
// Black uses Gray 1 and Gray 8.
const BADGE_LIGHT = {
  black: [C.gray8, C.gray1],
  purple: [C.purpleDark, C.purpleLight],
  blue: [C.blueDark, C.blueLight],
  orange: [C.orangeDark, C.orangeLight],
  pink: [C.pinkDark, C.pinkLight],
  green: [C.greenDark, C.greenLight],
} as const;

describe('report colour contrast', () => {
  it.each(Object.entries(TIER_BADGES))(
    'tier badge %s text meets 4.5:1',
    (_, color) => {
      const [fg, bg] = BADGE_LIGHT[color];
      expect(contrast(fg, bg)).toBeGreaterThanOrEqual(4.5);
    },
  );

  it.each([
    ...Object.values(TIER_SECTION_BACKGROUNDS),
    UNSCORED_SECTION_BACKGROUND,
    'purpleDark' as const,
  ])('white text on the %s score band meets 4.5:1', background => {
    expect(contrast(C.white, C[background])).toBeGreaterThanOrEqual(4.5);
  });

  it.each(Object.entries(TIER_COLORS))(
    '%s bars on white meet 3:1',
    (_, color) => {
      expect(contrast(color, C.white)).toBeGreaterThanOrEqual(3);
    },
  );

  it.each([
    ['Gray 6 notes on white', C.gray6, C.white],
    ['Gray 6 notes on Gray 1', C.gray6, C.gray1],
    ['Purple Primary statistics on white', C.purplePrimary, C.white],
    [
      'Purple Primary overlines on Purple Light',
      C.purplePrimary,
      C.purpleLight,
    ],
    ['map tooltip', C.white, C.blueDark],
    ['Purple Dark headings on white', C.purpleDark, C.white],
    ['overline labels on white', C.gray6, C.white],
    ['DC callout label', C.gray8, C.white],
  ])('%s meets 4.5:1', (_, fg, bg) => {
    expect(contrast(fg, bg)).toBeGreaterThanOrEqual(4.5);
  });

  it.each([
    ['national reference line on white', C.gray8, C.white],
    ['highlighted map outline on the darkest band', C.purpleDark, C.purpleMid],
    ['map outline on the lightest band', C.purpleDark, C.purpleLight],
  ])('%s meets 3:1', (_, fg, bg) => {
    expect(contrast(fg, bg)).toBeGreaterThanOrEqual(3);
  });
});
