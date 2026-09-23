// Imports the tokens module directly; the full registration list trips Jest's
// ESM transforms (see code.org/__tests__/divider.registration.test.ts).

import {hourOfAiDesignTokens} from '../designTokens';

describe('Hour of AI design tokens', () => {
  it('offers the brand radius presets in Studio', () => {
    expect(hourOfAiDesignTokens.borderRadius).toEqual({
      none: 'var(--codeai-radius-none)',
      small: 'var(--codeai-radius-sm)',
      medium: 'var(--codeai-radius-md)',
      large: 'var(--codeai-radius-lg)',
    });
  });

  it('keeps every value whitespace-free for the SDK token resolver', () => {
    for (const value of Object.values(
      hourOfAiDesignTokens.borderRadius ?? {},
    )) {
      expect(value).not.toMatch(/\s/);
    }
  });
});
