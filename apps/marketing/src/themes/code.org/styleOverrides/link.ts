import {Components, Theme} from '@mui/material/styles';

import {codeaiRadius} from '@/themes/code.org/constants/radius';
import {createFontStack} from '@/themes/common/constants';

import {SPACE_GROTESK_FONT} from '../constants/fonts';

// Brand Text Link — see specs/008-brand-buttons/research.md R12.
export const LINK_OVERRIDES: Components<Theme>['MuiLink'] = {
  styleOverrides: {
    root: ({theme}) => ({
      fontFamily: createFontStack(SPACE_GROTESK_FONT),
      fontWeight: 700,
      padding: 0,
      marginBottom: theme.spacing(2),
      textDecoration: 'underline',
      textDecorationStyle: 'solid',
      textDecorationThickness: 'from-font',
      transition: 'color 0.2s ease-in-out',

      // Defeat the global MuiSvgIcon color override.
      '& svg': {
        color: 'inherit',
      },

      '&[data-hierarchy="color"]': {
        color: 'var(--button-color-purple-primary)',
        '&:hover': {
          color: 'var(--button-color-purple-hover)',
        },
        '&[data-loading="true"]': {
          color: 'var(--button-color-purple-hover)',
        },
        '&[aria-disabled="true"]': {
          color: 'var(--button-color-link-disabled)',
        },
      },
      '&[data-hierarchy="black"]': {
        color: 'var(--button-color-black)',
        '&[data-loading="true"]': {
          color: 'var(--button-color-black)',
        },
        '&[aria-disabled="true"]': {
          color: 'var(--button-color-link-disabled)',
        },
      },
      '&[data-hierarchy="white"]': {
        color: 'var(--button-color-white)',
        '&[data-loading="true"]': {
          color: 'var(--button-color-white)',
        },
        '&[aria-disabled="true"]': {
          color: 'var(--button-color-disabled-light)',
        },
      },

      '&[data-disable-underline="true"]': {
        textDecoration: 'none',
      },

      '&[data-inline="true"]': {
        fontFamily: 'inherit',
        fontSize: 'inherit',
        lineHeight: 'inherit',
        letterSpacing: 'inherit',
        textTransform: 'none',
        marginBottom: 0,
      },

      '&:focus-visible': {
        outline: '2px solid var(--button-focus-ring)',
        outlineOffset: '4px',
        borderRadius: codeaiRadius('sm', '10px'), // matches button radius
      },

      '&.MuiLink-root.link--size-s': {
        fontSize: '0.875rem', // 14px
        lineHeight: '21.7px',
        textTransform: 'none',
        gap: '4px',
      },
      '&.MuiLink-root.link--size-m': {
        fontSize: '0.875rem', // 14px
        lineHeight: '21.7px',
        textTransform: 'uppercase',
        gap: '4px',
      },
      '&.MuiLink-root.link--size-l': {
        fontSize: '1rem', // 16px
        lineHeight: '24px',
        textTransform: 'uppercase',
        gap: '6px',
      },

      '&[data-loading="true"]': {
        textTransform: 'none',
      },
    }),
  },
};
