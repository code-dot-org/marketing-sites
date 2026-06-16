import {Components, Theme} from '@mui/material/styles';

import {createFontStack} from '@/themes/common/constants';

import {GEIST_FONT} from '../constants/fonts';

export const LINK_OVERRIDES: Components<Theme>['MuiLink'] = {
  styleOverrides: {
    root: ({theme}) => ({
      fontFamily: createFontStack(GEIST_FONT),
      lineHeight: 1.4,
      marginBottom: theme.spacing(2),
      textDecoration: 'underline',
      transition: 'color 0.2s ease-in-out, opacity 0.2s ease-in-out',
      '& > i, & > svg': {
        color: 'inherit',
        transition: 'color 0.2s ease-in-out',
      },
      '&:hover': {
        opacity: 0.8,
      },
      '&:focus-visible': {
        outline: '2px solid var(--text-brand-teal-primary)',
        outlineOffset: '2px',
        borderRadius: theme.spacing(0.5),
      },
      '&.MuiLink-root.link--size-l': {
        fontSize: '1.25rem', // 20px
      },
      '&.MuiLink-root.link--size-m': {
        fontSize: '1rem', // 16px
      },
      '&.MuiLink-root.link--size-s': {
        fontSize: '0.875rem', // 14px
      },
      '&.MuiLink-root.link--size-xs': {
        fontSize: '0.75rem', // 12px
      },
    }),
  },
};
