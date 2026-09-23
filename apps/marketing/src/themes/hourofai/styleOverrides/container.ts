import {Components, Theme} from '@mui/material/styles';

import {
  HOUR_OF_AI_COLOR_ALIASES,
  HOUR_OF_AI_COLORS,
  hourOfAiColor,
} from '../colors/palette';

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
    root: sectionBackgroundRules,
  },
};
