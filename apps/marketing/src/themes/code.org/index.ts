'use client';
import {createTheme} from '@mui/material';

import {STYLE_OVERRIDES} from './styleOverrides';
import {buildTypography} from './typography/buildTypography';
import {CODE_ORG_TEXT_FONT_STACK} from './typography/fontStack';

const theme = createTheme({
  cssVariables: true,
  components: STYLE_OVERRIDES,
  shape: {
    borderRadius: 4,
  },
  typography: buildTypography({defaultFontFamily: CODE_ORG_TEXT_FONT_STACK}),
});

export default theme;
