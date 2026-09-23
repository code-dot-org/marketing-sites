import {Components, Theme} from '@mui/material/styles';

import {brandRadius} from '@/themes/common/radius';

export const BUTTON_OVERRIDES: Components<Theme>['MuiButton'] = {
  styleOverrides: {
    root: {
      borderRadius: brandRadius('sm'),
    },
  },
};
