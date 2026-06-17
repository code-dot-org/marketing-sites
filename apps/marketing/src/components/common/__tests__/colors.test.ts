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
  ])('maps %s background to %s tone', (bg, expected) => {
    expect(backgroundToneFor(bg as BrandColor)).toBe(expected);
  });

  it.each([
    ['purpleLight', 'light'],
    ['blueLight', 'light'],
    ['greenLight', 'light'],
    ['orangeLight', 'light'],
    ['pinkLight', 'light'],
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

  describe('FR-010 — white text on any light background becomes black', () => {
    it.each<[BrandColor]>([
      ['purpleLight'],
      ['blueLight'],
      ['greenLight'],
      ['orangeLight'],
      ['pinkLight'],
      ['purpleMid'],
      ['blueMid'],
      ['white'],
    ])('white text on %s bg → black', bg => {
      const result = resolveTextColorForBackground('white', bg);
      expect(result.value).toBe('black');
      expect(result.behavior).toBe('white-text-on-light-bg-becomes-black');
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
    it('white text → black', () => {
      const result = resolveTextColorForBackground('white', null);
      expect(result.value).toBe('black');
      expect(result.behavior).toBe('white-text-on-light-bg-becomes-black');
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
