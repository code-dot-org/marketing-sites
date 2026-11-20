'use client';

import Box from '@mui/material/Box';
import {BarPlot} from '@mui/x-charts/BarChart';
import {ChartDataProvider} from '@mui/x-charts/ChartDataProvider';
import {ChartsSurface} from '@mui/x-charts/ChartsSurface';
import {ChartsTooltip} from '@mui/x-charts/ChartsTooltip';
import {ChartsXAxis} from '@mui/x-charts/ChartsXAxis';
import {useXScale, useYScale} from '@mui/x-charts/hooks';
import {LinePlot, MarkPlot} from '@mui/x-charts/LineChart';
import {useId} from 'react';

import {CODEAI, shade} from '../codeaiColors';

import ChartFrame from './ChartFrame';
import {formatValue, type ValueFormat} from './format';

export interface YearBarPoint {
  key: string;
  label: string;
  value: number | null;
  /** Benchmark for the same year, drawn as a dashed tick. */
  reference?: number | null;
}

export interface YearBarsProps {
  title: string;
  points: YearBarPoint[];
  color: string;
  seriesLabel: string;
  referenceLabel?: string;
  valueFormat?: ValueFormat;
  /** Axis maximum; defaults to 100 for percentages. */
  max?: number;
  emptyLabel: string;
  interactive?: boolean;
  /** Off when the tooltip would only repeat the bar label. Interactive
   *  bars fill with a deeper shade on hover either way. */
  tooltip?: boolean;
  size?: 'default' | 'print';
}

const WIDTH = 480;
// No top margin beyond a hair: the y-axis headroom holds the bar labels.
const MARGIN = {top: 6, bottom: 4, left: 4, right: 4};
const GAP_HEIGHT_RATIO = 0.08;

/** Hover overlays: a deeper shade rises from the base of each bar. */
function BarGlow({values, fill}: {values: (number | null)[]; fill: string}) {
  const x = useXScale<'band'>('years');
  const y = useYScale('values');
  const width = x.bandwidth();
  const base = y(0) ?? 0;
  return (
    <g>
      {x.domain().map((label, i) => {
        const value = values[i];
        if (value == null) {
          return null;
        }
        const top = y(value) ?? base;
        const geometry = {x: x(label), y: top, width, height: base - top};
        return (
          <g key={String(label)} className="year-bar-glow">
            <rect {...geometry} fill="transparent" />
            <rect {...geometry} className="year-bar-glow-fill" fill={fill} />
          </g>
        );
      })}
    </g>
  );
}

/**
 * Each benchmark marker's value. Inside a bar (benchmark below the bar's
 * value) it sits under the marker in white; otherwise above the marker. Either
 * way it stays clear of the bar's own value label, which sits on the bar top.
 */
function ReferenceLabels({
  references,
  bars,
  format,
  fontSize,
}: {
  references: (number | null)[];
  bars: (number | null)[];
  format: (v: number) => string;
  fontSize: number;
}) {
  const x = useXScale<'band'>('years');
  const y = useYScale('values');
  const half = x.bandwidth() / 2;
  return (
    <g aria-hidden className="year-bars-reference-labels">
      {x.domain().map((label, i) => {
        const value = references[i];
        const left = x(label);
        const top = value == null ? undefined : y(value);
        if (value == null || left == null || top == null) {
          return null;
        }
        const bar = bars[i];
        const inside = bar != null && value < bar;
        return (
          <text
            key={String(label)}
            x={left + half}
            y={inside ? top + fontSize + 5 : top - 7}
            textAnchor="middle"
            fontSize={fontSize}
            fontWeight={700}
            fill={inside ? '#fff' : CODEAI.gray8}
            {...(!inside && {
              stroke: '#fff',
              strokeWidth: 3,
              paintOrder: 'stroke',
            })}
          >
            {format(value)}
          </text>
        );
      })}
    </g>
  );
}

/**
 * Vertical bars by year. Missing years draw a short plain gray "N/A" bar; an
 * optional benchmark per year draws as a dashed line with labelled markers.
 */
