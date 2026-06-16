import {Components, Theme} from '@mui/material/styles';

import {createFontStack} from '@/themes/common/constants';

import {ROBOTO_MONO_FONT} from '../constants/fonts';

export const LINK_OVERRIDES: Components<Theme>['MuiLink'] = {
  styleOverrides: {
    root: ({theme}) => ({
      fontFamily: createFontStack(ROBOTO_MONO_FONT),
      lineHeight: 1.45,
      marginBottom: theme.spacing(2),
      textDecoration: 'underline',
      transition: 'color 0.2s ease-in-out, opacity 0.2s ease-in-out',
      '& > i, & > svg': {
        color: 'inherit',
        transition: 'color 0.2s ease-in-out',
      },
      '& > svg': {
        marginTop: theme.spacing(0.4),
      },
      '&:hover': {
        opacity: 0.8,
      },
      '&:focus-visible': {
        outline: `2px solid ${theme.palette.primary.main}`,
        outlineOffset: '2px',
        borderRadius: theme.spacing(0.5),
      },
      '&.MuiLink-root.link--size-l': {
        fontSize: '1.375rem', // 22px
      },
      '&.MuiLink-root.link--size-m': {
        fontSize: '1.125rem', // 18px
      },
      '&.MuiLink-root.link--size-s': {
        fontSize: '1rem', // 16px
      },
      '&.MuiLink-root.link--size-xs': {
        fontSize: '0.875rem', // 14px
      },
    }),
  },
};
