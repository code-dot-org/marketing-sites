import {Components, Theme} from '@mui/material/styles';

import {brandRadius} from '@/themes/common/radius';

export const ACCORDION_OVERRIDES: Components<Theme>['MuiAccordion'] = {
  styleOverrides: {
    root: {
      borderRadius: brandRadius('md'),
      // MUI's first/last-of-type rules otherwise reset these to theme.shape.
      '&:first-of-type': {
        borderTopLeftRadius: brandRadius('md'),
        borderTopRightRadius: brandRadius('md'),
      },
      '&:last-of-type': {
        borderBottomLeftRadius: brandRadius('md'),
        borderBottomRightRadius: brandRadius('md'),
      },
    },
  },
};
