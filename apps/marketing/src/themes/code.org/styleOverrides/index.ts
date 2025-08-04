import {Components, Theme} from '@mui/material/styles';

import {CONTAINER_OVERRIDES} from './container';
import {DIVIDER_OVERRIDES} from './divider';
import {IMAGE_OVERRIDES} from './image';
import {LINK_OVERRIDES} from './link';
import {SVG_ICON_OVERRIDES} from './svgIcon';
import {
  TABLE_OVERRIDES,
  TABLE_ROW_OVERRIDES,
  TABLE_CELL_OVERRIDES,
  TABLE_CONTAINER_OVERRIDES,
} from './table';
import {TYPOGRAPHY_OVERRIDES} from './typography';

export const STYLE_OVERRIDES: Components<Theme> = {
  MuiContainer: CONTAINER_OVERRIDES,
  MuiDivider: DIVIDER_OVERRIDES,
  MuiSvgIcon: SVG_ICON_OVERRIDES,
  MuiImage: IMAGE_OVERRIDES,
  MuiLink: LINK_OVERRIDES,
  MuiTable: TABLE_OVERRIDES,
  MuiTableCell: TABLE_CELL_OVERRIDES,
  MuiTableRow: TABLE_ROW_OVERRIDES,
  MuiTableContainer: TABLE_CONTAINER_OVERRIDES,
  MuiTypography: TYPOGRAPHY_OVERRIDES,
};
