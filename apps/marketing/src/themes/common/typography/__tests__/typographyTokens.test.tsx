import {createTheme, ThemeProvider} from '@mui/material/styles';
import {renderHook} from '@testing-library/react';
import {ReactNode} from 'react';

import CDOTheme from '@/themes/code.org';
import {CODE_ORG_TYPOGRAPHY_TOKENS} from '@/themes/code.org/typography/typographyTokens';
import CSForAllTheme from '@/themes/csforall';
import HourOfAiTheme from '@/themes/hourofai';
import {HOUR_OF_AI_TYPOGRAPHY_TOKENS} from '@/themes/hourofai/typography/typographyTokens';

import {getTypographyTokens, useTypographyTokens} from '../typographyTokens';

describe('getTypographyTokens', () => {
  it('returns the tokens carried by the theme', () => {
    // createTheme deep-clones its options, so compare by value.
    expect(getTypographyTokens(HourOfAiTheme)).toStrictEqual(
      HOUR_OF_AI_TYPOGRAPHY_TOKENS,
    );
  });

  it.each([
    ['Code.org', CDOTheme],
    ['CSforAll', CSForAllTheme],
    ['a bare MUI', createTheme()],
  ])('falls back to Code.org tokens for the %s theme', (_, theme) => {
    expect(getTypographyTokens(theme)).toBe(CODE_ORG_TYPOGRAPHY_TOKENS);
  });
});

describe('useTypographyTokens', () => {
  it('reads the tokens from the active ThemeProvider', () => {
    const wrapper = ({children}: {children: ReactNode}) => (
      <ThemeProvider theme={HourOfAiTheme}>{children}</ThemeProvider>
    );
    const {result} = renderHook(() => useTypographyTokens(), {wrapper});
    expect(result.current).toStrictEqual(HOUR_OF_AI_TYPOGRAPHY_TOKENS);
  });

  it('falls back to Code.org tokens without a ThemeProvider', () => {
    const {result} = renderHook(() => useTypographyTokens());
    expect(result.current).toBe(CODE_ORG_TYPOGRAPHY_TOKENS);
  });
});
