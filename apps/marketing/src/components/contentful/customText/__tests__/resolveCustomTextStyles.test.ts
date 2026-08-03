import {SCALE_DISPLAY, SCALE_TEXT} from '@/themes/code.org/typography/tokens';

import {
  CUSTOM_TEXT_TYPE_DEFAULTS,
  resolveCustomTextStyles,
  type CustomTextType,
} from '../resolveCustomTextStyles';

describe('resolveCustomTextStyles', () => {
  describe('type defaults (US1)', () => {
    it('seeds every type with its default tag, size cell, weight and transform', () => {
      const custom = resolveCustomTextStyles({type: 'custom'});
      expect(custom.tag).toBe('span');
      expect(custom.sx.fontSize).toBe(SCALE_TEXT.md.fontSize);
      expect(custom.sx.fontWeight).toBe(400);
      expect(custom.sx.textTransform).toBeUndefined();

      const overline = resolveCustomTextStyles({type: 'overline'});
      expect(overline.tag).toBe('span');
      expect(overline.sx.fontSize).toBe(SCALE_TEXT.sm.fontSize);
      expect(overline.sx.fontWeight).toBe(600);
      expect(overline.sx.textTransform).toBe('uppercase');
      expect(overline.resolvedColor).toBe('var(--codeai-gray-6)');

      const statistic = resolveCustomTextStyles({type: 'statistic'});
      expect(statistic.sx.fontSize).toBe(SCALE_DISPLAY['2xl'].fontSize);
      expect(statistic.sx.fontWeight).toBe(700);
    });

    it('takes the line-height from the resolved size cell for every type', () => {
      expect(resolveCustomTextStyles({type: 'custom'}).sx.lineHeight).toBe(
        SCALE_TEXT.md.lineHeight,
      );
      expect(resolveCustomTextStyles({type: 'overline'}).sx.lineHeight).toBe(
        SCALE_TEXT.sm.lineHeight,
      );
      expect(resolveCustomTextStyles({type: 'statistic'}).sx.lineHeight).toBe(
        SCALE_DISPLAY['2xl'].lineHeight,
      );
      expect(resolveCustomTextStyles({type: 'subtitle'}).sx.lineHeight).toBe(
        SCALE_TEXT['2xl'].lineHeight,
      );
    });

    it('takes the line-height from an overridden size and font track', () => {
      expect(
        resolveCustomTextStyles({
          type: 'custom',
          font: 'display',
          textSize: 'sm',
        }).sx.lineHeight,
      ).toBe(SCALE_DISPLAY.sm.lineHeight);
    });

    it('defaults Subtitle to <p> and every other type to <span>', () => {
      expect(resolveCustomTextStyles({type: 'subtitle'}).tag).toBe('p');
      (['custom', 'overline', 'statistic'] as const).forEach(type => {
        expect(resolveCustomTextStyles({type}).tag).toBe('span');
      });
    });

    it('seeds Featured Subhead with the text track, 2xl size, Regular weight and Purple Dark', () => {
      const r = resolveCustomTextStyles({type: 'subtitle'});
      expect(r.sx.fontFamily).toContain('Geist');
      expect(r.sx.fontSize).toBe(SCALE_TEXT['2xl'].fontSize);
      expect(r.sx.fontWeight).toBe(400);
      expect(r.resolvedColor).toBe('var(--codeai-purple-dark)');
    });

    it('Featured Subhead steps down to xl on tablet and lg on mobile', () => {
      const r = resolveCustomTextStyles({type: 'subtitle'});
      expect(r.sx['@media (max-width:899.95px)']).toEqual({
        fontSize: SCALE_TEXT.xl.fontSize,
        lineHeight: SCALE_TEXT.xl.lineHeight,
      });
      expect(r.sx['@media (max-width:599.95px)']).toEqual({
        fontSize: SCALE_TEXT.lg.fontSize,
        lineHeight: SCALE_TEXT.lg.lineHeight,
      });
    });

    it('Featured Subhead steps are dropped when the author fixes a size', () => {
      const bySizeStep = resolveCustomTextStyles({
        type: 'subtitle',
        textSize: 'md',
      });
      const byNumericSize = resolveCustomTextStyles({
        type: 'subtitle',
        fontSize: 2,
      });
      for (const r of [bySizeStep, byNumericSize]) {
        expect(r.sx['@media (max-width:899.95px)']).toBeUndefined();
        expect(r.sx['@media (max-width:599.95px)']).toBeUndefined();
      }
    });

    it('falls back to the custom type for an unknown value', () => {
      const result = resolveCustomTextStyles({
        type: 'bogus' as unknown as CustomTextType,
      });
      expect(result.sx.fontSize).toBe(SCALE_TEXT.md.fontSize);
      expect(result.tag).toBe('span');
    });
  });

  describe('overrides isolate to their own dimension (US2)', () => {
    it('htmlTag override changes only the tag, including overriding Subtitle p', () => {
      const r = resolveCustomTextStyles({type: 'subtitle', htmlTag: 'span'});
      expect(r.tag).toBe('span');
      // size/weight still from subtitle default (text/2xl/regular)
      expect(r.sx.fontSize).toBe(SCALE_TEXT['2xl'].fontSize);
      expect(r.sx.fontWeight).toBe(400);
    });

    it('textSize override swaps the size cell on the resolved track only', () => {
      const r = resolveCustomTextStyles({type: 'custom', textSize: 'xl'});
      expect(r.sx.fontSize).toBe(SCALE_TEXT.xl.fontSize);
      expect(r.sx.fontWeight).toBe(400); // unchanged
    });

    it('numeric fontSize override wins over the size cell, keeping the cell line-height', () => {
      const r = resolveCustomTextStyles({type: 'custom', fontSize: 2.5});
      expect(r.sx.fontSize).toBe('2.5rem');
      expect(r.sx.lineHeight).toBe(SCALE_TEXT.md.lineHeight);
    });

    it('numeric lineHeight override is independent of fontSize', () => {
      const r = resolveCustomTextStyles({
        type: 'custom',
        fontSize: 2.5,
        lineHeight: 1.1,
      });
      expect(r.sx.fontSize).toBe('2.5rem');
      expect(r.sx.lineHeight).toBe(1.1);
    });

    it('font override swaps the track (and font family)', () => {
      const r = resolveCustomTextStyles({type: 'custom', font: 'display'});
      // md cell on the display track
      expect(r.sx.fontSize).toBe(SCALE_DISPLAY.md.fontSize);
    });

    it('fontWeight override changes only the weight', () => {
      const r = resolveCustomTextStyles({type: 'custom', fontWeight: '700'});
      expect(r.sx.fontWeight).toBe(700);
      expect(r.sx.fontSize).toBe(SCALE_TEXT.md.fontSize);
    });

    it("'default' sentinel inherits the type default", () => {
      const r = resolveCustomTextStyles({
        type: 'overline',
        htmlTag: 'default',
        textSize: 'default',
        font: 'default',
        fontWeight: 'default',
        textTransform: 'default',
      });
      const def = CUSTOM_TEXT_TYPE_DEFAULTS.overline;
      expect(r.tag).toBe(def.tag);
      expect(r.sx.fontSize).toBe(SCALE_TEXT.sm.fontSize);
      expect(r.sx.fontWeight).toBe(600);
      expect(r.sx.textTransform).toBe('uppercase');
    });

    it("textTransform 'none' forces no transform over a type default", () => {
      const r = resolveCustomTextStyles({
        type: 'overline',
        textTransform: 'none',
      });
      expect(r.sx.textTransform).toBeUndefined();
    });
  });

  describe('contrast switching (US3)', () => {
    it('contrast-switches text color against a dark Section background', () => {
      const onDark = resolveCustomTextStyles({
        type: 'custom', // color black
        enclosingBackground: 'purpleDark',
      });
      // black text on a dark bg flips to white
      expect(onDark.resolvedColor).toBe('white');
    });
  });

  describe('icon precedence (US4)', () => {
    it('resolves a left icon', () => {
      expect(
        resolveCustomTextStyles({type: 'custom', iconNameLeft: 'star'}).icon,
      ).toEqual({name: 'star', side: 'left'});
    });

    it('resolves a right icon when only the right name is set', () => {
      expect(
        resolveCustomTextStyles({type: 'custom', iconNameRight: 'arrow-right'})
          .icon,
      ).toEqual({name: 'arrow-right', side: 'right'});
    });

    it('left wins when both are set', () => {
      expect(
        resolveCustomTextStyles({
          type: 'custom',
          iconNameLeft: 'star',
          iconNameRight: 'arrow-right',
        }).icon,
      ).toEqual({name: 'star', side: 'left'});
    });

    it('is null when neither is set', () => {
      expect(resolveCustomTextStyles({type: 'custom'}).icon).toBeNull();
    });
  });
});