export default function YearBars({
  title,
  points,
  color,
  seriesLabel,
  referenceLabel,
  valueFormat = {digits: 0, suffix: '%'},
  max = 100,
  emptyLabel,
  interactive = true,
  tooltip = true,
  size = 'default',
}: YearBarsProps) {
  const isPrint = size === 'print';
  const showTooltip = interactive && tooltip;
  const glow = interactive && !isPrint;
  const glowId = `glow-${useId().replace(/:/g, '')}`;
  const height = isPrint ? 120 : 220;
  const hasReference = points.some(p => p.reference != null);
  const format = (v: number | null) =>
    v == null ? emptyLabel : formatValue(v, valueFormat);

  const legend = hasReference && referenceLabel && (
    <Box
      aria-hidden
      sx={{
        display: 'flex',
        justifyContent: 'center',
        gap: 2,
        mt: 1,
        ...(isPrint ? {fontSize: '0.6875rem'} : {typography: 'body4'}),
        color: CODEAI.gray6,
      }}
    >
      <Box
        component="span"
        sx={{display: 'flex', alignItems: 'center', gap: 0.75}}
      >
        <Box
          sx={{width: 12, height: 10, background: color, borderRadius: '2px'}}
        />
        {seriesLabel}
      </Box>
      <Box
        component="span"
        sx={{display: 'flex', alignItems: 'center', gap: 0.75}}
      >
        <Box sx={{width: 16, borderTop: `2px dashed ${CODEAI.gray8}`}} />
        {referenceLabel}
      </Box>
    </Box>
  );

  return (
    <ChartFrame
      title={title}
      width={WIDTH}
      height={height}
      interactive={showTooltip}
      legend={legend}
      table={{
        columns: [
          {key: 'label', label: 'Year'},
          {key: 'value', label: seriesLabel, numeric: true},
          ...(hasReference && referenceLabel
            ? [{key: 'reference', label: referenceLabel, numeric: true}]
            : []),
        ],
        rows: points.map(p => ({
          key: p.key,
          cells: {
            label: p.label,
            value: format(p.value),
            reference: format(p.reference ?? null),
          },
        })),
        emptyLabel,
      }}
    >
      <ChartDataProvider
        width={WIDTH}
        height={height}
        margin={MARGIN}
        skipAnimation={isPrint || undefined}
        enableKeyboardNavigation={showTooltip}
        disableAxisListener={!showTooltip}
        xAxis={[
          {
            id: 'years',
            scaleType: 'band',
            data: points.map(p => p.label),
            categoryGapRatio: 0.2,
            tickLabelStyle: {fontSize: isPrint ? 8 : 11},
            disableTicks: true,
            height: 24,
          },
        ]}
        // Headroom so a full-height bar's label isn't clipped.
        yAxis={[{id: 'values', min: 0, max: max * 1.12, position: 'none'}]}
        series={[
          {
            type: 'bar',
            id: 'value',
            label: seriesLabel,
            data: points.map(p => p.value),
            color,
            stack: 'year',
            valueFormatter: v => format(v),
            barLabel: item =>
              item.value == null ? null : formatValue(item.value, valueFormat),
            barLabelPlacement: 'outside',
          },
          {
            type: 'bar',
            id: 'missing',
            label: emptyLabel,
            data: points.map(p =>
              p.value == null ? max * GAP_HEIGHT_RATIO : null,
            ),
            // Plain gray, never a pattern (Policy team review).
            color: CODEAI.gray3,
            stack: 'year',
            // Listed in the tooltip only for the years it marks.
            valueFormatter: v => (v == null ? null : emptyLabel),
            barLabel: item => (item.value == null ? null : 'N/A'),
            barLabelPlacement: 'outside',
          },
          ...(hasReference
            ? [
                {
                  type: 'line' as const,
                  id: 'reference',
                  label: referenceLabel,
                  data: points.map(p => p.reference ?? null),
                  color: CODEAI.gray8,
                  valueFormatter: (v: number | null) => format(v),
                },
              ]
            : []),
        ]}
      >
        <ChartsSurface
          sx={{
            '& .MuiBarLabel-root': {
              fontSize: isPrint ? 8 : 10,
              fontWeight: 700,
            },
            '& .MuiLineElement-root': {strokeDasharray: '5 4', strokeWidth: 2},
            '& .year-bar-glow': {cursor: 'default'},
            '& .year-bar-glow-fill': {
              pointerEvents: 'none',
              transformBox: 'fill-box',
              transformOrigin: 'bottom',
              transform: 'scaleY(0)',
              opacity: 0,
              transition:
                'transform 450ms cubic-bezier(0.2, 0.8, 0.2, 1), opacity 200ms ease-out',
            },
            '& .year-bar-glow:hover .year-bar-glow-fill': {
              transform: 'scaleY(1)',
              opacity: 1,
              filter: `drop-shadow(0 0 6px ${color}80)`,
            },
            '@media (prefers-reduced-motion: reduce)': {
              '& .year-bar-glow-fill': {transition: 'opacity 150ms linear'},
            },
          }}
        >
          <defs>
            {glow && (
              // Deepest at the base, fading to a soft sheen at the top.
              <linearGradient id={glowId} x1="0" y1="1" x2="0" y2="0">
                <stop offset="0" stopColor={shade(color, 0.3)} />
                <stop
                  offset="1"
                  stopColor={shade(color, 0.3)}
                  stopOpacity={0.35}
                />
              </linearGradient>
            )}
          </defs>
          <BarPlot />
          {glow && (
            <BarGlow
              values={points.map(p => p.value)}
              fill={`url(#${glowId})`}
            />
          )}
          <LinePlot />
          <MarkPlot />
          {hasReference && (
            <ReferenceLabels
              references={points.map(p => p.reference ?? null)}
              bars={points.map(p => p.value)}
              format={v => formatValue(v, valueFormat)}
              fontSize={isPrint ? 8 : 10}
            />
          )}
          <ChartsXAxis />
        </ChartsSurface>
        {showTooltip && <ChartsTooltip />}
      </ChartDataProvider>
    </ChartFrame>
  );
}
