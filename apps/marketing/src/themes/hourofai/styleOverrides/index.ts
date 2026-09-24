import {Components, Theme} from '@mui/material/styles';

import {
  ACCORDION_DETAILS_OVERRIDES,
  ACCORDION_OVERRIDES,
  ACCORDION_SUMMARY_OVERRIDES,
} from './accordion';
import {BUTTON_OVERRIDES} from './button';
import {CONTAINER_OVERRIDES} from './container';
import {DIVIDER_OVERRIDES} from './divider';
import {IMAGE_OVERRIDES} from './image';
import {LIST_ITEM_OVERRIDES, LIST_OVERRIDES} from './list';
import {TYPOGRAPHY_OVERRIDES} from './typography';
import {VIDEO_OVERRIDES} from './video';

export const STYLE_OVERRIDES: Components<Theme> = {
  MuiAccordion: ACCORDION_OVERRIDES,
  MuiAccordionDetails: ACCORDION_DETAILS_OVERRIDES,
  MuiAccordionSummary: ACCORDION_SUMMARY_OVERRIDES,
  MuiButton: BUTTON_OVERRIDES,
  MuiContainer: CONTAINER_OVERRIDES,
  MuiDivider: DIVIDER_OVERRIDES,
  MuiImage: IMAGE_OVERRIDES,
  MuiList: LIST_OVERRIDES,
  MuiListItem: LIST_ITEM_OVERRIDES,
  MuiTypography: TYPOGRAPHY_OVERRIDES,
  MuiVideo: VIDEO_OVERRIDES,
};
