import {readFileSync} from 'fs';
import {join} from 'path';

import {CODE_ORG_TYPOGRAPHY_TOKENS} from '@/themes/code.org/typography/typographyTokens';
import type {SizeToken} from '@/themes/common/typography/types';
import HourOfAiTheme from '@/themes/hourofai';

import {
  FALLBACK_FONTS,
  HOUR_OF_AI_DISPLAY_FONT_STACK,
  HOUR_OF_AI_TEXT_FONT_STACK,
} from '../fontStack';
import {SCALE_DISPLAY, SCALE_TEXT} from '../tokens';
import {HOUR_OF_AI_TYPOGRAPHY_TOKENS} from '../typographyTokens';

const SIZES: SizeToken[] = ['xs', 'sm', 'md', 'lg', 'xl', '2xl', '3xl', '4xl'];

describe('Hour of AI font stacks', () => {
  it('uses Geist for text and Space Grotesk for display, then the fallbacks', () => {
    const fallbacks = [...FALLBACK_FONTS, 'sans-serif'].join(', ');
    expect(HOUR_OF_AI_TEXT_FONT_STACK).toBe(`Geist, ${fallbacks}`);
    expect(HOUR_OF_AI_DISPLAY_FONT_STACK).toBe(`Space Grotesk, ${fallbacks}`);
  });
});

describe('HOUR_OF_AI_TYPOGRAPHY_TOKENS', () => {
  it('owns every token group rather than sharing Code.org’s objects', () => {
    const groups = [
      'weights',
      'roles',
      'displayAppearanceRoles',
      'paragraphAppearanceRoles',
    ] as const;
    for (const group of groups) {
      expect(HOUR_OF_AI_TYPOGRAPHY_TOKENS[group]).not.toBe(
        CODE_ORG_TYPOGRAPHY_TOKENS[group],
      );
    }
    expect(HOUR_OF_AI_TYPOGRAPHY_TOKENS.scales.text).not.toBe(
      CODE_ORG_TYPOGRAPHY_TOKENS.scales.text,
    );
    expect(HOUR_OF_AI_TYPOGRAPHY_TOKENS.scales.display).not.toBe(
      CODE_ORG_TYPOGRAPHY_TOKENS.scales.display,
    );
  });

  it('matches the font-size custom properties in the brand stylesheet', () => {
    const scssPath = join(
      __dirname,
      '../../../../../../../packages/fonts/src/brands/HourOfAI/index.scss',
    );
    const source = readFileSync(scssPath, 'utf8');
    const cssVar = (name: string) =>
      new RegExp(`--${name}:\\s*([^;]+);`).exec(source)?.[1];

    for (const size of SIZES) {
      expect(cssVar(`font-size-text-${size}`)).toBe(SCALE_TEXT[size].fontSize);
      expect(cssVar(`font-size-display-${size}`)).toBe(
        SCALE_DISPLAY[size].fontSize,
      );
    }
  });
});

describe('Hour of AI theme', () => {
  it('carries its typography tokens', () => {
    // createTheme deep-clones its options, so compare by value.
    expect(HourOfAiTheme.typographyTokens).toStrictEqual(
      HOUR_OF_AI_TYPOGRAPHY_TOKENS,
    );
  });

  it('builds its variants from Hour of AI tokens', () => {
    const {typography} = HourOfAiTheme;
    expect(typography.fontFamily).toBe(HOUR_OF_AI_TEXT_FONT_STACK);
    expect(typography.h1.fontFamily).toBe(HOUR_OF_AI_DISPLAY_FONT_STACK);
    expect(typography.h2.fontFamily).toBe(HOUR_OF_AI_DISPLAY_FONT_STACK);
    expect(typography.h3.fontFamily).toBe(HOUR_OF_AI_TEXT_FONT_STACK);
    expect(typography.body4.fontSize).toBe(SCALE_TEXT.xs.fontSize);
  });

  it('does not emit the tokens as MUI CSS variables', () => {
    // cssVariables themes add generateStyleSheets; the Theme type omits it.
    const {generateStyleSheets} = HourOfAiTheme as unknown as {
      generateStyleSheets: () => unknown;
    };
    const sheets = JSON.stringify(generateStyleSheets());
    expect(sheets).not.toMatch(/typographyTokens|scales-text/i);
  });
});
