import {readFileSync} from 'fs';
import {join} from 'path';

import {
  createCodeOrgFontStack,
  NOTO_SANS_CHAIN,
  CODE_ORG_DISPLAY_FONT_STACK,
  CODE_ORG_TEXT_FONT_STACK,
} from '../fontStack';

describe('Noto Sans chain (NOTO_SANS_CHAIN)', () => {
  it('contains 20 variants', () => {
    expect(NOTO_SANS_CHAIN.length).toBe(20);
  });

  it('starts with Latin Noto Sans', () => {
    expect(NOTO_SANS_CHAIN[0]).toBe('Noto Sans');
  });

  it('ends with Noto Sans Thaana', () => {
    expect(NOTO_SANS_CHAIN[NOTO_SANS_CHAIN.length - 1]).toBe(
      'Noto Sans Thaana',
    );
  });

  it('matches the SCSS $noto-sans-fonts list in font.scss line-by-line', () => {
    // The SCSS layer at packages/component-library-styles/font.scss is the
    // canonical source of the chain; the TS chain mirrors it. If this test
    // fails the two are out of sync — fix the TS to match SCSS (or update
    // both if the chain is intentionally changed).
    const fontScssPath = join(
      __dirname,
      '../../../../../../../packages/component-library-styles/font.scss',
    );
    const source = readFileSync(fontScssPath, 'utf8');
    const m = /\$noto-sans-fonts:([\s\S]*?);/m.exec(source);
    expect(m).not.toBeNull();
    const scssChain = (m![1].match(/'([^']+)'/g) ?? []).map(s =>
      s.replace(/'/g, ''),
    );
    expect(scssChain).toEqual([...NOTO_SANS_CHAIN]);
  });
});

describe('createCodeOrgFontStack', () => {
  it('produces a comma-joined string with primary first and sans-serif last', () => {
    const stack = createCodeOrgFontStack('Geist');
    expect(stack.startsWith('Geist, Noto Sans,')).toBe(true);
    expect(stack.endsWith(', sans-serif')).toBe(true);
  });

  it('preserves the Noto Sans chain order', () => {
    const stack = createCodeOrgFontStack('Space Grotesk');
    const parts = stack.split(', ');
    expect(parts[0]).toBe('Space Grotesk');
    expect(parts.slice(1, 1 + NOTO_SANS_CHAIN.length)).toEqual([
      ...NOTO_SANS_CHAIN,
    ]);
    expect(parts[parts.length - 1]).toBe('sans-serif');
  });
});

describe('pre-built stacks', () => {
  it('CODE_ORG_TEXT_FONT_STACK starts with Geist', () => {
    expect(CODE_ORG_TEXT_FONT_STACK.startsWith('Geist, ')).toBe(true);
  });

  it('CODE_ORG_DISPLAY_FONT_STACK starts with Space Grotesk', () => {
    expect(CODE_ORG_DISPLAY_FONT_STACK.startsWith('Space Grotesk, ')).toBe(
      true,
    );
  });
});
