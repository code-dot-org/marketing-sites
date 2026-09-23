import {Components, Theme} from '@mui/material/styles';

import {brandRadius} from '@/themes/common/radius';

export const IMAGE_OVERRIDES: Components<Theme>['MuiImage'] = {
  styleOverrides: {
    root: {
      '&.image--hasRoundedCorners': {
        borderRadius: brandRadius('lg'),
      },
    },
  },
};
