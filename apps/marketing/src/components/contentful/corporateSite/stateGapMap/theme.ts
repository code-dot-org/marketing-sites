import {alpha, Theme} from '@mui/material/styles';

import {StateGapMapTierId} from './types';

type ResolvedMode = 'light' | 'dark';

interface StateVisualState {
  active: boolean;
  locked: boolean;
}

export function getResolvedMode(
  theme: Theme,
  inheritedMode?: string | null,
): ResolvedMode {
  if (inheritedMode === 'dark' || inheritedMode === 'light') {
    return inheritedMode;
  }

  return theme.palette.mode === 'dark' ? 'dark' : 'light';
}

export function getTierColors(
  theme: Theme,
  tier: StateGapMapTierId,
  inheritedMode?: string | null,
  state: StateVisualState = {active: false, locked: false},
) {
  const mode = getResolvedMode(theme, inheritedMode);

  const palette =
    tier === 'leading'
      ? {
          light: '#1d7a5d',
          dark: '#7ce7bf',
        }
      : tier === 'progressing'
        ? {
            light: '#d58a15',
            dark: '#f6c768',
          }
        : {
            light: '#c34a6b',
            dark: '#ff93b0',
          };

  const base = mode === 'dark' ? palette.dark : palette.light;
  const surface =
    mode === 'dark'
      ? alpha(base, state.active || state.locked ? 0.32 : 0.22)
      : alpha(base, state.active || state.locked ? 0.22 : 0.12);

  return {
    fill: surface,
    stroke: state.locked ? theme.palette.text.primary : base,
    label:
      mode === 'dark' ? theme.palette.common.white : theme.palette.text.primary,
    badgeBg: surface,
    badgeText:
      mode === 'dark' ? theme.palette.common.white : theme.palette.text.primary,
  };
}

export function getModeTextColors(theme: Theme, inheritedMode?: string | null) {
  const mode = getResolvedMode(theme, inheritedMode);

  return {
    primary:
      mode === 'dark'
        ? 'rgba(255, 255, 255, 0.96)'
        : theme.palette.text.primary,
    secondary:
      mode === 'dark'
        ? 'rgba(255, 255, 255, 0.72)'
        : theme.palette.text.secondary,
    surface:
      mode === 'dark'
        ? 'rgba(17, 24, 39, 0.82)'
        : theme.palette.background.paper,
    divider:
      mode === 'dark' ? 'rgba(255, 255, 255, 0.14)' : theme.palette.divider,
  };
}
