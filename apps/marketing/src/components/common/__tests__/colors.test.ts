import {
  BRAND_COLORS,
  BrandColor,
  backgroundToneFor,
  resolveTextColorForBackground,
} from '../colors';

describe('backgroundToneFor', () => {
  it('returns mid when no enclosing background', () => {
    expect(backgroundToneFor(null)).toBe('mid');
    expect(backgroundToneFor(undefined)).toBe('mid');
  });

  it.each([
    ['black', 'dark'],
    ['purpleDark', 'dark'],
    ['purplePrimary', 'dark'],
    ['bluePrimary', 'dark'],
    ['greenDark', 'dark'],
    ['gray6', 'dark'],
    ['gray9', 'dark'],
  ])('maps %s background to %s tone', (bg, expected) => {
    expect(backgroundToneFor(bg as BrandColor)).toBe(expected);
  });

  it.each([
    ['purpleLight', 'light'],
    ['blueLight', 'light'],
    ['greenLight', 'light'],
    ['orangeLight', 'light'],
    ['pinkLight', 'light'],
    // Gray 1–5 all carry shade 'light' per the Figma split — including
    // mid-looking Gray 5.
    ['gray1', 'light'],
    ['gray5', 'light'],
  ])('maps %s background to light tone', (bg, expected) => {
    expect(backgroundToneFor(bg as BrandColor)).toBe(expected);
  });

  it.each([
    ['purpleMid', 'mid'],
    ['blueMid', 'mid'],
    ['greenMid', 'mid'],
    ['orangeMid', 'mid'],
    ['pinkMid', 'mid'],
    ['white', 'mid'],
  ])('maps %s background to mid tone', (bg, expected) => {
    expect(backgroundToneFor(bg as BrandColor)).toBe(expected);
  });
});

