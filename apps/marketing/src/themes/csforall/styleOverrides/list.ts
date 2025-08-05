import {Components, Theme} from '@mui/material/styles';

import {NOTO_FONT} from '@/themes/constants/fonts';

export const LIST_OVERRIDES: Components<Theme>['MuiList'] = {
  styleOverrides: {
    root: ({theme}) => ({
      padding: 0,
      paddingInlineStart: theme.spacing(2.5), // 20px
      gap: '0.5rem',
    }),
  },
};

export const LIST_ITEM_OVERRIDES: Components<Theme>['MuiListItem'] = {
  styleOverrides: {
    root: ({theme}) => ({
      display: 'list-item',
      padding: 0,
      gap: theme.spacing(1),
      '&::marker': {
        color: theme.palette.text.primary,
        fontFamily: NOTO_FONT,
      },
    }),
  },
};
