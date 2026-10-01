import {Components, Theme} from '@mui/material/styles';

import {brandRadius} from '@/themes/common/radius';

import {HOUR_OF_AI_TEXT_FONT_STACK} from '../typography/fontStack';

const DARK_PURPLE = 'var(--palette-dark-purple)';
const PINK = 'var(--palette-pink)';
const BLACK = 'var(--palette-black)';
const WHITE = 'var(--palette-white)';

// Text Link, matching Code.org's (themes/code.org/styleOverrides/link.ts)
// except for the colors.
export const LINK_OVERRIDES: Components<Theme>['MuiLink'] = {
  styleOverrides: {
    root: ({theme}) => ({
      fontFamily: HOUR_OF_AI_TEXT_FONT_STACK,
      fontWeight: 700,
      padding: 0,
      marginBottom: theme.spacing(2),
      textTransform: 'none',
      // Underline the label span only, so icons stay plain. Scoped to
      // [data-hierarchy] so raw MuiLink usages don't inherit it.
      textDecoration: 'none',
      '&[data-hierarchy] > span': {
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
        color: DARK_PURPLE,
        '&:hover': {color: PINK},
        '&[data-loading="true"]': {color: PINK},
        '&[aria-disabled="true"]': {
          color: 'var(--button-color-link-disabled)',
        },
      },
      '&[data-hierarchy="black"]': {
        color: BLACK,
        '&[aria-disabled="true"]': {
          color: 'var(--button-color-link-disabled)',
        },
      },
      '&[data-hierarchy="white"]': {
        color: WHITE,
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
        outline: `2px solid ${DARK_PURPLE}`,
        outlineOffset: '4px',
        borderRadius: brandRadius('sm'),
      },

      '&.MuiLink-root.link--size-s': {
        fontSize: '0.75rem', // 12px
        lineHeight: '1.125rem', // 18px
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
