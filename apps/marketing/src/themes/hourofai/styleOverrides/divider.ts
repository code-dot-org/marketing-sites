import {Components, Theme} from '@mui/material/styles';

// Divider `margin` sizes; vertical dividers space their sides instead.
const MARGIN_STEPS = {none: 0, xs: 1, s: 2, m: 4, l: 8} as const;

export const DIVIDER_OVERRIDES: Components<Theme>['MuiDivider'] = {
  styleOverrides: {
    root: ({theme}) =>
      Object.fromEntries(
        Object.entries(MARGIN_STEPS).flatMap(([size, step]) => [
          [
            `&.MuiDivider-root.divider--margin-${size}`,
            {marginTop: theme.spacing(step), marginBottom: theme.spacing(step)},
          ],
          [
            `&.MuiDivider-root.divider--vertical.divider--margin-${size}`,
            {
              marginTop: 0,
              marginBottom: 0,
              marginLeft: theme.spacing(step),
              marginRight: theme.spacing(step),
            },
          ],
        ]),
      ),
  },
};
