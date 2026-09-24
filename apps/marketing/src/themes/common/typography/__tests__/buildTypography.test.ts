import {createTheme} from '@mui/material/styles';

import {CODE_ORG_TYPOGRAPHY_TOKENS} from '@/themes/code.org/typography/typographyTokens';

import {buildTypography} from '../buildTypography';
import type {BrandTypographyTokens} from '../types';

const withTokens = (
  patch: Partial<BrandTypographyTokens>,
): BrandTypographyTokens => ({...CODE_ORG_TYPOGRAPHY_TOKENS, ...patch});

describe('buildTypography (shared)', () => {
  it('uses the font stack of each role’s track', () => {
    const typography = buildTypography(
      withTokens({fontStacks: {text: 'TextFont', display: 'DisplayFont'}}),
    );
    expect(typography.fontFamily).toBe('TextFont');
    expect(typography.h1.fontFamily).toBe('DisplayFont');
    expect(typography.h3.fontFamily).toBe('TextFont');
    expect(typography.body2.fontFamily).toBe('TextFont');
  });

  it('honors a defaultFontFamily override', () => {
    const typography = buildTypography(CODE_ORG_TYPOGRAPHY_TOKENS, {
      defaultFontFamily: 'Override',
    });
    expect(typography.fontFamily).toBe('Override');
  });

  it('reads sizes, weights, and step ladders from the given tokens', () => {
    const tokens = withTokens({
      weights: {...CODE_ORG_TYPOGRAPHY_TOKENS.weights, semibold: 650},
      scales: {
        ...CODE_ORG_TYPOGRAPHY_TOKENS.scales,
        display: {
          ...CODE_ORG_TYPOGRAPHY_TOKENS.scales.display,
          xl: {fontSize: '4rem', lineHeight: '4.25rem'},
        },
      },
    });
    const {h1} = buildTypography(tokens);
    const mobile = createTheme().breakpoints.down('sm');

    expect(h1.fontSize).toBe('4rem');
    expect(h1.fontWeight).toBe(650);
    expect(h1).not.toHaveProperty('letterSpacing');
    expect(h1[mobile]).toEqual(
      expect.objectContaining({
        fontSize: CODE_ORG_TYPOGRAPHY_TOKENS.scales.display.md.fontSize,
      }),
    );
  });

  it('throws when a scale cell is missing', () => {
    const text = {...CODE_ORG_TYPOGRAPHY_TOKENS.scales.text} as Record<
      string,
      unknown
    >;
    delete text['2xl'];
    const tokens = withTokens({
      scales: {
        ...CODE_ORG_TYPOGRAPHY_TOKENS.scales,
        text: text as BrandTypographyTokens['scales']['text'],
      },
    });
    expect(() => buildTypography(tokens)).toThrow(/missing cell "2xl"/);
  });

  it('throws when a heading falls below the 1rem floor', () => {
    const tokens = withTokens({
      roles: {
        ...CODE_ORG_TYPOGRAPHY_TOKENS.roles,
        h6: {track: 'text', size: 'sm', weight: 'medium'},
      },
    });
    expect(() => buildTypography(tokens)).toThrow(/below the 1rem floor/);
  });

  it('throws when the heading hierarchy is inverted', () => {
    const tokens = withTokens({
      roles: {
        ...CODE_ORG_TYPOGRAPHY_TOKENS.roles,
        h2: {track: 'display', size: '4xl', weight: 'medium'},
      },
    });
    expect(() => buildTypography(tokens)).toThrow(/hierarchy violated/);
  });
});
