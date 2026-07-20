import {Components, Theme} from '@mui/material/styles';

import {codeaiRadius} from '@/themes/code.org/constants/radius';

export const IMAGE_OVERRIDES: Components<Theme>['MuiImage'] = {
  styleOverrides: {
    root: () => ({
      // Border/shadow decorations retired for the CodeAI rebrand: the picker
      // option is gone and stored decoration values render unstyled.
      '&.image--hasRoundedCorners': {
        borderRadius: codeaiRadius('lg', '4px'),
      },
    }),
  },
};
