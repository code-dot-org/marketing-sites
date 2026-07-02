import {Components, Theme} from '@mui/material/styles';

import {SPACE_GROTESK_FONT} from '@/themes/code.org/constants/fonts';
import {codeaiRadius} from '@/themes/code.org/constants/radius';

// Empty template for table component overrides in MUI theme.
export const TABLE_OVERRIDES: Components<Theme>['MuiTable'] = {
  styleOverrides: {
    root: () => ({
      tableLayout: 'fixed',
    }),
  },
};

export const TABLE_CELL_OVERRIDES: Components<Theme>['MuiTableCell'] = {
  styleOverrides: {
    root: ({theme}) => ({
      padding: `${theme.spacing(1.5)} ${theme.spacing(2)}`, //14px 18px
      border: `1px solid var(--borders-neutral-primary)`,
      color: 'var(--text-neutral-primary)',
      verticalAlign: 'top',
    }),
    head: () => ({
      backgroundColor: 'var(--codeai-purple-primary)',
      borderColor: 'var(--codeai-purple-dark)',
      textTransform: 'uppercase',

      '.MuiTypography-root.MuiTypography-body2.paragraph--color-primary': {
        fontSize: '0.75rem',
        fontWeight: 500,
        color: 'var(--text-neutral-white-fixed);',
        margin: 0,
        lineHeight: '1.23rem',
      },
      // !important: Paragraph sets fontWeight via MUI sx (emotion-generated
      // high-specificity class) which otherwise beats this theme override.
      '& > p': {
        fontFamily: `"${SPACE_GROTESK_FONT}", sans-serif !important`,
        fontWeight: '700 !important',
        color: 'var(--text-neutral-white-fixed)',
      },
    }),
    body: () => ({
      border: `1px solid var(--borders-neutral-primary)`,

      '.MuiTypography-root.MuiTypography-body2.paragraph--color-primary': {
        fontSize: '1rem',
        color: 'var(--text-neutral-primary)',
        margin: 0,
        lineHeight: '1.48rem',
      },
    }),
  },
};

export const TABLE_ROW_OVERRIDES: Components<Theme>['MuiTableRow'] = {
  styleOverrides: {
    root: () => ({
      color: 'var(--text-neutral-primary)',
      backgroundColor: 'var(--background-neutral-secondary);',
      '&:nth-of-type(odd)': {
        backgroundColor: 'var(--background-neutral-primary)',
      },
    }),
  },
};

export const TABLE_CONTAINER_OVERRIDES: Components<Theme>['MuiTableContainer'] =
  {
    styleOverrides: {
      root: () => ({
        borderRadius: codeaiRadius('md', '0.25rem'),
      }),
    },
  };
