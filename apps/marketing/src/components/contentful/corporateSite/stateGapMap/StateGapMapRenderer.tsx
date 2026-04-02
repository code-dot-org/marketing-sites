import {USAMap} from '@mirawision/usa-map-react';
import {Box} from '@mui/material';
import {useTheme} from '@mui/material/styles';
import type {ComponentProps} from 'react';
import {useEffect, useMemo, useRef} from 'react';

import {STATE_GAP_MAP_GEOMETRY_BY_CODE} from './geometry';
import {getTierColors} from './theme';
import {StateGapMapDataset} from './types';
import {getStateAriaLabel, isRecordComplete} from './utils';

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
  const containerRef = useRef<HTMLDivElement>(null);

  const customStates = useMemo<
    ComponentProps<typeof USAMap>['customStates']
  >(() => {
    const states: NonNullable<ComponentProps<typeof USAMap>['customStates']> =
      {};

    for (const state of dataset.states) {
      const isLocked = lockedCode === state.code;
      const isActive = isLocked || hoveredCode === state.code;
      const isComplete = isRecordComplete(state);
      const colors = getTierColors(theme, state.tier, inheritedMode, {
        active: isActive,
        locked: isLocked,
      });

      states[state.code] = {
        fill: isComplete
          ? colors.fill
          : theme.palette.mode === 'dark'
            ? 'rgba(255, 255, 255, 0.08)'
            : 'rgba(15, 23, 42, 0.08)',
        stroke: isComplete ? colors.stroke : theme.palette.divider,
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

  useEffect(() => {
    const root = containerRef.current;

    if (!root) {
      return;
    }

    const svg = root.querySelector<SVGSVGElement>('svg.usa-map');

    if (svg) {
      svg.setAttribute('role', 'img');
      svg.setAttribute('aria-label', 'United States state gap analysis map');
    }

    const interactiveStates = root.querySelectorAll<SVGElement>('[data-name]');

    for (const element of interactiveStates) {
      const code = element.getAttribute('data-name');

      if (!code) {
        continue;
      }

      const state = dataset.states.find(entry => entry.code === code);
      const geometry = STATE_GAP_MAP_GEOMETRY_BY_CODE.get(code);

      if (!state || !geometry) {
        continue;
      }

      if (code === 'DC' && element.tagName.toLowerCase() !== 'circle') {
        element.setAttribute('aria-hidden', 'true');
        element.removeAttribute('role');
        element.removeAttribute('tabindex');
        element.removeAttribute('aria-label');
        element.removeAttribute('aria-pressed');
        element.removeAttribute('data-display-region');
        continue;
      }

      element.setAttribute('role', 'button');
      element.setAttribute('tabindex', '0');
      element.setAttribute('aria-label', getStateAriaLabel(dataset, state));
      element.setAttribute('aria-pressed', String(lockedCode === code));
      element.setAttribute('data-display-region', geometry.displayRegion);
    }
  }, [dataset, lockedCode]);

  return (
    <Box
      ref={containerRef}
      onMouseLeave={onClearHover}
      onKeyDownCapture={event => {
        const target = event.target as HTMLElement | null;
        const stateCode = target?.getAttribute('data-name');

        if (!stateCode) {
          return;
        }

        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          onSelect(stateCode);
        }
      }}
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
