import {Components, Theme} from '@mui/material/styles';

// Spacing below text elements (Heading, Paragraph, Custom Text) when
// gutterBottom is on.
export const TYPOGRAPHY_OVERRIDES: Components<Theme>['MuiTypography'] = {
  styleOverrides: {
    root: ({theme}) => ({
      '&.MuiTypography-caption': {
        margin: theme.spacing(1, 0, 0),
      },
    }),
    gutterBottom: ({theme}) => ({
      '&.MuiTypography-h1': {marginBottom: theme.spacing(3)},
      '&.MuiTypography-h2': {marginBottom: theme.spacing(2.125)},
      '&.MuiTypography-h3': {marginBottom: theme.spacing(1.75)},
      '&.MuiTypography-h4': {marginBottom: theme.spacing(1.5)},
      '&.MuiTypography-h5': {marginBottom: theme.spacing(1.125)},
      '&.MuiTypography-h6': {marginBottom: theme.spacing(1)},
      '&.MuiTypography-body1': {marginBottom: theme.spacing(2)},
      '&.MuiTypography-body2': {marginBottom: theme.spacing(2)},
      '&.MuiTypography-body3': {marginBottom: theme.spacing(1.5)},
      '&.MuiTypography-body4': {marginBottom: theme.spacing(1.25)},
      '&.MuiTypography-overline': {marginBottom: theme.spacing(2)},
      '&.MuiTypography-caption': {marginBottom: theme.spacing(2)},
    }),
  },
};
