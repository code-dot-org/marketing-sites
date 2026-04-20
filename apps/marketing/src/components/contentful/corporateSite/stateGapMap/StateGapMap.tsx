'use client';

import {Box, Stack, Typography} from '@mui/material';
import {useTheme} from '@mui/material/styles';
import {useEffect, useRef, useState} from 'react';

import {stateGapMapData} from './data';
import StateGapMapLegend from './StateGapMapLegend';
import StateGapMapPanel from './StateGapMapPanel';
import StateGapMapRenderer from './StateGapMapRenderer';
import {getModeTextColors} from './theme';
import {StateGapMapDataset} from './types';

export interface StateGapMapProps {
  /** Optional dataset override for Storybook, tests, or future CMS wiring. */
  dataset?: StateGapMapDataset;
}

export default function StateGapMap({
  dataset = stateGapMapData,
}: StateGapMapProps) {
  const theme = useTheme();
  const containerRef = useRef<HTMLDivElement>(null);
  const [hoveredCode, setHoveredCode] = useState<string | null>(null);
  const [lockedCode, setLockedCode] = useState<string | null>(null);
  const [inheritedMode, setInheritedMode] = useState<string | null>(null);

  useEffect(() => {
    // This feature inherits presentation from the nearest data-theme wrapper
    // because Storybook and embedded CMS surfaces may not share the same MUI mode.
    const parentTheme = containerRef.current
      ?.closest('[data-theme]')
      ?.getAttribute('data-theme');
    setInheritedMode(parentTheme ?? null);
  }, []);

  const activeCode = lockedCode ?? hoveredCode;
  const mode = lockedCode ? 'locked' : hoveredCode ? 'preview' : 'default';
  const activeState = activeCode
    ? dataset.states.find(state => state.code === activeCode)
    : undefined;
  const textColors = getModeTextColors(theme, inheritedMode);
  const clearSelection = () => {
    setLockedCode(null);
    setHoveredCode(null);
  };

  return (
    <Box
      ref={containerRef}
      component="section"
      aria-label="Interactive state gap analysis map"
      sx={{
        position: 'relative',
        width: '100%',
        minWidth: 0,
        borderRadius: 4,
        p: {xs: 2, md: 3},
        backgroundColor: 'transparent',
      }}
    >
      <Stack spacing={2} sx={{width: '100%', minWidth: 0}}>
        <Stack spacing={1}>
          <Typography variant="overline" sx={{color: textColors.secondary}}>
            State Gap Analysis
          </Typography>
          <Typography variant="h3" sx={{color: textColors.primary}}>
            Access versus participation by state
          </Typography>
          <Typography
            variant="body1"
            sx={{color: textColors.secondary}}
            maxWidth={900}
          >
            Explore state-by-state gaps between school access and student
            participation.
          </Typography>
        </Stack>

        <StateGapMapLegend dataset={dataset} inheritedMode={inheritedMode} />

        <Box sx={{position: 'relative'}}>
          {lockedCode ? (
            <Box
              aria-hidden="true"
              data-testid="state-gap-map-backdrop"
              onClick={clearSelection}
              onMouseDown={clearSelection}
              // The fixed reset surface lets us implement click-away dismissal
              // without raw document listeners.
              sx={{
                position: 'fixed',
                inset: 0,
                zIndex: 0,
              }}
            />
          ) : null}

          <Box
            sx={{
              position: 'relative',
              width: '100%',
              minWidth: 0,
              zIndex: 1,
              display: 'grid',
              gridTemplateColumns: {
                xs: 'minmax(0, 1fr)',
                lg: 'minmax(0, 1fr) 360px',
              },
              gap: 2,
              alignItems: 'start',
            }}
          >
            <Box
              sx={{
                width: '100%',
                minWidth: 0,
                borderRadius: 4,
                border: `1px solid ${textColors.divider}`,
                backgroundColor:
                  inheritedMode === 'dark'
                    ? 'rgba(255, 255, 255, 0.02)'
                    : 'rgba(255, 255, 255, 0.7)',
                p: {xs: 1.5, md: 2},
              }}
            >
              <StateGapMapRenderer
                dataset={dataset}
                inheritedMode={inheritedMode}
                hoveredCode={hoveredCode}
                lockedCode={lockedCode}
                onHover={code => {
                  if (!lockedCode) {
                    setHoveredCode(code);
                  }
                }}
                onSelect={code => {
                  setLockedCode(code);
                  setHoveredCode(code);
                }}
                onClearHover={() => {
                  if (!lockedCode) {
                    setHoveredCode(null);
                  }
                }}
              />
            </Box>

            <Box
              sx={{
                width: '100%',
                minWidth: 0,
                justifySelf: 'stretch',
              }}
            >
              <StateGapMapPanel
                dataset={dataset}
                inheritedMode={inheritedMode}
                mode={mode}
                stateRecord={activeState}
                onClose={lockedCode ? clearSelection : undefined}
              />
            </Box>
          </Box>
        </Box>
      </Stack>
    </Box>
  );
}
