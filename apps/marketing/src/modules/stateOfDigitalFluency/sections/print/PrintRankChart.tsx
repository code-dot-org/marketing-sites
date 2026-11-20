import Box from '@mui/material/Box';

import {CODEAI} from '@/components/dataDisplay/codeaiColors';
import {visuallyHidden} from '@/components/dataDisplay/visuallyHidden';

import {NOT_REPORTED, TIER_COLORS} from '../../constants';
import {type RankRow, tierColor} from '../../readReport';

import {INK, MUTED} from './PrintLayout';

/** The prototype's national-average marker on the ranking pages. */
export const NATIONAL_LINE_COLOR = '#E24B4A';

const rowLabel = (row: RankRow) =>
  row.rank == null ? row.postal : `${row.rank}. ${row.postal}`;

/** Bars scale to the largest value, as in the prototype. */
const maxOf = (rows: RankRow[]) => Math.max(0, ...rows.map(r => r.value ?? 0));

/** The ranking pages' key: tier colours and the national-average line. */
export function RankChartKey() {
  const item = {display: 'flex', alignItems: 'center', gap: '4px'};
  return (
    <Box
      component="ul"
      aria-label="Chart key"
      sx={{
        listStyle: 'none',
        p: 0,
        m: 0,
        display: 'flex',
        flexWrap: 'wrap',
        gap: '14px',
        alignItems: 'center',
        fontSize: '10px',
      }}
    >
      <Box
        component="li"
        sx={{
          fontWeight: 700,
          color: MUTED,
          textTransform: 'uppercase',
          letterSpacing: '.04em',
        }}
      >
        Tier:
      </Box>
      {(Object.keys(TIER_COLORS) as (keyof typeof TIER_COLORS)[]).map(tier => (
        <Box component="li" key={tier} sx={item}>
          <Box
            aria-hidden
            sx={{
              width: 10,
              height: 10,
              borderRadius: '1px',
              background: TIER_COLORS[tier],
            }}
          />
          {tier}
        </Box>
      ))}
      <Box component="li" sx={item}>
        <Box
          aria-hidden
          sx={{width: 14, borderTop: `1.5px dashed ${NATIONAL_LINE_COLOR}`}}
        />
        National avg
      </Box>
    </Box>
  );
}

/**
 * The full-page ranking: every state on one row, bar coloured by score tier,
 * this state enlarged and ringed, a dashed national-average line.
 */
export function RankChart({
  label,
  rows,
  postal,
  national,
  format,
  rowHeight = 14,
}: {
  label: string;
  rows: RankRow[];
  postal: string;
  national: number | null;
  format: (v: number) => string;
  rowHeight?: number;
}) {
  const max = maxOf(rows);
  const nationalPct =
    national != null && max > 0 ? (national / max) * 100 : null;

  return (
    <Box>
      <Box
        component="ol"
        aria-label={label}
        sx={{
          listStyle: 'none',
          p: 0,
          m: 0,
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {rows.map(row => {
          const featured = row.postal === postal;
          const color = tierColor(row.tierLabel);
          const pct =
            row.value == null || max <= 0 ? 0 : (row.value / max) * 100;
          const barHeight = featured
            ? rowHeight - 4
            : Math.round(rowHeight * 0.55);
          return (
            <Box
              component="li"
              key={row.postal}
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                height: featured ? rowHeight + 6 : rowHeight,
              }}
            >
              <Box
                component="span"
                sx={{
                  width: 44,
                  flexShrink: 0,
                  textAlign: 'right',
                  lineHeight: 1,
                  fontSize: featured ? '11px' : '9px',
                  fontWeight: featured ? 800 : 700,
                  color: featured ? INK : MUTED,
                }}
              >
                {rowLabel(row)}
              </Box>
              <Box
                aria-hidden
                sx={{
                  flex: 1,
                  position: 'relative',
                  height: barHeight,
                  background: '#F2F2F2',
                  borderRadius: featured ? '3px' : '2px',
                }}
              >
                {nationalPct != null && (
                  <Box
                    sx={{
                      position: 'absolute',
                      left: `${nationalPct}%`,
                      top: -2,
                      bottom: -2,
                      borderLeft: `1.5px dashed ${NATIONAL_LINE_COLOR}`,
                      zIndex: 1,
                    }}
                  />
                )}
                <Box
                  sx={{
                    height: '100%',
                    width: `${pct}%`,
                    background: color,
                    borderRadius: 'inherit',
                    opacity: featured ? 1 : 0.75,
                    ...(featured && {
                      boxShadow: `0 0 0 2px #fff, 0 0 0 3px ${color}`,
                    }),
                  }}
                />
              </Box>
              <Box
                component="span"
                sx={{
                  width: 64,
                  flexShrink: 0,
                  lineHeight: 1,
                  fontSize: featured ? '11px' : '9px',
                  fontWeight: featured ? 800 : 700,
                  color: featured ? INK : row.value == null ? MUTED : '#555',
                  fontStyle: row.value == null ? 'italic' : undefined,
                }}
              >
                {row.value == null ? NOT_REPORTED : format(row.value)}
              </Box>
            </Box>
          );
        })}
      </Box>
      {national != null && (
        <Box sx={visuallyHidden}>National average: {format(national)}</Box>
      )}
    </Box>
  );
}

/** The rankings page's bar fills, as in the prototype. */
export const COMPACT_BAR_FILLS = {
  score: `linear-gradient(90deg, ${CODEAI.orangePrimary} 0%, ${CODEAI.bluePrimary} 50%, ${CODEAI.purplePrimary} 100%)`,
  access: '#2D3E6B',
  participation: '#5A8AD4',
} as const;

/** A compact ranking column for the national rankings page. */
export function CompactRankList({
  label,
  rows,
  postal,
  fill,
  format,
  rowHeight,
}: {
  label: string;
  rows: RankRow[];
  postal: string;
  fill: string;
  format: (v: number) => string;
  rowHeight: number;
}) {
  const max = maxOf(rows);
  return (
    <Box
      component="ol"
      aria-label={label}
      sx={{listStyle: 'none', p: 0, m: 0, fontSize: '9px'}}
    >
      {rows.map(row => {
        const featured = row.postal === postal;
        const pct = row.value == null || max <= 0 ? 0 : (row.value / max) * 100;
        return (
          <Box
            component="li"
            key={row.postal}
            sx={{
              display: 'grid',
              gridTemplateColumns: '38px 1fr 50px',
              alignItems: 'center',
              gap: '6px',
              height: rowHeight,
              lineHeight: 1,
              ...(featured && {
                background: CODEAI.purpleLight,
                borderRadius: '4px',
                fontWeight: 800,
                pl: '4px',
              }),
            }}
          >
            <span>{rowLabel(row)}</span>
            <Box
              aria-hidden
              sx={{
                height: Math.round(rowHeight * 0.6),
                background: '#F0F0F0',
                borderRadius: '2px',
                overflow: 'hidden',
              }}
            >
              <Box sx={{height: '100%', width: `${pct}%`, background: fill}} />
            </Box>
            <Box
              component="span"
              sx={{
                textAlign: 'right',
                fontWeight: 700,
                whiteSpace: 'nowrap',
                ...(row.value == null && {
                  fontStyle: 'italic',
                  fontWeight: 400,
                  color: MUTED,
                  fontSize: '8px',
                }),
              }}
            >
              {row.value == null ? NOT_REPORTED : format(row.value)}
            </Box>
          </Box>
        );
      })}
    </Box>
  );
}
