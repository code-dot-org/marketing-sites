import {Components, Theme} from '@mui/material/styles';

export const DIVIDER_OVERRIDES: Components<Theme>['MuiDivider'] = {
  styleOverrides: {
    root: ({theme}) => ({
      '&.MuiDivider-root.divider--color-primary': {
        borderColor: 'var(--background-neutral-quaternary)',
      },
      '&.MuiDivider-root.divider--color-strong': {
        borderColor: 'var(--background-neutral-senary)',
      },
      '&.MuiDivider-root.divider--color-white': {
        borderColor: theme.palette.common.white,
      },
      '&.MuiDivider-root.divider--margin-none': {
        marginTop: 0,
        marginBottom: 0,
      },
      '&.MuiDivider-root.divider--margin-xs': {
        marginTop: theme.spacing(1),
        marginBottom: theme.spacing(1),
      },
      '&.MuiDivider-root.divider--margin-s': {
        marginTop: theme.spacing(2),
        marginBottom: theme.spacing(2),
      },
      '&.MuiDivider-root.divider--margin-m': {
        marginTop: theme.spacing(4),
        marginBottom: theme.spacing(4),
      },
      '&.MuiDivider-root.divider--margin-l': {
        marginTop: theme.spacing(8),
        marginBottom: theme.spacing(8),
      },
      // Vertical dividers swap the margin axis: spacing goes to the sides of
      // the line instead of above/below. Three-class selectors out-specify
      // the base margin rules.
      '&.MuiDivider-root.divider--vertical.divider--margin-none': {
        marginTop: 0,
        marginBottom: 0,
        marginLeft: 0,
        marginRight: 0,
      },
      '&.MuiDivider-root.divider--vertical.divider--margin-xs': {
        marginTop: 0,
        marginBottom: 0,
        marginLeft: theme.spacing(1),
        marginRight: theme.spacing(1),
      },
      '&.MuiDivider-root.divider--vertical.divider--margin-s': {
        marginTop: 0,
        marginBottom: 0,
        marginLeft: theme.spacing(2),
        marginRight: theme.spacing(2),
      },
      '&.MuiDivider-root.divider--vertical.divider--margin-m': {
        marginTop: 0,
        marginBottom: 0,
        marginLeft: theme.spacing(4),
        marginRight: theme.spacing(4),
      },
      '&.MuiDivider-root.divider--vertical.divider--margin-l': {
        marginTop: 0,
        marginBottom: 0,
        marginLeft: theme.spacing(8),
        marginRight: theme.spacing(8),
      },
    }),
  },
};
