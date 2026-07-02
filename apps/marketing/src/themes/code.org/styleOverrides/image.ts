import {Components, Theme} from '@mui/material/styles';

import {codeaiRadius} from '@/themes/code.org/constants/radius';

export const IMAGE_OVERRIDES: Components<Theme>['MuiImage'] = {
  styleOverrides: {
    root: () => ({
      '&.image--hasBorder': {
        border: `1px solid var(--borders-neutral-primary)`,
      },
      '&.image--hasShadow': {
        boxShadow: '0.5rem 0.5rem 0 0 var(--background-brand-teal-light)',
      },
      '&.image--hasRoundedCorners': {
        borderRadius: codeaiRadius('lg', '4px'),
      },
    }),
  },
};
