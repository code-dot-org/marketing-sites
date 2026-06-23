// Spec 009 US6 — responsive ladder Jest invariants.
// The buildTypography builder asserts floor + hierarchy + scale-completeness
// at construction time; this suite locks the behavior with an explicit
// breakpoint-by-breakpoint walk that fails loudly if the role-token table
// is edited in a way that violates either invariant.

import {createTheme} from '@mui/material/styles';

import {buildTypography} from '../buildTypography';
import {SCALE_DISPLAY, SCALE_TEXT, ROLE_TOKENS} from '../tokens';

const {breakpoints} = createTheme();

const remToNumber = (rem: string): number =>
  Number(String(rem).replace('rem', ''));

const HEADING_ROLES = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'] as const;
type HeadingRole = (typeof HEADING_ROLES)[number];

const sizeAtBreakpoint = (
  variant: ReturnType<typeof buildTypography>['h1'],
  bp: 'md' | 'sm',
): string => {
  const mq = breakpoints.down(bp);
  const stepObj = variant[mq] as {fontSize?: string} | undefined;
  return stepObj?.fontSize ?? (variant.fontSize as string);
};

describe('responsive ladder invariants', () => {
  const typography = buildTypography();

  describe('floor: no heading ever drops below 1rem', () => {
    it.each(HEADING_ROLES)('default (md+) — %s ≥ 1rem', (name: HeadingRole) => {
      expect(
        remToNumber(typography[name].fontSize as string),
      ).toBeGreaterThanOrEqual(1);
    });

    it.each(HEADING_ROLES)(
      'md-down (tablet) — %s ≥ 1rem',
      (name: HeadingRole) => {
        expect(
          remToNumber(sizeAtBreakpoint(typography[name], 'md')),
        ).toBeGreaterThanOrEqual(1);
      },
    );

    it.each(HEADING_ROLES)(
      'sm-down (mobile) — %s ≥ 1rem',
      (name: HeadingRole) => {
        expect(
          remToNumber(sizeAtBreakpoint(typography[name], 'sm')),
        ).toBeGreaterThanOrEqual(1);
      },
    );
  });

  describe('hierarchy: H1 ≥ H2 ≥ … ≥ H6 ≥ body2 at every breakpoint', () => {
    const collectSequence = (bp?: 'md' | 'sm') => {
      const headings = HEADING_ROLES.map(name =>
        bp
          ? remToNumber(sizeAtBreakpoint(typography[name], bp))
          : remToNumber(typography[name].fontSize as string),
      );
      const body = remToNumber(typography.body2.fontSize as string);
      return [...headings, body];
    };

    it('at desktop default (md+), the sequence is non-increasing', () => {
      const seq = collectSequence();
      for (let i = 0; i < seq.length - 1; i++) {
        expect(seq[i]).toBeGreaterThanOrEqual(seq[i + 1]);
      }
    });

    it('at md-down (tablet), the sequence is non-increasing', () => {
      const seq = collectSequence('md');
      for (let i = 0; i < seq.length - 1; i++) {
        expect(seq[i]).toBeGreaterThanOrEqual(seq[i + 1]);
      }
    });

    it('at sm-down (mobile), the sequence is non-increasing', () => {
      const seq = collectSequence('sm');
      for (let i = 0; i < seq.length - 1; i++) {
        expect(seq[i]).toBeGreaterThanOrEqual(seq[i + 1]);
      }
    });
  });

  describe('body2 (locked default) is fixed across all breakpoints', () => {
    it('does not emit any breakpoint media query', () => {
      expect(typography.body2[breakpoints.down('md')]).toBeUndefined();
      expect(typography.body2[breakpoints.down('sm')]).toBeUndefined();
    });

    it('stays at 1rem / 1.5rem at every viewport', () => {
      expect(typography.body2.fontSize).toBe('1rem');
      expect(typography.body2.lineHeight).toBe('1.5rem');
    });
  });

  describe('SCALE_DISPLAY + SCALE_TEXT are both 8-cell complete', () => {
    it('SCALE_DISPLAY has all 8 size tokens', () => {
      expect(Object.keys(SCALE_DISPLAY).sort()).toEqual(
        ['2xl', '3xl', '4xl', 'lg', 'md', 'sm', 'xl', 'xs'].sort(),
      );
    });

    it('SCALE_TEXT has all 8 size tokens', () => {
      expect(Object.keys(SCALE_TEXT).sort()).toEqual(
        ['2xl', '3xl', '4xl', 'lg', 'md', 'sm', 'xl', 'xs'].sort(),
      );
    });
  });

  describe('ROLE_TOKENS sanity — locked defaults (amendment-4)', () => {
    it('H1 is Display xl Semibold with the documented step ladder', () => {
      expect(ROLE_TOKENS.h1).toMatchObject({
        track: 'display',
        size: 'xl',
        weight: 'semibold',
      });
      // Step ladder: md = same as default (no media query emitted),
      // sm = lg (Display lg at tablet), xs = md (Display md at mobile).
      expect(ROLE_TOKENS.h1.steps).toEqual({
        md: 'xl',
        sm: 'lg',
        xs: 'md',
      });
    });

    it('H2–H6 are Display Medium (amendment-4: weight shifted from Semibold)', () => {
      expect(ROLE_TOKENS.h2.weight).toBe('medium');
      expect(ROLE_TOKENS.h3.weight).toBe('medium');
      expect(ROLE_TOKENS.h4.weight).toBe('medium');
      expect(ROLE_TOKENS.h5.weight).toBe('medium');
      expect(ROLE_TOKENS.h6.weight).toBe('medium');
    });

    it('H5 + H6 both render at Display xs (floor of the ladder)', () => {
      expect(ROLE_TOKENS.h5.size).toBe('xs');
      expect(ROLE_TOKENS.h6.size).toBe('xs');
    });

    it('H6 has no step table — Display xs floors the ladder at 1.5rem', () => {
      expect((ROLE_TOKENS.h6 as {steps?: unknown}).steps).toBeUndefined();
    });

    it('body2 is the locked Text md Regular default', () => {
      expect(ROLE_TOKENS.body2).toMatchObject({
        track: 'text',
        size: 'md',
        weight: 'regular',
      });
    });
  });
});