describe('resolveTextColorForBackground', () => {
  describe('FR-007 — dark text on dark background becomes white', () => {
    it.each<[BrandColor, BrandColor]>([
      ['black', 'purpleDark'],
      ['black', 'purplePrimary'],
      ['black', 'black'],
      ['purpleDark', 'purpleDark'],
      ['purplePrimary', 'blueDark'],
      ['greenDark', 'pinkPrimary'],
      ['orangePrimary', 'black'],
    ])('%s text on %s bg → white', (text, bg) => {
      const result = resolveTextColorForBackground(text, bg);
      expect(result.value).toBe('white');
      expect(result.behavior).toBe('dark-text-on-dark-bg-becomes-white');
    });
  });

  describe('FR-012 — light text on dark background passes through', () => {
    it.each<[BrandColor, BrandColor]>([
      ['white', 'purpleDark'],
      ['white', 'black'],
      ['purpleMid', 'blueDark'],
      ['greenLight', 'purplePrimary'],
      ['pinkMid', 'black'],
    ])('%s text on %s bg passes through', (text, bg) => {
      const result = resolveTextColorForBackground(text, bg);
      expect(result.value).toBe(text);
      expect(result.behavior).toBe('passthrough');
    });
  });

  describe('FR-008 — low-contrast text on *-light background shifts to family *-dark', () => {
    it.each<[BrandColor, BrandColor, BrandColor]>([
      ['purpleMid', 'purpleLight', 'purpleDark'],
      ['purpleLight', 'purpleLight', 'purpleDark'],
      ['greenLight', 'purpleLight', 'greenDark'], // cross-family
      ['blueMid', 'orangeLight', 'blueDark'],
      ['pinkMid', 'pinkLight', 'pinkDark'],
    ])('%s text on %s bg → %s', (text, bg, expected) => {
      const result = resolveTextColorForBackground(text, bg);
      expect(result.value).toBe(expected);
      expect(result.behavior).toBe(
        'low-contrast-text-on-light-bg-shifts-to-family-dark',
      );
    });
  });

  describe('FR-009 — low-contrast text on *-mid or white background shifts to family *-primary', () => {
    it.each<[BrandColor, BrandColor, BrandColor]>([
      ['purpleMid', 'purpleMid', 'purplePrimary'],
      ['purpleMid', 'white', 'purplePrimary'],
      ['pinkLight', 'white', 'pinkPrimary'],
      ['greenLight', 'blueMid', 'greenPrimary'], // cross-family
      ['orangeMid', 'white', 'orangePrimary'],
    ])('%s text on %s bg → %s', (text, bg, expected) => {
      const result = resolveTextColorForBackground(text, bg);
      expect(result.value).toBe(expected);
      expect(result.behavior).toBe(
        'low-contrast-text-on-mid-or-white-bg-shifts-to-family-primary',
      );
    });
  });

  describe('white text always passes through (literal #FFFFFF)', () => {
    // Pre-CodeAI behavior: "White" means literal #FFFFFF on every background.
    // Existing content that picked White on a now-light/mid section must keep
    // rendering white; authors who want adaptive text default to "Default"
    // (Black). The previous FR-010 (white-on-light → black) is intentionally
    // retired.
    it.each<[BrandColor]>([
      ['purpleLight'],
      ['blueLight'],
      ['greenLight'],
      ['orangeLight'],
      ['pinkLight'],
      ['purpleMid'],
      ['blueMid'],
      ['white'],
      ['purpleDark'],
      ['black'],
    ])('white text on %s bg passes through', bg => {
      const result = resolveTextColorForBackground('white', bg);
      expect(result.value).toBe('white');
      expect(result.behavior).toBe('passthrough');
    });
  });

  describe('FR-011 — dark text on light background passes through', () => {
    it.each<[BrandColor, BrandColor]>([
      ['black', 'purpleLight'],
      ['purpleDark', 'purpleLight'],
      ['purplePrimary', 'white'],
      ['greenDark', 'pinkMid'],
      ['black', 'white'],
    ])('%s text on %s bg passes through', (text, bg) => {
      const result = resolveTextColorForBackground(text, bg);
      expect(result.value).toBe(text);
      expect(result.behavior).toBe('passthrough');
    });
  });

  describe('FR-013 — no enclosing background is treated as white (mid tone)', () => {
    it('white text passes through (literal white)', () => {
      const result = resolveTextColorForBackground('white', null);
      expect(result.value).toBe('white');
      expect(result.behavior).toBe('passthrough');
    });

    it('purpleMid text → purplePrimary', () => {
      const result = resolveTextColorForBackground('purpleMid', undefined);
      expect(result.value).toBe('purplePrimary');
      expect(result.behavior).toBe(
        'low-contrast-text-on-mid-or-white-bg-shifts-to-family-primary',
      );
    });

    it('black text → passthrough', () => {
      const result = resolveTextColorForBackground('black', null);
      expect(result.value).toBe('black');
      expect(result.behavior).toBe('passthrough');
    });
  });

  describe('transparent enclosing background bypasses the contrast switch', () => {
    // Section background='transparent' means the visible bg lives on an
    // ancestor — the author owns the color and renders verbatim.
    it.each<[BrandColor]>([
      ['white'],
      ['black'],
      ['purpleDark'],
      ['purpleLight'],
      ['pinkMid'],
      ['greenLight'],
    ])('%s text on transparent bg passes through', text => {
      const result = resolveTextColorForBackground(text, 'transparent');
      expect(result.value).toBe(text);
      expect(result.behavior).toBe('passthrough');
    });
  });

  describe('gray ramp — numbered shades route through the gray special case', () => {
    it.each<[BrandColor, BrandColor]>([
      ['gray6', 'purpleDark'],
      ['gray8', 'black'],
      ['gray9', 'gray8'],
    ])('%s text on %s bg → white', (text, bg) => {
      const result = resolveTextColorForBackground(text, bg);
      expect(result.value).toBe('white');
      expect(result.behavior).toBe('dark-text-on-dark-bg-becomes-white');
    });

    it.each<[BrandColor, BrandColor]>([
      ['gray1', 'black'],
      ['gray2', 'purpleDark'],
      ['gray5', 'gray9'],
    ])('%s text on dark %s bg passes through', (text, bg) => {
      const result = resolveTextColorForBackground(text, bg);
      expect(result.value).toBe(text);
      expect(result.behavior).toBe('passthrough');
    });

    it.each<[BrandColor, BrandColor]>([
      ['gray1', 'gray2'],
      ['gray3', 'purpleLight'],
      ['gray5', 'gray1'],
    ])('%s text on light %s bg → gray8', (text, bg) => {
      const result = resolveTextColorForBackground(text, bg);
      expect(result.value).toBe('gray8');
      expect(result.behavior).toBe(
        'low-contrast-text-on-light-bg-shifts-to-family-dark',
      );
    });

    it.each<[BrandColor, BrandColor | null]>([
      ['gray1', 'white'],
      ['gray4', 'purpleMid'],
      ['gray5', null],
    ])('%s text on mid %s bg → gray6', (text, bg) => {
      const result = resolveTextColorForBackground(text, bg);
      expect(result.value).toBe('gray6');
      expect(result.behavior).toBe(
        'low-contrast-text-on-mid-or-white-bg-shifts-to-family-primary',
      );
    });

    it.each<[BrandColor, BrandColor]>([
      ['gray6', 'purpleLight'],
      ['gray8', 'white'],
      ['gray9', 'gray1'],
    ])('%s text on light/mid %s bg passes through', (text, bg) => {
      const result = resolveTextColorForBackground(text, bg);
      expect(result.value).toBe(text);
      expect(result.behavior).toBe('passthrough');
    });
  });

  it('every brand-color × brand-color pairing produces a valid token value', () => {
    const valid = new Set(BRAND_COLORS.map(c => c.value as string));
    for (const text of BRAND_COLORS) {
      for (const bg of BRAND_COLORS) {
        const result = resolveTextColorForBackground(text.value, bg.value);
        expect(valid.has(result.value as string)).toBe(true);
      }
    }
  });
});
