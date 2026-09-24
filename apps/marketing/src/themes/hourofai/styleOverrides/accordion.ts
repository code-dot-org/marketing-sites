import {Components, Theme} from '@mui/material/styles';

import {brandRadius} from '@/themes/common/radius';
import {HOUR_OF_AI_TEXT_FONT_STACK} from '@/themes/hourofai/typography/fontStack';

// Code.org's accordion styles on the Hour of AI palette.
const BLACK = 'var(--palette-black)';
const BLUE = 'var(--palette-blue)';
const DARK_PURPLE = 'var(--palette-dark-purple)';
const LIGHT_BLUE = 'var(--palette-light-blue)';
const WHITE = 'var(--palette-white)';

export const ACCORDION_OVERRIDES: Components<Theme>['MuiAccordion'] = {
  styleOverrides: {
    root: ({theme}) => ({
      boxShadow: 'none',
      borderRadius: brandRadius('md'),
      border: `1px solid ${BLUE}`,
      backgroundColor: WHITE,
      padding: 0,
      margin: 0,
      marginBottom: theme.spacing(2),
      // MUI's between-item divider line; stray on separated rounded cards.
      '&::before': {
        display: 'none',
      },
      // MUI's first/last-of-type rules otherwise reset these to theme.shape.
      '&:first-of-type': {
        borderTopLeftRadius: brandRadius('md'),
        borderTopRightRadius: brandRadius('md'),
      },
      '&:last-of-type': {
        marginBottom: 0,
        borderBottomLeftRadius: brandRadius('md'),
        borderBottomRightRadius: brandRadius('md'),
      },
      '&:has(.Mui-focusVisible)': {
        outline: `2px solid ${DARK_PURPLE}`,
        outlineOffset: '2px',
      },
    }),
  },
};

export const ACCORDION_SUMMARY_OVERRIDES: Components<Theme>['MuiAccordionSummary'] =
  {
    styleOverrides: {
      root: ({theme}) => ({
        padding: theme.spacing(1.5, 2.5),
        // The summary's opaque background paints over the rounded root
        // border, so it needs the same radius as the root.
        borderRadius: brandRadius('md'),
        color: BLACK,
        backgroundColor: WHITE,
        minHeight: 'unset',
        '&.Mui-expanded': {
          minHeight: 'unset',
          // Expanded, the details panel below owns the bottom corners.
          borderBottomLeftRadius: 0,
          borderBottomRightRadius: 0,
        },
        '&.Mui-focusVisible': {
          backgroundColor: WHITE,
        },
        '.MuiAccordionSummary-content': {
          fontFamily: HOUR_OF_AI_TEXT_FONT_STACK,
          fontWeight: 600,
          fontSize: '1rem',
          lineHeight: '148%',
          margin: 0,
          minHeight: 'unset',
          color: BLACK,
          '&.Mui-expanded': {margin: 0, minHeight: 'unset'},
        },
        '.MuiAccordionSummary-expandIconWrapper .MuiSvgIcon-root': {
          color: DARK_PURPLE,
          fontSize: '1rem',
          height: '1rem',
          transform: 'scale(1.8)',
        },
      }),
    },
  };

export const ACCORDION_DETAILS_OVERRIDES: Components<Theme>['MuiAccordionDetails'] =
  {
    styleOverrides: {
      root: ({theme}) => ({
        padding: theme.spacing(2.5),
        // Separates the open panel from its title.
        borderTop: `1px solid ${LIGHT_BLUE}`,
        backgroundColor: WHITE,
        borderBottomLeftRadius: brandRadius('md'),
        borderBottomRightRadius: brandRadius('md'),
      }),
    },
  };
