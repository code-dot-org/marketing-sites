import Box from '@mui/material/Box';

import {CODEAI} from '../codeaiColors';

import ChartFrame from './ChartFrame';
import {formatValue, type ValueFormat} from './format';

export interface PieSlice {
  key: string;
  label: string;
  value: number | null;
  color: string;
}

export interface PieProps {
  title: string;
  slices: PieSlice[];
  valueFormat?: ValueFormat;
  /**
   * Smallest drawn slice in degrees, so a 1% slice stays visible. Larger
   * slices shrink to make room; the legend and table keep the true values.
   */
  minSliceDegrees?: number;
  emptyLabel: string;
  size?: 'default' | 'print';
}

const REMAINDER_COLOR = CODEAI.gray2;

const round = (v: number) => Math.round(v * 100) / 100;

/** SVG paths for slices of a 0–100 total, clockwise from 12 o'clock. */
function arcs(slices: {color: string; value: number}[], r: number) {
  let start = 0;
  return slices
    .filter(s => s.value > 0.05)
    .map(slice => {
      const end = start + (slice.value / 100) * 2 * Math.PI;
      const point = (angle: number) =>
        `${round(r + r * Math.sin(angle))},${round(r - r * Math.cos(angle))}`;
      const d =
        slice.value >= 99.95
          ? `M${r},0A${r},${r} 0 1 1 ${r - 0.01},0Z`
          : `M${r},${r}L${point(start)}A${r},${r} 0 ${end - start > Math.PI ? 1 : 0} 1 ${point(end)}Z`;
      start = end;
      return {d, color: slice.color};
    });
}

/** Applies the minimum drawn slice. Returns the values to draw. */
export function drawnSliceValues(values: number[], minDegrees: number) {
  const minShare = (minDegrees / 360) * 100;
  const small = values.map(v => v > 0 && v < minShare);
  const needed = values.reduce(
    (sum, v, i) => sum + (small[i] ? minShare - v : 0),
    0,
  );
  const largeTotal = values.reduce((sum, v, i) => sum + (small[i] ? 0 : v), 0);
  if (needed === 0 || largeTotal <= needed) {
    return values;
  }
  const scale = (largeTotal - needed) / largeTotal;
  return values.map((v, i) => (small[i] ? minShare : v * scale));
}

/**
 * A pie of percentages with its own legend, drawn as server-rendered SVG.
 * Unaccounted share draws grey.
 */
export default function Pie({
  title,
  slices,
  valueFormat = {digits: 1, suffix: '%'},
  minSliceDegrees = 10,
  emptyLabel,
  size = 'default',
}: PieProps) {
  const isPrint = size === 'print';
  const diameter = isPrint ? 80 : 130;
  const reported = slices.filter(s => s.value != null) as (PieSlice & {
    value: number;
  })[];
  const drawn = drawnSliceValues(
    reported.map(s => s.value),
    minSliceDegrees,
  );
  const remainder = Math.max(0, 100 - drawn.reduce((sum, v) => sum + v, 0));
  const format = (v: number | null) =>
    v == null ? emptyLabel : formatValue(v, valueFormat);

  const legend = (
    <Box
      component="ul"
      aria-hidden
      sx={{
        listStyle: 'none',
        m: 0,
        p: 0,
        display: 'flex',
        flexDirection: 'column',
        gap: 1,
        ...(isPrint ? {fontSize: '0.6875rem'} : {typography: 'body4'}),
      }}
    >
      {slices.map(s => (
        <Box
          component="li"
          key={s.key}
          sx={{display: 'flex', alignItems: 'center', gap: 1}}
        >
          <Box
            sx={{
              width: 16,
              height: 16,
              borderRadius: '4px',
              background: s.color,
              flexShrink: 0,
            }}
          />
          <span>
            <strong>{format(s.value)}</strong> {s.label}
          </span>
        </Box>
      ))}
    </Box>
  );

  return (
    <Box
      sx={{
        typography: 'body2',
        lineHeight: 1.4,
        display: 'flex',
        alignItems: 'center',
        gap: 2.5,
      }}
    >
      <Box sx={{width: diameter, flexShrink: 0}}>
        <ChartFrame
          title={title}
          width={diameter}
          height={diameter}
          interactive={false}
          table={{
            columns: [
              {key: 'label', label: 'Group'},
              {key: 'value', label: 'Share', numeric: true},
            ],
            rows: slices.map(s => ({
              key: s.key,
              cells: {label: s.label, value: format(s.value)},
            })),
            emptyLabel,
          }}
        >
          <svg
            viewBox={`0 0 ${diameter} ${diameter}`}
            width="100%"
            height="100%"
            role="presentation"
          >
            {arcs(
              [
                ...reported.map((s, i) => ({color: s.color, value: drawn[i]})),
                {color: REMAINDER_COLOR, value: remainder},
              ],
              diameter / 2,
            ).map((arc, i) => (
              <path key={i} d={arc.d} fill={arc.color} />
            ))}
          </svg>
        </ChartFrame>
      </Box>
      {legend}
    </Box>
  );
}
