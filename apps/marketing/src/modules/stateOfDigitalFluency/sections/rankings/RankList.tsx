import Box from '@mui/material/Box';

import {Link, Paragraph} from '@/components/dataDisplay/brandComponents';
import {codeaiVar} from '@/components/dataDisplay/codeaiColors';

import {NOT_REPORTED} from '../../constants';
import {statePath} from '../../paths';
import type {RankRow} from '../../readReport';

export interface RankListProps {
  label: string;
  rows: RankRow[];
  format: (value: number) => string;
  color: (row: RankRow) => string;
  locale: string;
  /** Bar scale. Defaults to the largest value in `rows`; pass it when one
   *  ranking is split across lists. */
  max?: number;
  /** Postal code of a row to emphasise. */
  highlightPostal?: string;
  size?: 'default' | 'print';
}

/** An ordered list of states with a bar per value. Unreported states come last. */
export default function RankList({
  label,
  rows,
  format,
  color,
  locale,
  max: maxProp,
  highlightPostal,
  size = 'default',
}: RankListProps) {
  const isPrint = size === 'print';
  const max = maxProp || Math.max(0, ...rows.map(r => r.value ?? 0)) || 1;
  const printText = {fontSize: '0.5625rem', lineHeight: 1.15};

  return (
    <Box component="ol" aria-label={label} sx={{listStyle: 'none', m: 0, p: 0}}>
      {rows.map(row => {
        const notReported = row.value == null;
        const highlighted = row.postal === highlightPostal;
        const rank = `${row.rank ?? '—'}.`;
        return (
          <Box
            component="li"
            key={row.postal}
            aria-current={highlighted ? 'true' : undefined}
            sx={{
              display: 'grid',
              gridTemplateColumns: isPrint
                ? '40px 1fr 56px'
                : '24px 28px 1fr 88px',
              alignItems: 'center',
              gap: isPrint ? 1.5 : 1,
              px: isPrint ? 0.5 : 1,
              py: isPrint ? 0 : 0.5,
              background: highlighted ? codeaiVar('purpleLight') : undefined,
              borderRadius: '2px',
              ...(!isPrint && {
                '&:hover .rank-bar-fill': {
                  boxShadow: `0 0 8px 1px color-mix(in srgb, ${color(row)} 55%, transparent)`,
                },
              }),
            }}
          >
            {isPrint ? (
              <Paragraph
                visualAppearance="text-xs"
                isStrong
                removeMarginBottom
                sx={printText}
              >
                {`${rank} ${row.postal}`}
              </Paragraph>
            ) : (
              <>
                <Paragraph
                  visualAppearance="text-sm"
                  removeMarginBottom
                  sx={{fontVariantNumeric: 'tabular-nums', textAlign: 'right'}}
                >
                  {rank}
                </Paragraph>
                {/* Only the abbreviation is linked; its name leads with it. */}
                <Link
                  href={statePath(row.slug, locale)}
                  isLinkExternal={false}
                  // Matches the text-sm rank and value beside it.
                  size="m"
                  ariaLabel={`${row.postal}, ${row.name}: ${
                    notReported ? NOT_REPORTED : format(row.value!)
                  }`}
                  removeMarginBottom
                >
                  {row.postal}
                </Link>
              </>
            )}
            <Box
              aria-hidden
              sx={{
                height: isPrint ? 6 : 10,
                background: codeaiVar('gray2'),
                borderRadius: '2px',
              }}
            >
              <Box
                className="rank-bar-fill"
                sx={{
                  width: notReported ? 0 : `${(row.value! / max) * 100}%`,
                  height: '100%',
                  background: color(row),
                  borderRadius: '2px',
                  transition: 'box-shadow 200ms ease-out',
                }}
              />
            </Box>
            <Box aria-hidden={!isPrint || undefined}>
              <Paragraph
                visualAppearance={isPrint ? 'text-xs' : 'text-sm'}
                isStrong={!notReported}
                isItalic={notReported}
                color={notReported ? 'gray6' : 'black'}
                removeMarginBottom
                sx={{
                  // On screen the value sits against its bar.
                  textAlign: isPrint ? 'right' : 'left',
                  fontVariantNumeric: 'tabular-nums',
                  ...(isPrint && printText),
                }}
              >
                {notReported ? NOT_REPORTED : format(row.value!)}
              </Paragraph>
            </Box>
          </Box>
        );
      })}
    </Box>
  );
}
