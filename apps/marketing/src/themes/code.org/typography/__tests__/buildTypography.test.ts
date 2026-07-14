import {createTheme} from '@mui/material/styles';

import {buildTypography} from '../buildTypography';
import {
  CODE_ORG_DISPLAY_FONT_STACK,
  CODE_ORG_TEXT_FONT_STACK,
} from '../fontStack';
import {ROLE_TOKENS, WEIGHTS} from '../tokens';

describe('buildTypography', () => {
  const typography = buildTypography({
    defaultFontFamily: CODE_ORG_TEXT_FONT_STACK,
  });

  describe('h1 (locked: Display xl Semibold — amendment-4)', () => {
    it('uses the Display font stack', () => {
      expect(typography.h1.fontFamily).toBe(CODE_ORG_DISPLAY_FONT_STACK);
    });

    it('renders 3.75rem / 4rem / -0.02em at desktop default', () => {
      expect(typography.h1.fontSize).toBe('3.75rem');
      expect(typography.h1.lineHeight).toBe('4rem');
      expect(typography.h1.letterSpacing).toBe('-0.02em');
    });

    it('uses weight Semibold (600)', () => {
      expect(typography.h1.fontWeight).toBe(WEIGHTS.semibold);
      expect(typography.h1.fontWeight).toBe(600);
    });

    it('steps down at sm and xs breakpoints', () => {
      const {breakpoints} = createTheme();
      const smDown = typography.h1[breakpoints.down('sm')] as Record<
        string,
        string
      >;
      const mdDown = typography.h1[breakpoints.down('md')] as Record<
        string,
        string
      >;
      expect(mdDown.fontSize).toBe('3rem'); // Display lg at tablet
      expect(smDown.fontSize).toBe('2.25rem'); // Display md at mobile
    });
  });

  describe('h2 (locked: Display lg Medium — amendment-4)', () => {
    it('uses weight Medium (500)', () => {
      expect(typography.h2.fontWeight).toBe(WEIGHTS.medium);
      expect(typography.h2.fontWeight).toBe(500);
    });

    it('renders 3rem / 3.25rem at desktop default', () => {
      expect(typography.h2.fontSize).toBe('3rem');
      expect(typography.h2.lineHeight).toBe('3.25rem');
    });
  });

  describe('body2 (locked: Text md Regular — amendment-4)', () => {
    it('renders 1rem / 1.5rem / weight 400', () => {
      expect(typography.body2.fontSize).toBe('1rem');
      expect(typography.body2.lineHeight).toBe('1.5rem');
      expect(typography.body2.fontWeight).toBe(WEIGHTS.regular);
      expect(typography.body2.fontWeight).toBe(400);
    });

    it('uses the Text font stack', () => {
      expect(typography.body2.fontFamily).toBe(CODE_ORG_TEXT_FONT_STACK);
    });

    it('does not letter-space', () => {
      expect(typography.body2.letterSpacing).toBeUndefined();
    });

    it('does not step responsively (body is fixed across breakpoints)', () => {
      const {breakpoints} = createTheme();
      expect(typography.body2[breakpoints.down('md')]).toBeUndefined();
      expect(typography.body2[breakpoints.down('sm')]).toBeUndefined();
    });
  });

  describe('heading hierarchy', () => {
    it('h1 > h2 > h3 > h4 > h5 > h6 at desktop default', () => {
      const sizes = [
        typography.h1.fontSize,
        typography.h2.fontSize,
        typography.h3.fontSize,
        typography.h4.fontSize,
        typography.h5.fontSize,
        typography.h6.fontSize,
      ].map(s => parseFloat(String(s).replace('rem', '')));
      for (let i = 0; i < sizes.length - 1; i++) {
        expect(sizes[i]).toBeGreaterThanOrEqual(sizes[i + 1]);
      }
    });

    it('every heading default ≥ 1rem (body floor)', () => {
      for (const role of ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'] as const) {
        const fontSize = parseFloat(
          String(typography[role].fontSize).replace('rem', ''),
        );
        expect(fontSize).toBeGreaterThanOrEqual(1);
      }
    });
  });

  describe('top-level fontFamily', () => {
    it('uses the Text stack as the page default', () => {
      expect(typography.fontFamily).toBe(CODE_ORG_TEXT_FONT_STACK);
    });
  });

  describe('overline + caption', () => {
    it('overline = Text xs Semibold', () => {
      expect(typography.overline.fontSize).toBe('0.75rem');
      expect(typography.overline.lineHeight).toBe('1.125rem');
      expect(typography.overline.fontWeight).toBe(WEIGHTS.semibold);
    });

    it('caption = Text sm Semibold', () => {
      expect(typography.caption.fontSize).toBe('0.875rem');
      expect(typography.caption.lineHeight).toBe('1.25rem');
      expect(typography.caption.fontWeight).toBe(WEIGHTS.semibold);
    });
  });

  describe('ROLE_TOKENS sanity (amendment-4)', () => {
    it('h1 is locked to Display xl Semibold', () => {
      expect(ROLE_TOKENS.h1.track).toBe('display');
      expect(ROLE_TOKENS.h1.size).toBe('xl');
      expect(ROLE_TOKENS.h1.weight).toBe('semibold');
    });

    it('h2-h6 are Medium weight', () => {
      expect(ROLE_TOKENS.h2.weight).toBe('medium');
      expect(ROLE_TOKENS.h3.weight).toBe('medium');
      expect(ROLE_TOKENS.h4.weight).toBe('medium');
      expect(ROLE_TOKENS.h5.weight).toBe('medium');
      expect(ROLE_TOKENS.h6.weight).toBe('medium');
    });

    it('body2 is locked to Text md Regular', () => {
      expect(ROLE_TOKENS.body2.track).toBe('text');
      expect(ROLE_TOKENS.body2.size).toBe('md');
      expect(ROLE_TOKENS.body2.weight).toBe('regular');
    });
  });
});
