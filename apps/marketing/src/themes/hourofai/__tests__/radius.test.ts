import {createTheme} from '@mui/material/styles';
import {readFileSync} from 'fs';
import {join} from 'path';

import HourOfAiTheme from '@/themes/hourofai';

const radiiScss = readFileSync(
  join(
    __dirname,
    '../../../../../../packages/component-library-styles/radii.scss',
  ),
  'utf8',
);

const brandBlock = (brand: string) =>
  new RegExp(`\\[data-brand='${brand}'\\]\\s*\\{([^}]*)\\}`).exec(
    radiiScss,
  )?.[1] ?? '';

const radiusVars = (block: string) =>
  Object.fromEntries(
    [...block.matchAll(/--codeai-radius-(\w+):\s*([^;]+);/g)].map(m => [
      m[1],
      m[2].trim(),
    ]),
  );

// Resolves a styleOverrides slot, whether authored as an object or callback.
const slot = (component: string, name: string) => {
  const overrides = HourOfAiTheme.components?.[
    component as keyof typeof HourOfAiTheme.components
  ] as {styleOverrides?: Record<string, unknown>} | undefined;
  const value = overrides?.styleOverrides?.[name];
  return typeof value === 'function' ? value({theme: createTheme()}) : value;
};

describe('Hour of AI radii', () => {
  it('defines the Hour of AI radius scale', () => {
    expect(radiusVars(brandBlock('HourOfAI'))).toEqual({
      none: '0rem',
      sm: '0.75rem',
      md: '1rem',
      lg: '1.5rem',
    });
  });

  it('leaves the Code.org radius scale unchanged', () => {
    expect(radiusVars(brandBlock('Code.org'))).toEqual({
      none: '0rem',
      sm: '0.5rem',
      md: '0.625rem',
      lg: '1.25rem',
    });
  });

  it('rounds buttons with the small radius', () => {
    expect(slot('MuiButton', 'root')).toMatchObject({
      borderRadius: 'var(--codeai-radius-sm)',
    });
  });

  it('rounds images with the large radius when rounded corners are on', () => {
    expect(slot('MuiImage', 'root')).toMatchObject({
      '&.image--hasRoundedCorners': {borderRadius: 'var(--codeai-radius-lg)'},
    });
  });

  it('rounds accordions, including MUI’s first/last-of-type corners', () => {
    expect(slot('MuiAccordion', 'root')).toMatchObject({
      borderRadius: 'var(--codeai-radius-md)',
      '&:first-of-type': {
        borderTopLeftRadius: 'var(--codeai-radius-md)',
        borderTopRightRadius: 'var(--codeai-radius-md)',
      },
      '&:last-of-type': {
        borderBottomLeftRadius: 'var(--codeai-radius-md)',
        borderBottomRightRadius: 'var(--codeai-radius-md)',
      },
    });
  });

  it('rounds the accordion summary and details so they don’t square the corners', () => {
    expect(slot('MuiAccordion', 'root')).toMatchObject({
      boxShadow: 'none',
      '&::before': {display: 'none'},
    });
    expect(slot('MuiAccordionSummary', 'root')).toMatchObject({
      borderRadius: 'var(--codeai-radius-md)',
      '&.Mui-expanded': {borderBottomLeftRadius: 0, borderBottomRightRadius: 0},
    });
    expect(slot('MuiAccordionDetails', 'root')).toMatchObject({
      borderBottomLeftRadius: 'var(--codeai-radius-md)',
      borderBottomRightRadius: 'var(--codeai-radius-md)',
    });
  });

  it('keeps video square', () => {
    expect(slot('MuiVideo', 'wrapper')).toMatchObject({
      borderRadius: 'var(--codeai-radius-none)',
    });
  });
});
