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
      expect(overline.sx.fontSize).toBe(SCALE_TEXT.md.fontSize);
      expect(overline.sx.fontWeight).toBe(600);
      expect(overline.sx.textTransform).toBe('capitalize');

      const statistic = resolveCustomTextStyles({type: 'statistic'});
      expect(statistic.sx.fontSize).toBe(SCALE_DISPLAY.lg.fontSize);
      expect(statistic.sx.fontWeight).toBe(700);
    });

    it('pins line-height to 1 for span types and keeps the size cell line-height for Subtitle', () => {
      expect(resolveCustomTextStyles({type: 'custom'}).sx.lineHeight).toBe(1);
      expect(resolveCustomTextStyles({type: 'overline'}).sx.lineHeight).toBe(1);
      expect(resolveCustomTextStyles({type: 'statistic'}).sx.lineHeight).toBe(
        1,
      );
      expect(resolveCustomTextStyles({type: 'subtitle'}).sx.lineHeight).toBe(
        SCALE_TEXT.xl.lineHeight,
      );
    });

    it('defaults Subtitle to <p> and every other type to <span>', () => {
      expect(resolveCustomTextStyles({type: 'subtitle'}).tag).toBe('p');
      (
        [
          'custom',
          'overline',
          'statistic',
          'courseTopics',
          'courseLabs',
        ] as const
      ).forEach(type => {
        expect(resolveCustomTextStyles({type}).tag).toBe('span');
      });
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
      // size/weight still from subtitle default (text/xl/regular)
      expect(r.sx.fontSize).toBe(SCALE_TEXT.xl.fontSize);
      expect(r.sx.fontWeight).toBe(400);
    });

    it('textSize override swaps the size cell on the resolved track only', () => {
      const r = resolveCustomTextStyles({type: 'custom', textSize: 'xl'});
      expect(r.sx.fontSize).toBe(SCALE_TEXT.xl.fontSize);
      expect(r.sx.fontWeight).toBe(400); // unchanged
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
      expect(r.sx.fontSize).toBe(SCALE_TEXT.md.fontSize);
      expect(r.sx.fontWeight).toBe(600);
      expect(r.sx.textTransform).toBe('capitalize');
    });

    it("textTransform 'none' forces no transform over a type default", () => {
      const r = resolveCustomTextStyles({
        type: 'overline',
        textTransform: 'none',
      });
      expect(r.sx.textTransform).toBeUndefined();
    });
  });

  describe('contrast switching and background (US3)', () => {
    it('contrast-switches text color against a dark Section background when no background is set', () => {
      const onDark = resolveCustomTextStyles({
        type: 'custom', // color black
        enclosingBackground: 'purpleDark',
      });
      // black text on a dark bg flips to white
      expect(onDark.resolvedColor).toBe('white');
      expect(onDark.background).toBeNull();
    });

    it('filled fill bypasses the contrast switch and emits a fixed 1px border + radius', () => {
      const chip = resolveCustomTextStyles({
        type: 'custom',
        color: 'purpleDark',
        backgroundFill: 'filled',
        backgroundShape: 'pill',
        backgroundColor: 'purpleLight',
        borderColor: 'purplePrimary',
        enclosingBackground: 'black', // would otherwise switch
      });
      expect(chip.resolvedColor).toBe('var(--codeai-purple-dark)');
      expect(chip.background).toEqual({
        backgroundColor: 'var(--codeai-purple-light)',
        border: '1px solid var(--codeai-purple-primary)',
        borderRadius: '999px',
        padding: '0.25em 0.5em',
      });
    });

    it('outline fill draws a transparent interior with only the border', () => {
      const r = resolveCustomTextStyles({
        type: 'custom',
        backgroundFill: 'outline',
        backgroundShape: 'roundedSquare',
        borderColor: 'greenPrimary',
      });
      expect(r.background?.backgroundColor).toBe('transparent');
      expect(r.background?.border).toBe(
        '1px solid var(--codeai-green-primary)',
      );
      expect(r.background?.borderRadius).toBe(
        'var(--codeai-radius-md, 0.25rem)',
      );
    });

    it('chip types carry a default filled background + border', () => {
      const r = resolveCustomTextStyles({type: 'courseTopics'});
      expect(r.background).not.toBeNull();
      expect(r.background?.border).toContain('1px solid');
    });

    it('Course Topics default: white fill, black border, pill, 0.25em 0.5em padding, medium weight, capitalize', () => {
      const r = resolveCustomTextStyles({type: 'courseTopics'});
      expect(r.sx.fontWeight).toBe(500);
      expect(r.sx.textTransform).toBe('capitalize');
      expect(r.background).toEqual({
        backgroundColor: 'white',
        border: '1px solid #000000',
        borderRadius: '999px',
        padding: '0.25em 0.5em',
      });
    });

    it('Course Labs default: purpleLight fill, purpleMid border, rounded square, 0.25em 0.5em padding, capitalize', () => {
      const r = resolveCustomTextStyles({type: 'courseLabs'});
      expect(r.sx.textTransform).toBe('capitalize');
      expect(r.background).toEqual({
        backgroundColor: 'var(--codeai-purple-light)',
        border: '1px solid var(--codeai-purple-mid)',
        borderRadius: 'var(--codeai-radius-md, 0.25rem)',
        padding: '0.25em 0.5em',
      });
    });

    it("backgroundFill 'none' removes a chip type's default background", () => {
      const r = resolveCustomTextStyles({
        type: 'courseTopics',
        backgroundFill: 'none',
      });
      expect(r.background).toBeNull();
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
