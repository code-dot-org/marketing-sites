import {Components, Theme} from '@mui/material/styles';

import {GEIST_FONT} from '@/themes/code.org/constants/fonts';
import {codeaiRadius} from '@/themes/code.org/constants/radius';
import {createFontStack} from '@/themes/common/constants';

export const ACCORDION_OVERRIDES: Components<Theme>['MuiAccordion'] = {
  styleOverrides: {
    root: ({theme}) => ({
      boxShadow: 'none',
      borderRadius: codeaiRadius('md', '4px'),
      border: '1px solid var(--borders-neutral-primary)',
      padding: 0,
      margin: 0,
      marginBottom: theme.spacing(2),
      '&:hover': {
        backgroundColor: 'var(--background-neutral-secondary)',
      },
      // MUI's between-item divider line; stray on separated rounded cards.
      '&::before': {
        display: 'none',
      },
      // MUI's built-in first/last-of-type rules reset these corners to the
      // theme.shape radius (4px), out-specifying the root radius above.
      '&:first-of-type': {
        borderTopLeftRadius: codeaiRadius('md', '4px'),
        borderTopRightRadius: codeaiRadius('md', '4px'),
      },
      '&:last-of-type': {
        marginBottom: 0,
        borderBottomLeftRadius: codeaiRadius('md', '4px'),
        borderBottomRightRadius: codeaiRadius('md', '4px'),
      },
      '&:has(.Mui-focusVisible)': {
        outline: '2px solid var(--codeai-purple-primary)',
        outlineOffset: '2px',
        borderRadius: codeaiRadius('md', '6px'),
      },
    }),
  },
};

export const ACCORDION_SUMMARY_OVERRIDES: Components<Theme>['MuiAccordionSummary'] =
  {
    styleOverrides: {
      root: ({theme}) => ({
        padding: theme.spacing(1.5, 2.5, 1.5, 2.5),
        // The summary's opaque background paints over the rounded root
        // border, so it needs the same radius as the root.
        borderRadius: codeaiRadius('md', '0'),
        color: 'var(---text-neutral-primary)',
        backgroundColor: 'var(--background-neutral-primary)',
        minHeight: 'unset',

        '&.Mui-expanded': {
          minHeight: 'unset',
          // Expanded, the details panel below owns the bottom corners.
          borderBottomLeftRadius: 0,
          borderBottomRightRadius: 0,
        },

        '&:hover': {
          '.MuiAccordionSummary-expandIconWrapper .MuiSvgIcon-root': {
            color: 'var(--text-neutral-quaternary)',
          },
        },
        '&.Mui-focusVisible': {
          backgroundColor: 'var(--background-neutral-primary)',
        },
        '.MuiAccordionSummary-content': {
          fontFamily: createFontStack(GEIST_FONT),
          fontStyle: 'normal',
          fontWeight: 600,
          fontSize: '1rem', // 16px
          lineHeight: '148%',
          margin: 0,
          minHeight: 'unset',
          color: 'var(--text-neutral-primary)',

          '&.Mui-expanded': {
            margin: 0,
            minHeight: 'unset',
          },
        },
        '.MuiAccordionSummary-expandIconWrapper .MuiSvgIcon-root': {
          color: 'var(--text-neutral-placeholder)',
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
        padding: theme.spacing(2.5), // 20px
        borderTop: '1px solid var(--borders-neutral-primary)',
        backgroundColor: 'var(--codeai-gray-1)',
        borderBottomLeftRadius: codeaiRadius('md', '0'),
        borderBottomRightRadius: codeaiRadius('md', '0'),
      }),
    },
  };
