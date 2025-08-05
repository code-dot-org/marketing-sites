import {Components, Theme} from '@mui/material/styles';

const ROBOTO_MONO_FONT = 'Roboto Mono';

export const ACCORDION_OVERRIDES: Components<Theme>['MuiAccordion'] = {
  styleOverrides: {
    root: () => ({
      fontFamily: ROBOTO_MONO_FONT,
    }),
  },
};

export const ACCORDION_SUMMARY_OVERRIDES: Components<Theme>['MuiAccordionSummary'] =
  {
    styleOverrides: {
      root: ({theme}) => ({
        '&.MuiAccordionSummary-root': {
          fontFamily: ROBOTO_MONO_FONT,
          '&.Mui-expanded': {
            minHeight: '48px',
          },
        },
        '&.MuiAccordionSummary-content.Mui-expanded': {
          margin: theme.spacing(1, 0),
        },
        '&.MuiAccordionSummary-content': {
          margin: theme.spacing(1, 0),
        },
      }),
    },
  };

export const ACCORDION_DETAILS_OVERRIDES: Components<Theme>['MuiAccordionDetails'] =
  {
    styleOverrides: {
      root: ({theme}) => ({
        fontFamily: ROBOTO_MONO_FONT,
        padding: theme.spacing(2, 3),
        '&.MuiAccordionDetails-root': {
          backgroundColor: theme.palette.background.default,
        },
      }),
    },
  };
