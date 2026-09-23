import {ThemeProvider} from '@mui/material/styles';
import {render, screen} from '@testing-library/react';

import Badge from '@/components/contentful/badge/Badge';
import Heading from '@/components/contentful/heading/Heading';
import Paragraph from '@/components/contentful/paragraph/Paragraph';
import Section from '@/components/contentful/section/Section';
import CDOTheme from '@/themes/code.org';
import {CODE_ORG_BRAND_COLORS} from '@/themes/code.org/colors/brandColors';
import {getBrandColors} from '@/themes/common/colors/brandColors';
import HourOfAiTheme from '@/themes/hourofai';

const withHourOfAi = (node: React.ReactElement) =>
  render(<ThemeProvider theme={HourOfAiTheme}>{node}</ThemeProvider>);

describe('Hour of AI theme colors', () => {
  it('carries its brand colors; Code.org falls back to its own', () => {
    expect(getBrandColors(HourOfAiTheme)).not.toBe(CODE_ORG_BRAND_COLORS);
    expect(getBrandColors(CDOTheme)).toBe(CODE_ORG_BRAND_COLORS);
  });

  it('uses the palette for MUI colors', () => {
    const {palette} = HourOfAiTheme;
    expect(palette.primary.main).toBe('#1F1976');
    expect(palette.secondary.main).toBe('#E11970');
    expect(palette.text.primary).toBe('#212121');
    expect(palette.common.black).toBe('#212121');
  });

  it('does not emit the brand colors as MUI CSS variables', () => {
    const {generateStyleSheets} = HourOfAiTheme as unknown as {
      generateStyleSheets: () => unknown;
    };
    expect(JSON.stringify(generateStyleSheets())).not.toMatch(/brandColors/);
  });

  it('paints Section backgrounds, keeping legacy `primary` white', () => {
    const root = (
      HourOfAiTheme.components?.MuiContainer?.styleOverrides?.root as (arg: {
        theme: typeof HourOfAiTheme;
      }) => Record<string, {background: string}>
    )({theme: HourOfAiTheme});
    const rule = (value: string) =>
      root[`.section-background-${value}:has(&.MuiContainer-root)`]?.background;
    expect(rule('purpleDark')).toBe('var(--palette-dark-purple)');
    expect(rule('purplePrimary')).toBe('var(--palette-dark-purple)');
    expect(rule('primary')).toBe('var(--palette-white)');
  });
});

describe('components on the Hour of AI theme', () => {
  it('swaps text on a dark Section', () => {
    withHourOfAi(
      <Section background="purpleDark">
        <Heading visualAppearance="heading-md" removeMarginBottom>
          Title
        </Heading>
        <Paragraph color="pinkPrimary" removeMarginBottom>
          Body
        </Paragraph>
      </Section>,
    );
    expect(screen.getByText('Title')).toHaveStyle({
      color: 'var(--palette-white)',
    });
    expect(screen.getByText('Body')).toHaveStyle({
      color: 'var(--palette-light-pink)',
    });
  });

  it('uses black text on a Blue badge fill', () => {
    withHourOfAi(<Badge text="New" color="blue" appearance="dark" />);
    expect(screen.getByText('New')).toHaveStyle({
      color: 'var(--palette-black)',
    });
  });
});
