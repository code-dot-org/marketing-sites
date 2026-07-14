import {Components, Theme} from '@mui/material/styles';

import {codeaiRadius} from '@/themes/code.org/constants/radius';
import {CODE_ORG_TEXT_FONT_STACK} from '@/themes/code.org/typography/fontStack';

// Brand Text Link — see specs/008-brand-buttons/research.md R12.
export const LINK_OVERRIDES: Components<Theme>['MuiLink'] = {
  styleOverrides: {
    root: ({theme}) => ({
      fontFamily: CODE_ORG_TEXT_FONT_STACK,
      fontWeight: 700,
      padding: 0,
      marginBottom: theme.spacing(2),
      textTransform: 'none',
      // The underline lives on the label span (Link.tsx wraps its text in a
      // <span>) so sibling icons never render underlined.
      textDecoration: 'none',
      '& > span': {
        textDecoration: 'underline',
        textDecorationStyle: 'solid',
        textDecorationThickness: 'from-font',
      },
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

      '&[data-disable-underline="true"] > span': {
        textDecoration: 'none',
      },

      '&[data-inline="true"]': {
        fontFamily: 'inherit',
        fontSize: 'inherit',
        lineHeight: 'inherit',
        letterSpacing: 'inherit',
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
        gap: '4px',
      },
      '&.MuiLink-root.link--size-m': {
        fontSize: '0.875rem', // 14px
        lineHeight: '21.7px',
        gap: '4px',
      },
      '&.MuiLink-root.link--size-l': {
        fontSize: '1rem', // 16px
        lineHeight: '24px',
        gap: '6px',
      },
    }),
  },
};
