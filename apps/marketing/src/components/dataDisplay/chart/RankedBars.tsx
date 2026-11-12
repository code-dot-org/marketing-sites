'use client';

import {BarChart} from '@mui/x-charts/BarChart';
import {ChartsReferenceLine} from '@mui/x-charts/ChartsReferenceLine';

import {CODEAI} from '../codeaiColors';

import ChartFrame from './ChartFrame';
import {formatValue, type ValueFormat} from './format';
import {NoTooltip} from './NoTooltip';

export interface RankedBarItem {
  key: string;
  label: string;
  value: number | null;
  color: string;
}

export interface RankedBarsProps {
  title: string;
  /** Already in display order. */
  items: RankedBarItem[];
  highlightKey?: string;
  /** Dashed marker, e.g. the national average. */
  reference?: {value: number | null; label: string};
  labelHeading: string;
  valueHeading: string;
  valueFormat?: ValueFormat;
  emptyLabel: string;
  interactive?: boolean;
  size?: 'default' | 'print';
  /** Bar row height in design pixels. */
  rowHeight?: number;
  /** Design width; the chart scales to its container at this ratio. */
  width?: number;
}

const MARGIN = {top: 8, bottom: 8, left: 4, right: 56};
const DIMMED_ALPHA = 'BF'; // 75%, as in the prototype
// Room past the longest bar for its value label, which the plot would clip.
const HEADROOM = 1.15;

/** Horizontal bars in rank order, with an optional highlighted row and reference marker. */
export default function RankedBars({
  title,
  items,
  highlightKey,
  reference,
  labelHeading,
  valueHeading,
  valueFormat,
  emptyLabel,
  interactive = true,
  size = 'default',
  rowHeight,
  width = 640,
}: RankedBarsProps) {
  const isPrint = size === 'print';
  const row = rowHeight ?? (isPrint ? 9 : 14);
  const height = items.length * row + MARGIN.top + MARGIN.bottom;
  const maxValue = Math.max(1, ...items.map(i => i.value ?? 0));
  const labels = new Map(items.map(i => [i.key, i.label]));
  const format = (v: number | null) =>
    v == null ? emptyLabel : formatValue(v, valueFormat);

  return (
    <ChartFrame
      title={title}
      width={width}
      height={height}
      interactive={interactive}
      table={{
        columns: [
          {key: 'label', label: labelHeading},
          {key: 'value', label: valueHeading, numeric: true},
        ],
        rows: items.map(i => ({
          key: i.key,
          cells: {label: i.label, value: format(i.value)},
        })),
        highlightKey,
        emptyLabel,
      }}
    >
      <BarChart
        width={width}
        height={height}
        layout="horizontal"
        margin={MARGIN}
        hideLegend
        skipAnimation={isPrint || undefined}
        enableKeyboardNavigation={interactive}
        disableAxisListener={!interactive}
        slots={interactive ? undefined : {tooltip: NoTooltip}}
        yAxis={[
          {
            scaleType: 'band',
            data: items.map(i => i.key),
            valueFormatter: (key: string) => labels.get(key) ?? key,
            width: 34,
            categoryGapRatio: 0.25,
            tickLabelStyle: {fontSize: isPrint ? 8 : 10, fontWeight: 700},
            disableTicks: true,
            colorMap: {
              type: 'ordinal',
              values: items.map(i => i.key),
              colors: items.map(i =>
                !highlightKey || i.key === highlightKey
                  ? i.color
                  : `${i.color}${DIMMED_ALPHA}`,
              ),
            },
          },
        ]}
        xAxis={[{min: 0, max: maxValue * HEADROOM, position: 'none'}]}
        series={[
          {
            data: items.map(i => i.value),
            valueFormatter: v => format(v),
            barLabel: item =>
              item.value == null ? null : formatValue(item.value, valueFormat),
            barLabelPlacement: 'outside',
          },
        ]}
        sx={{
          '& .MuiBarLabel-root': {fontSize: isPrint ? 7 : 9, fontWeight: 700},
          // A soft glow in the bar's own colour (its `color` attribute).
          ...(interactive && {
            '& .MuiBarElement-root': {transition: 'filter 200ms ease-out'},
            '& .MuiBarElement-root:hover': {
              filter: 'drop-shadow(0 0 3px currentColor)',
            },
          }),
        }}
      >
        {reference?.value != null && (
          <ChartsReferenceLine
            x={reference.value}
            lineStyle={{
              stroke: CODEAI.gray8,
              strokeDasharray: '4 3',
              strokeWidth: 2,
            }}
          />
        )}
      </BarChart>
    </ChartFrame>
  );
}
