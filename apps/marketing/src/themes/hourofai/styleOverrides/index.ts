import {Components, Theme} from '@mui/material/styles';

import {ACCORDION_OVERRIDES} from './accordion';
import {BUTTON_OVERRIDES} from './button';
import {IMAGE_OVERRIDES} from './image';
import {VIDEO_OVERRIDES} from './video';

export const STYLE_OVERRIDES: Components<Theme> = {
  MuiAccordion: ACCORDION_OVERRIDES,
  MuiButton: BUTTON_OVERRIDES,
  MuiImage: IMAGE_OVERRIDES,
  MuiVideo: VIDEO_OVERRIDES,
};
