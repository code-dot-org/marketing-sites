import {Components, Theme} from '@mui/material/styles';

import {
  HOUR_OF_AI_COLOR_ALIASES,
  HOUR_OF_AI_COLORS,
  hourOfAiColor,
} from '../colors/palette';
import {
  SECTION_MAX_WIDTH,
  SECTION_PADDING_INLINE,
  SECTION_PADDING_INLINE_MOBILE,
} from '../constants/layout';

// Section backgrounds (`section-background-*` on the Section root). Aliased
// values get a rule too, so off-palette stored backgrounds render closest.
// Legacy `primary` is Section's white default, not the Black text alias.
const sectionBackgroundRules = Object.fromEntries([
  ...[
    ...HOUR_OF_AI_COLORS.map(c => c.value),
    ...Object.keys(HOUR_OF_AI_COLOR_ALIASES).filter(v => v !== 'primary'),
  ].map(value => [
    `.section-background-${value}:has(&.MuiContainer-root)`,
    {background: hourOfAiColor(value)!.cssVar},
  ]),
  [
    '.section-background-primary:has(&.MuiContainer-root)',
    {background: hourOfAiColor('white')!.cssVar},
  ],
]);

export const CONTAINER_OVERRIDES: Components<Theme>['MuiContainer'] = {
  styleOverrides: {
    root: ({theme}) => ({
      '&.MuiContainer-root': {
        maxWidth: SECTION_MAX_WIDTH,
        // Longhands, not paddingInline, so they beat MUI's Container gutters.
        paddingLeft: SECTION_PADDING_INLINE,
        paddingRight: SECTION_PADDING_INLINE,
        zIndex: 2,
        [theme.breakpoints.down('sm')]: {
          paddingLeft: SECTION_PADDING_INLINE_MOBILE,
          paddingRight: SECTION_PADDING_INLINE_MOBILE,
        },
      },
      // "Disable content padding": the gutter moves to the outer section.
      '&.MuiContainer-root.container--full-width': {
        paddingLeft: 0,
        paddingRight: 0,
      },
      '.section-root:has(&.MuiContainer-root.container--full-width)': {
        paddingInline: SECTION_PADDING_INLINE,
        [theme.breakpoints.down('sm')]: {
          paddingInline: SECTION_PADDING_INLINE_MOBILE,
        },
      },
      '&.MuiContainer-root.container--spacing-l': {
        paddingTop: theme.spacing(8),
        paddingBottom: theme.spacing(8),
      },
      '&.MuiContainer-root.container--spacing-m': {
        paddingTop: theme.spacing(5),
        paddingBottom: theme.spacing(5),
      },
      '&.MuiContainer-root.container--spacing-none': {
        paddingTop: 0,
        paddingBottom: 0,
      },
      '&.MuiContainer-root.container--divider-primary': {
        borderBottom: '1px solid var(--codeai-gray-3)',
      },
      '&.MuiContainer-root.container--divider-strong': {
        borderBottom: '1px solid var(--codeai-gray-5)',
      },
      ...sectionBackgroundRules,
    }),
  },
};
