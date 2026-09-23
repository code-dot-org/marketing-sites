import {readFileSync} from 'fs';
import {join} from 'path';

import {HOUR_OF_AI_BRAND_COLORS as colors} from '../brandColors';
import {
  HOUR_OF_AI_COLOR_ALIASES,
  HOUR_OF_AI_COLORS,
  type HourOfAiColorValue,
} from '../palette';

const scss = readFileSync(
  join(
    __dirname,
    '../../../../../../../packages/component-library-styles/brandColors.scss',
  ),
  'utf8',
);
const hourOfAiBlock = scss.slice(scss.indexOf("[data-brand='HourOfAI']"));
const cssVar = (name: string) =>
  new RegExp(`--${name}:\\s*([^;]+);`).exec(hourOfAiBlock)?.[1].trim();
const expandHex = (hex: string) =>
  (hex.length === 4
    ? `#${[...hex.slice(1)].map(c => c + c).join('')}`
    : hex
  ).toLowerCase();

describe('Hour of AI contrast swaps', () => {
  // [text, on dark background, on light background]
  const table: [HourOfAiColorValue, string, string][] = [
    ['black', 'white', 'black'],
    ['purpleDark', 'white', 'purpleDark'],
    ['pinkPrimary', 'pinkLight', 'pinkPrimary'],
    ['pinkLight', 'pinkLight', 'pinkPrimary'],
    ['bluePrimary', 'blueLight', 'bluePrimary'],
    ['blueLight', 'blueLight', 'bluePrimary'],
    ['white', 'white', 'black'],
  ];

  it.each(table)('%s → %s on dark, %s on light', (text, onDark, onLight) => {
    expect(colors.resolveText(text, 'purpleDark')).toBe(onDark);
    expect(colors.resolveText(text, 'white')).toBe(onLight);
    // The page (no Section background) is white.
    expect(colors.resolveText(text, null)).toBe(onLight);
  });

  it('treats Blue as a light background so dark text stays AA', () => {
    expect(colors.backgroundTone('bluePrimary')).toBe('light');
    expect(colors.resolveText('black', 'bluePrimary')).toBe('black');
  });

  it('passes colors through on transparent Sections', () => {
    expect(colors.resolveText('white', 'transparent')).toBe('white');
  });

  it('folds off-palette values onto the closest color', () => {
    expect(colors.resolveText('purplePrimary', 'white')).toBe('purpleDark');
    expect(colors.resolveText('gray6', 'white')).toBe('pinkPrimary');
    expect(colors.resolveText('primary', 'black')).toBe('white');
    expect(colors.backgroundTone('purplePrimary')).toBe('dark');
  });

  it('sets readable text on fills', () => {
    expect(colors.textOnFill?.('purpleDark')).toBe('var(--palette-white)');
    expect(colors.textOnFill?.('pinkPrimary')).toBe('var(--palette-white)');
    expect(colors.textOnFill?.('bluePrimary')).toBe('var(--palette-black)');
  });
});

describe('brandColors.scss', () => {
  it.each(HOUR_OF_AI_COLORS.map(c => [c.value, c]))(
    'defines %s with the palette hex',
    (_, color) => {
      const name = color.cssVar.slice('var(--'.length, -1);
      expect(expandHex(cssVar(name) ?? '')).toBe(color.hex.toLowerCase());
    },
  );

  it('remaps every shared --codeai-* color to its alias target', () => {
    const remaps = [
      ...hourOfAiBlock.matchAll(/--codeai-([a-z]+)-([a-z0-9]+):\s*([^;]+);/g),
    ];
    expect(remaps.length).toBeGreaterThan(0);
    for (const [, family, shade, value] of remaps) {
      const key = /^\d+$/.test(shade)
        ? `${family}${shade}`
        : `${family}${shade[0].toUpperCase()}${shade.slice(1)}`;
      const target = HOUR_OF_AI_COLOR_ALIASES[key] ?? key;
      const color = HOUR_OF_AI_COLORS.find(c => c.value === target);
      expect([key, value.trim()]).toEqual([key, color?.cssVar]);
    }
  });
});
