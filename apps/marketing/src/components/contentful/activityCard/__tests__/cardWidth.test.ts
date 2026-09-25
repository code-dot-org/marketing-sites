import {cardWidthCss} from '@/components/contentful/activityCard/cardWidth';

describe('cardWidthCss', () => {
  it('passes px and % widths through', () => {
    expect(cardWidthCss('325px')).toBe('325px');
    expect(cardWidthCss(' 100% ')).toBe('100%');
    expect(cardWidthCss('33.3%')).toBe('33.3%');
  });

  it('falls back to auto for empty or other values', () => {
    for (const value of [
      undefined,
      '',
      '325',
      '20rem',
      'auto',
      '1px;color:red',
    ]) {
      expect(cardWidthCss(value)).toBe('auto');
    }
  });
});
