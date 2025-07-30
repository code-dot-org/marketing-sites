import {Components, Theme} from '@mui/material/styles';

import {BUTTON_OVERRIDES} from './button';
import {CONTAINER_OVERRIDES} from './container';
import {DIVIDER_OVERRIDES} from './divider';
import {FOOTER_OVERRIDES} from './footer';
import {IMAGE_OVERRIDES} from './image';
import {LINK_OVERRIDES} from './link';
import {
  TABLE_OVERRIDES,
  TABLE_CELL_OVERRIDES,
  TABLE_ROW_OVERRIDES,
  TABLE_CONTAINER_OVERRIDES,
} from './table';
import {TYPOGRAPHY_OVERRIDES} from './typography';

export const STYLE_OVERRIDES: Components<Theme> = {
  MuiButton: BUTTON_OVERRIDES,
  MuiContainer: CONTAINER_OVERRIDES,
  MuiDivider: DIVIDER_OVERRIDES,
  MuiFooter: FOOTER_OVERRIDES,
  MuiImage: IMAGE_OVERRIDES,
  MuiLink: LINK_OVERRIDES,
  MuiTypography: TYPOGRAPHY_OVERRIDES,
  MuiTable: TABLE_OVERRIDES,
  MuiTableCell: TABLE_CELL_OVERRIDES,
  MuiTableRow: TABLE_ROW_OVERRIDES,
  MuiTableContainer: TABLE_CONTAINER_OVERRIDES,
};
