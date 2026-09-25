import {Components, Theme} from '@mui/material/styles';

import {brandRadius} from '@/themes/common/radius';

export const VIDEO_OVERRIDES: Components<Theme>['MuiVideo'] = {
  styleOverrides: {
    wrapper: {
      borderRadius: brandRadius('none'),
    },
    // Centers the play button over the poster, like the Code.org video.
    facade: {
      '.video-play-button': {
        position: 'absolute',
        height: '64px',
        width: '64px',
        minWidth: 0,
        border: 0,
        borderRadius: '100px',
        background: 'var(--palette-white)',
        boxShadow: '0 3px 6px 0 rgb(0 0 0 / 0.2)',
        svg: {
          fontSize: '52px',
          color: 'var(--palette-dark-purple)',
        },
        '&:hover': {
          background: 'var(--palette-white)',
          opacity: 0.9,
        },
      },
    },
  },
};
