import {WEIGHTS} from '@/themes/code.org/typography/tokens';

import {resolveParagraphStyles} from '../resolveParagraphStyles';

describe('resolveParagraphStyles', () => {
  describe('legacy body-* values', () => {
    it.each([
      ['body-one', 'body1'],
      ['body-two', 'body2'],
      ['body-three', 'body3'],
      ['body-four', 'body4'],
    ] as const)(
      'maps %s to MUI variant %s with empty sx',
      (visualAppearance, variantTag) => {
        const result = resolveParagraphStyles({visualAppearance});
        expect(result.variantTag).toBe(variantTag);
        expect(result.sx).toEqual({});
      },
    );
  });

  describe('new text-* values that match a canonical body variant', () => {
    it.each([
      ['text-lg', 'body1'],
      ['text-md', 'body2'],
      ['text-sm', 'body3'],
      ['text-xs', 'body4'],
    ] as const)(
      '%s routes to %s with empty sx (canonical match)',
      (visualAppearance, variantTag) => {
        const result = resolveParagraphStyles({visualAppearance});
        expect(result.variantTag).toBe(variantTag);
        expect(result.sx).toEqual({});
      },
    );

    it('text-md and body-two produce identical results', () => {
      const a = resolveParagraphStyles({visualAppearance: 'text-md'});
      const b = resolveParagraphStyles({visualAppearance: 'body-two'});
      expect(a).toEqual(b);
    });

    it('text-lg and body-one produce identical results', () => {
      expect(resolveParagraphStyles({visualAppearance: 'text-lg'})).toEqual(
        resolveParagraphStyles({visualAppearance: 'body-one'}),
      );
    });
  });

  describe('new larger text-* cells (no canonical body match)', () => {
    it('text-4xl emits inline size + line-height + letter-spacing', () => {
      const result = resolveParagraphStyles({visualAppearance: 'text-4xl'});
      expect(result.variantTag).toBe('body1');
      expect(result.sx.fontSize).toBe('2.25rem');
      expect(result.sx.lineHeight).toBe('2.75rem');
      expect(result.sx.letterSpacing).toBe('-0.02em');
    });

    it('text-3xl emits inline size + line-height (no letter-spacing)', () => {
      const result = resolveParagraphStyles({visualAppearance: 'text-3xl'});
      expect(result.variantTag).toBe('body1');
      expect(result.sx.fontSize).toBe('1.875rem');
      expect(result.sx.lineHeight).toBe('2.375rem');
      expect(result.sx.letterSpacing).toBeUndefined();
    });

    it('text-2xl emits inline size + line-height', () => {
      const result = resolveParagraphStyles({visualAppearance: 'text-2xl'});
      expect(result.sx.fontSize).toBe('1.5rem');
      expect(result.sx.lineHeight).toBe('2rem');
    });

    it('text-xl emits inline size + line-height', () => {
      const result = resolveParagraphStyles({visualAppearance: 'text-xl'});
      expect(result.sx.fontSize).toBe('1.25rem');
      expect(result.sx.lineHeight).toBe('1.875rem');
    });
  });

  describe('individual overrides', () => {
    it('isStrong: true emits sx.fontWeight = Semibold (600)', () => {
      const result = resolveParagraphStyles({
        visualAppearance: 'body-two',
        isStrong: true,
      });
      expect(result.sx.fontWeight).toBe(WEIGHTS.semibold);
      expect(result.sx.fontWeight).toBe(600);
    });

    it('isStrong: false (default) does NOT emit fontWeight', () => {
      const result = resolveParagraphStyles({
        visualAppearance: 'body-two',
      });
      expect(result.sx.fontWeight).toBeUndefined();
    });

    it('isItalic: true emits sx.fontStyle = italic', () => {
      const result = resolveParagraphStyles({
        visualAppearance: 'body-two',
        isItalic: true,
      });
      expect(result.sx.fontStyle).toBe('italic');
    });

    it('isItalic: false (default) does NOT emit fontStyle', () => {
      const result = resolveParagraphStyles({
        visualAppearance: 'body-two',
      });
      expect(result.sx.fontStyle).toBeUndefined();
    });

    it('isStrong + isItalic on text-2xl compose with the cell overrides', () => {
      const result = resolveParagraphStyles({
        visualAppearance: 'text-2xl',
        isStrong: true,
        isItalic: true,
      });
      expect(result.variantTag).toBe('body1');
      expect(result.sx.fontSize).toBe('1.5rem');
      expect(result.sx.lineHeight).toBe('2rem');
      expect(result.sx.fontWeight).toBe(WEIGHTS.semibold);
      expect(result.sx.fontStyle).toBe('italic');
    });
  });
});
