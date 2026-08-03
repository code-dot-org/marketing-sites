import {Components, Theme} from '@mui/material/styles';

import {GEIST_FONT} from '@/themes/code.org/constants/fonts';
import {createFontStack} from '@/themes/common/constants';

export const LIST_OVERRIDES: Components<Theme>['MuiList'] = {
  styleOverrides: {
    root: ({theme}) => ({
      padding: 0,
      paddingInlineStart: theme.spacing(2.5), // 20px
      gap: '0.5rem',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'flex-start',
      margin: theme.spacing(2, 0, 0),
      '&:first-child, &:empty': {
        margin: 0,
      },
    }),
  },
};

export const LIST_ITEM_OVERRIDES: Components<Theme>['MuiListItem'] = {
  styleOverrides: {
    root: ({theme}) => ({
      display: 'list-item',
      padding: 0,
      gap: theme.spacing(1),
      color: 'var(--text-neutral-primary)',
      fontFamily: createFontStack(GEIST_FONT),
      fontWeight: 400,
      fontStyle: 'normal',

      '&::marker': {
        color: 'var(--text-neutral-primary)',
        fontFamily: GEIST_FONT,
      },

      // Mirror the CodeAI contrast switch (colors.scss [data-bg-tone]): on
      // brand dark Sections inherited text flips to white, but the explicit
      // colors above (and the ::marker reading them) would stay dark.
      '[data-bg-tone="dark"] &': {
        color: 'var(--neutral-base-white)',

        '&::marker': {
          color: 'var(--neutral-base-white)',
        },
      },
    }),
  },
};
