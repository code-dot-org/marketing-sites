import {Components, Theme} from '@mui/material/styles';

import {brandRadius} from '@/themes/common/radius';

const DARK_PURPLE = 'var(--palette-dark-purple)';
const PINK = 'var(--palette-pink)';
const LIGHT_BLUE = 'var(--palette-light-blue)';
const WHITE = 'var(--palette-white)';

// ButtonMui types, via its `button--color-*` classes.
export const BUTTON_OVERRIDES: Components<Theme>['MuiButton'] = {
  styleOverrides: {
    root: {
      borderRadius: brandRadius('sm'),
      '&:focus-visible': {
        outline: `2px solid ${DARK_PURPLE}`,
        outlineOffset: '2px',
      },
      '&.MuiButton-contained.button--color-primary': {
        backgroundColor: DARK_PURPLE,
        color: WHITE,
        '&:hover': {backgroundColor: PINK},
      },
      '&.MuiButton-contained.button--color-emphasized': {
        backgroundColor: PINK,
        color: WHITE,
        '&:hover': {backgroundColor: DARK_PURPLE},
      },
      '&.MuiButton-contained.button--color-white': {
        backgroundColor: WHITE,
        color: DARK_PURPLE,
        '&:hover': {backgroundColor: LIGHT_BLUE},
      },
      '&.MuiButton-outlined.button--color-secondary': {
        borderColor: DARK_PURPLE,
        color: DARK_PURPLE,
        '&:hover': {backgroundColor: LIGHT_BLUE},
      },
    },
  },
};
