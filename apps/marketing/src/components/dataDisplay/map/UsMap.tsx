import Box from '@mui/material/Box';
import type {CSSProperties} from 'react';

import {CODEAI, shade} from '../codeaiColors';
import DataTable, {type DataTableColumn} from '../table/DataTable';
import {visuallyHidden} from '../visuallyHidden';

import {US_DC_CALLOUT, US_MAP_VIEWBOX, US_STATE_PATHS} from './usStatePaths';

export interface MapRegion {
  /** Postal code, e.g. "CA". */
  code: string;
  name: string;
  /** Accessible link name, e.g. "California, score 63.2, 51 – 80". */
  label: string;
  /** `null` draws the "Not reported" pattern. */
  fill: string | null;
  href: string;
  /** Cells for the table equivalent, by column key. */
  cells: Record<string, string>;
}

export interface MapLegendItem {
  label: string;
  /** `null` is the "Not reported" pattern. */
  fill: string | null;
}

export interface UsMapProps {
  title: string;
  regions: MapRegion[];
  legend: MapLegendItem[];
  tableColumns: DataTableColumn[];
  emptyLabel: string;
}

const NOT_REPORTED_FILL = CODEAI.gray1;
const NOT_REPORTED_STRIPE = CODEAI.gray4;
const PATTERN_ID = 'us-map-not-reported';
const NOT_REPORTED_HOVER = CODEAI.gray3;

/** Hover shading for a region, read by the map's hover styles. */
const hoverStyle = (fill: string | null) =>
  ({
    '--region-hover': fill ? shade(fill) : NOT_REPORTED_HOVER,
  }) as CSSProperties;

const notReportedSwatch = `repeating-linear-gradient(45deg, ${NOT_REPORTED_FILL} 0, ${NOT_REPORTED_FILL} 3px, ${NOT_REPORTED_STRIPE} 3px, ${NOT_REPORTED_STRIPE} 4px)`;

/**
 * A server-rendered US map: one SVG link per state and DC (with a callout
 * for DC), band fills from props, a legend and a table equivalent. Wrap it
 * in UsMapInteractive for hover, focus and tooltip behaviour.
 */
export default function UsMap({
  title,
  regions,
  legend,
  tableColumns,
  emptyLabel,
}: UsMapProps) {
  const byCode = new Map(regions.map(r => [r.code, r]));
  const dc = byCode.get('DC');

  return (
    <Box component="figure" sx={{m: 0, typography: 'body2', lineHeight: 1.4}}>
      <Box
        component="svg"
        viewBox={US_MAP_VIEWBOX}
        role="group"
        aria-label={title}
        sx={mapStyles}
      >
        <defs>
          <pattern
            id={PATTERN_ID}
            width="6"
            height="6"
            patternUnits="userSpaceOnUse"
            patternTransform="rotate(45)"
          >
            <rect width="6" height="6" fill={NOT_REPORTED_FILL} />
            <rect width="1.5" height="6" fill={NOT_REPORTED_STRIPE} />
          </pattern>
        </defs>
        {Object.entries(US_STATE_PATHS).map(([code, d]) => {
          const region = byCode.get(code);
          if (!region) {
            return (
              <path key={code} d={d} fill={NOT_REPORTED_FILL} stroke="#fff" />
            );
          }
          // DC's shape is too small to use; its callout is the focusable link.
          const isDcShape = code === 'DC';
          return (
            <a
              key={code}
              href={region.href}
              aria-label={isDcShape ? undefined : region.label}
              aria-hidden={isDcShape || undefined}
              tabIndex={isDcShape ? -1 : undefined}
              data-code={code}
            >
              <path
                d={d}
                fill={region.fill ?? `url(#${PATTERN_ID})`}
                className="region"
                style={hoverStyle(region.fill)}
              />
            </a>
          );
        })}
        {dc && (
          <a href={dc.href} aria-label={dc.label} data-code="DC">
            <line
              x1={US_DC_CALLOUT.anchor[0]}
              y1={US_DC_CALLOUT.anchor[1]}
              x2={US_DC_CALLOUT.cx}
              y2={US_DC_CALLOUT.cy}
              stroke={CODEAI.gray6}
              strokeWidth={1}
            />
            <circle
              cx={US_DC_CALLOUT.cx}
              cy={US_DC_CALLOUT.cy}
              r={US_DC_CALLOUT.r}
              fill={dc.fill ?? `url(#${PATTERN_ID})`}
              className="region"
              style={hoverStyle(dc.fill)}
            />
            <text
              x={US_DC_CALLOUT.cx + US_DC_CALLOUT.r + 4}
              y={US_DC_CALLOUT.cy + 4}
              fontSize={11}
              fontWeight={700}
              fill={CODEAI.gray8}
            >
              DC
            </text>
          </a>
        )}
      </Box>
      <Box
        component="ul"
        aria-label="Legend"
        sx={{
          listStyle: 'none',
          m: 0,
          mt: 1.5,
          p: 0,
          display: 'flex',
          flexWrap: 'wrap',
          gap: 2,
          typography: 'body4',
        }}
      >
        {legend.map(item => (
          <Box
            component="li"
            key={item.label}
            sx={{display: 'flex', alignItems: 'center', gap: 0.75}}
          >
            <Box
              aria-hidden
              sx={{
                width: 14,
                height: 14,
                borderRadius: '3px',
                border: `1px solid ${CODEAI.gray4}`,
                background: item.fill ?? notReportedSwatch,
              }}
            />
            {item.label}
          </Box>
        ))}
      </Box>
      <Box component="figcaption" sx={visuallyHidden}>
        {title}
      </Box>
      <DataTable
        caption={title}
        columns={tableColumns}
        rows={regions.map(r => ({key: r.code, cells: r.cells}))}
        emptyLabel={emptyLabel}
        hidden
      />
    </Box>
  );
}

const mapStyles = {
  display: 'block',
  width: '100%',
  height: 'auto',
  '& .region': {
    stroke: '#fff',
    strokeWidth: 1,
    transformBox: 'fill-box',
    transformOrigin: 'center',
    transition: 'fill 150ms ease',
  },
  // Hover shades the state; an outline is drawn under its neighbours'
  // edges, so it's kept for keyboard focus only.
  '& a:hover .region': {fill: 'var(--region-hover)'},
  '& a:focus': {outline: 'none'},
  '& a:focus-visible .region': {
    fill: 'var(--region-hover)',
    stroke: CODEAI.purpleDark,
    strokeWidth: 3.5,
  },
  '@media (prefers-reduced-motion: reduce)': {
    '& .region': {transition: 'none'},
  },
} as const;
