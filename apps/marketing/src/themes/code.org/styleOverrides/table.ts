import {Components, Theme} from '@mui/material/styles';

export const TABLE_OVERRIDES: Components<Theme>['MuiTable'] = {
  styleOverrides: {
    root: () => ({}),
  },
};

export const TABLE_CELL_OVERRIDES: Components<Theme>['MuiTableCell'] = {
  styleOverrides: {
    root: ({theme}) => ({
      padding: `${theme.spacing(1.75)} ${theme.spacing(2.25)}`, //14px 18px
      border: `1px solid var(--borders-neutral-primary)`,
    }),
    head: () => ({
      fontSize: '0.875rem',
      fontWeight: 500,
      backgroundColor: 'var(--background-brand-teal-primary)',
      color: 'var(--text-neutral-white-fixed);',
      borderColor: 'var(--borders-brand-teal-strong)',
      textTransform: 'uppercase',
    }),
    body: () => ({
      fontSize: '1.125rem',
      color: 'var(--text-neutral-primary)',
      border: `1px solid var(--borders-neutral-primary)`,
    }),
  },
};

export const TABLE_ROW_OVERRIDES: Components<Theme>['MuiTableRow'] = {
  styleOverrides: {
    root: () => ({
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
      root: () => ({}),
    },
  };
