import {Components, Theme} from '@mui/material/styles';

import {brandRadius} from '@/themes/common/radius';

export const ACCORDION_OVERRIDES: Components<Theme>['MuiAccordion'] = {
  styleOverrides: {
    root: ({theme}) => ({
      borderRadius: brandRadius('md'),
      padding: 0,
      margin: 0,
      marginBottom: theme.spacing(2),
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
    }),
  },
};

export const ACCORDION_SUMMARY_OVERRIDES: Components<Theme>['MuiAccordionSummary'] =
  {
    styleOverrides: {
      root: ({theme}) => ({
        padding: theme.spacing(1.5, 2.5),
        minHeight: 'unset',
        '&.Mui-expanded': {minHeight: 'unset'},
        '.MuiAccordionSummary-content': {
          margin: 0,
          minHeight: 'unset',
          '&.Mui-expanded': {margin: 0, minHeight: 'unset'},
        },
      }),
    },
  };

export const ACCORDION_DETAILS_OVERRIDES: Components<Theme>['MuiAccordionDetails'] =
  {
    styleOverrides: {
      root: ({theme}) => ({
        padding: theme.spacing(2.5),
      }),
    },
  };
