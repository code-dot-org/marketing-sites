import {createTheme} from '@mui/material/styles';

import {resolveHeadingStyles} from '../resolveHeadingStyles';

const {breakpoints} = createTheme();

describe('resolveHeadingStyles', () => {
  describe('Step 1 — Heading Level drives semantic tag + variant tag', () => {
    it.each([
      ['heading-xxl', 'h1'],
      ['heading-xl', 'h2'],
      ['heading-lg', 'h3'],
      ['heading-md', 'h4'],
      ['heading-sm', 'h5'],
      ['heading-xs', 'h6'],
    ] as const)(
      '%s → <%s>; variantTag always equals semanticTag (amendment-4)',
      (visualAppearance, tag) => {
        const result = resolveHeadingStyles({visualAppearance});
        expect(result.semanticTag).toBe(tag);
        expect(result.variantTag).toBe(tag);
      },
    );

    it.each([
      'heading-xxl',
      'heading-xl',
      'heading-lg',
      'heading-md',
      'heading-sm',
      'heading-xs',
    ] as const)(
      '%s with appearance=default and no overrides emits empty sx',
      visualAppearance => {
        const result = resolveHeadingStyles({
          visualAppearance,
          appearance: 'default',
        });
        expect(result.sx).toEqual({});
      },
    );

    it('omitting `appearance` is equivalent to appearance=default', () => {
      const a = resolveHeadingStyles({visualAppearance: 'heading-xxl'});
      const b = resolveHeadingStyles({
        visualAppearance: 'heading-xxl',
        appearance: 'default',
      });
      expect(a).toEqual(b);
    });
  });

  describe('Step 2 — Visual Appearance is SIZE-ONLY (amendment-4)', () => {
    it('variantTag stays equal to semanticTag regardless of appearance', () => {
      // H2 entry with every possible Visual Appearance still uses h2 variant.
      const appearances = [
        'default',
        'display-4xl',
        'display-3xl',
        'display-2xl',
        'display-xl',
        'display-lg',
        'display-md',
        'display-sm',
        'display-xs',
      ] as const;
      for (const appearance of appearances) {
        const result = resolveHeadingStyles({
          visualAppearance: 'heading-xl', // → h2
          appearance,
        });
        expect(result.semanticTag).toBe('h2');
        expect(result.variantTag).toBe('h2');
      }
    });

    it('appearance=display-xl on H2 emits inline size + line-height + letter-spacing for Display xl', () => {
      const result = resolveHeadingStyles({
        visualAppearance: 'heading-xl', // → <h2>
        appearance: 'display-xl',
      });
      expect(result.semanticTag).toBe('h2');
      expect(result.variantTag).toBe('h2');
      expect(result.sx.fontSize).toBe('3.75rem');
      expect(result.sx.lineHeight).toBe('4.5rem');
      expect(result.sx.letterSpacing).toBe('-0.02em');
    });

    it('appearance=display-lg on H1 emits inline size + line-height for Display lg', () => {
      const result = resolveHeadingStyles({
        visualAppearance: 'heading-xxl', // → <h1>
        appearance: 'display-lg',
      });
      expect(result.semanticTag).toBe('h1');
      expect(result.variantTag).toBe('h1');
      expect(result.sx.fontSize).toBe('3rem');
      expect(result.sx.lineHeight).toBe('3.75rem');
    });

    it('appearance=display-4xl emits the largest Display cell inline', () => {
      const result = resolveHeadingStyles({
        visualAppearance: 'heading-xl',
        appearance: 'display-4xl',
      });
      expect(result.sx.fontSize).toBe('7.5rem');
      expect(result.sx.lineHeight).toBe('8.125rem');
      expect(result.sx.letterSpacing).toBe('-0.02em');
    });

    it('appearance=display-2xl emits Display 2xl + its step locks', () => {
      const result = resolveHeadingStyles({
        visualAppearance: 'heading-xl',
        appearance: 'display-2xl',
      });
      expect(result.sx.fontSize).toBe('4.5rem');
      expect(result.sx.lineHeight).toBe('5.625rem');
      // The cell's step table locks per-viewport sizes so the variant's
      // smaller-viewport sizes don't take over.
      const mdDown = result.sx[breakpoints.down('md')] as Record<
        string,
        string
      >;
      const smDown = result.sx[breakpoints.down('sm')] as Record<
        string,
        string
      >;
      expect(mdDown.fontSize).toBe('3.75rem'); // Display xl
      expect(smDown.fontSize).toBe('3rem'); // Display lg
    });

    it('Visual Appearance does NOT emit sx.fontWeight (weight stays from the level variant)', () => {
      const result = resolveHeadingStyles({
        visualAppearance: 'heading-xl', // H2 = Medium per amendment-4
        appearance: 'display-xl', // would have Semibold weight in the cell
      });
      expect(result.sx.fontWeight).toBeUndefined();
    });

    it('appearance=display-xs locks the size to xs at every viewport (no step table on cell)', () => {
      const result = resolveHeadingStyles({
        visualAppearance: 'heading-xxl',
        appearance: 'display-xs',
      });
      expect(result.sx.fontSize).toBe('1.5rem');
      // Without a cell step table, the resolver still emits matching values
      // at the step breakpoints to override the variant's responsive shrink.
      const mdDown = result.sx[breakpoints.down('md')] as Record<
        string,
        string
      >;
      const smDown = result.sx[breakpoints.down('sm')] as Record<
        string,
        string
      >;
      expect(mdDown.fontSize).toBe('1.5rem');
      expect(smDown.fontSize).toBe('1.5rem');
    });
  });

  describe('Step 3 — individual overrides take top precedence', () => {
    it('fontSize override produces sx.fontSize and does not affect tag/variant', () => {
      const result = resolveHeadingStyles({
        visualAppearance: 'heading-xl',
        fontSize: 5,
      });
      expect(result.semanticTag).toBe('h2');
      expect(result.variantTag).toBe('h2');
      expect(result.sx.fontSize).toBe('5rem');
    });

    it('fontWeight override emits all 4 weight values numerically', () => {
      for (const w of ['400', '500', '600', '700'] as const) {
        const result = resolveHeadingStyles({
          visualAppearance: 'heading-xxl',
          fontWeight: w,
        });
        expect(result.sx.fontWeight).toBe(Number(w));
      }
    });

    it('fontWeight="default" sentinel inherits the level\'s weight (no inline override)', () => {
      const result = resolveHeadingStyles({
        visualAppearance: 'heading-xxl',
        fontWeight: 'default',
      });
      expect(result.sx.fontWeight).toBeUndefined();
    });

    it('lineHeight override produces unitless sx.lineHeight', () => {
      const result = resolveHeadingStyles({
        visualAppearance: 'heading-md',
        lineHeight: 1.2,
      });
      expect(result.sx.lineHeight).toBe(1.2);
    });

    it('textTransform "none" is omitted; non-none values are emitted', () => {
      expect(
        resolveHeadingStyles({
          visualAppearance: 'heading-md',
          textTransform: 'none',
        }).sx.textTransform,
      ).toBeUndefined();
      expect(
        resolveHeadingStyles({
          visualAppearance: 'heading-md',
          textTransform: 'uppercase',
        }).sx.textTransform,
      ).toBe('uppercase');
    });

    it('individual fontSize wins over Visual Appearance cell size', () => {
      const result = resolveHeadingStyles({
        visualAppearance: 'heading-xl',
        appearance: 'display-4xl', // would set sx.fontSize = 7.5rem
        fontSize: 5, // overrides to 5rem
      });
      expect(result.sx.fontSize).toBe('5rem');
      // line-height + letter-spacing from the Display 4xl cell remain.
      expect(result.sx.lineHeight).toBe('8.125rem');
      expect(result.sx.letterSpacing).toBe('-0.02em');
    });

    it('all three steps compose: H2 + display-xl + fontWeight=600 → "h2 looks like H1"', () => {
      const result = resolveHeadingStyles({
        visualAppearance: 'heading-xl', // → <h2>
        appearance: 'display-xl', // Display xl size
        fontWeight: '600', // Semibold (matches H1's weight)
      });
      expect(result.semanticTag).toBe('h2'); // step 1
      expect(result.variantTag).toBe('h2'); // step 1 (amendment-4)
      expect(result.sx.fontSize).toBe('3.75rem'); // step 2 cell size
      expect(result.sx.fontWeight).toBe(600); // step 3 individual override
    });
  });
});
