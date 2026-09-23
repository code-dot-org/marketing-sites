import {Components, Theme} from '@mui/material/styles';

import {brandRadius} from '@/themes/common/radius';

export const VIDEO_OVERRIDES: Components<Theme>['MuiVideo'] = {
  styleOverrides: {
    wrapper: {
      borderRadius: brandRadius('none'),
    },
  },
};
