import {USAMap} from '@mirawision/usa-map-react';
import {Box} from '@mui/material';
import {useTheme} from '@mui/material/styles';
import type {ComponentProps} from 'react';
import {useMemo} from 'react';

import {getTierColors, getUnavailableColors} from './theme';
import {StateGapMapDataset} from './types';
import {isRecordComplete} from './utils';

interface StateGapMapRendererProps {
  dataset: StateGapMapDataset;
  inheritedMode?: string | null;
  hoveredCode: string | null;
  lockedCode: string | null;
  onHover: (code: string) => void;
  onSelect: (code: string) => void;
  onClearHover: () => void;
}

export default function StateGapMapRenderer({
  dataset,
  inheritedMode,
  hoveredCode,
  lockedCode,
  onHover,
  onSelect,
  onClearHover,
}: StateGapMapRendererProps) {
  const theme = useTheme();

  const customStates = useMemo<
    ComponentProps<typeof USAMap>['customStates']
  >(() => {
    const states: NonNullable<ComponentProps<typeof USAMap>['customStates']> =
      {};

    for (const state of dataset.states) {
      const isLocked = lockedCode === state.code;
      const isActive = isLocked || hoveredCode === state.code;
      const isComplete = isRecordComplete(state);
      const colors = isComplete
        ? getTierColors(theme, state.tier, inheritedMode, {
            active: isActive,
            locked: isLocked,
          })
        : getUnavailableColors(theme, inheritedMode, {
            active: isActive,
            locked: isLocked,
          });

      states[state.code] = {
        fill: colors.fill,
        stroke: colors.stroke,
        label: {enabled: false},
        tooltip: {enabled: false},
        onClick: () => onSelect(state.code),
        onHover: () => onHover(state.code),
        onFocus: () => onHover(state.code),
        onLeave: onClearHover,
        onBlur: onClearHover,
      };
    }

    return states;
  }, [
    dataset.states,
    hoveredCode,
    inheritedMode,
    lockedCode,
    onClearHover,
    onHover,
    onSelect,
    theme,
  ]);

  return (
    <Box
      role="group"
      aria-label="United States state gap analysis map"
      onMouseLeave={onClearHover}
      sx={{
        width: '100%',
        minWidth: 0,
        '& .usa-map': {
          display: 'block',
          width: '100%',
          height: 'auto',
        },
        '& .usa-map path, & .usa-map circle': {
          vectorEffect: 'non-scaling-stroke',
        },
        '& .usa-map [role="button"]:focus-visible': {
          outline: `3px solid ${theme.palette.primary.main}`,
          outlineOffset: 2,
        },
      }}
    >
      <USAMap
        className="state-gap-map"
        mapSettings={{
          width: '100%',
          height: 'auto',
          title: 'United States state gap analysis map',
        }}
        defaultState={{
          label: {enabled: false},
          tooltip: {enabled: false},
        }}
        customStates={customStates}
      />
    </Box>
  );
}
