import Box from '@mui/material/Box';

import Badge from '@/components/contentful/badge/Badge';
import {Paragraph} from '@/components/dataDisplay/brandComponents';
import type {ValueFormat} from '@/components/dataDisplay/chart/format';
import RankedBars from '@/components/dataDisplay/chart/RankedBars';
import FlexColumns from '@/components/dataDisplay/layout/FlexColumns';

import {
  NATIONAL_MARKER_COLOR,
  NOT_REPORTED,
  NOT_SCORED_COLOR,
  TIER_COLORS,
} from '../../constants';
import {
  formatRank,
  type RankRow,
  type StateModel,
  tierColor,
} from '../../readReport';
import {PanelHeading, ReportPanel} from '../common';

const LEGEND = [
  {label: 'Transformative', color: TIER_COLORS.Transformative},
  {label: 'Developing', color: TIER_COLORS.Developing},
  {label: 'Emerging', color: TIER_COLORS.Emerging},
  {label: 'Not scored', color: NOT_SCORED_COLOR},
];

export const nationalRankingsTitle = (name: string) =>
  `Where ${name} Ranks Nationally`;

/** The tier colors and the national-average line, as a list. */
export function TierLegend({size = 'default'}: {size?: 'default' | 'print'}) {
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
        justifyContent: size === 'print' ? undefined : 'center',
        columnGap: 3,
        rowGap: 1,
      }}
    >
      {LEGEND.map(item => (
        <Box
          component="li"
          key={item.label}
          sx={{display: 'flex', alignItems: 'center', gap: 1}}
        >
          <Box
            aria-hidden
            sx={{
              width: 12,
              height: 12,
              borderRadius: '2px',
              background: item.color,
            }}
          />
          <Paragraph
            visualAppearance={size === 'print' ? 'text-xs' : 'text-sm'}
            removeMarginBottom
          >
            {item.label}
          </Paragraph>
        </Box>
      ))}
      <Box component="li" sx={{display: 'flex', alignItems: 'center', gap: 1}}>
        <Box
          aria-hidden
          sx={{width: 16, borderTop: `2px dashed ${NATIONAL_MARKER_COLOR}`}}
        />
        <Paragraph
          visualAppearance={size === 'print' ? 'text-xs' : 'text-sm'}
          removeMarginBottom
        >
          National average
        </Paragraph>
      </Box>
    </Box>
  );
}

function Chart({
  heading,
  rank,
  national,
  referenceValue,
  rows,
  postal,
  valueHeading,
  valueFormat,
  interactive,
  size,
  width,
}: {
  heading: string;
  rank: number | null;
  national: string | null;
  referenceValue: number | null;
  rows: RankRow[];
  postal: string;
  valueHeading: string;
  valueFormat: ValueFormat;
  interactive: boolean;
  size: 'default' | 'print';
  width?: number;
}) {
  const content = (
    <>
      <PanelHeading size={size === 'print' ? 'print' : 'small'}>
        {`${heading}: ${rank == null ? NOT_REPORTED : `${formatRank(rank)} nationally`}`}
      </PanelHeading>
      {national && (
        <Box sx={{mb: 1.5}}>
          <Badge
            text={`National average ${national}`}
            color="black"
            size="small"
            appearance="light"
          />
        </Box>
      )}
      <RankedBars
        title={`${heading}: all states, ranked`}
        labelHeading="State"
        valueHeading={valueHeading}
        valueFormat={valueFormat}
        emptyLabel={NOT_REPORTED}
        highlightKey={postal}
        reference={{value: referenceValue, label: 'National average'}}
        interactive={interactive}
        size={size}
        width={width}
        items={rows.map(r => ({
          key: r.postal,
          label: r.postal,
          value: r.value,
          color: tierColor(r.tierLabel),
        }))}
      />
    </>
  );

  return size === 'print' ? (
    <Box sx={{minWidth: 0}}>{content}</Box>
  ) : (
    <ReportPanel bordered>{content}</ReportPanel>
  );
}

/** Three ranked charts with this state highlighted. The caller supplies the h2. */
export default function NationalRankings({
  model,
  size = 'default',
}: {
  model: Pick<StateModel, 'rankings' | 'name' | 'postal'>;
  size?: 'default' | 'print';
}) {
  const {rankings} = model;
  const interactive = size !== 'print';
  const national = rankings.national;

  return (
    <Box sx={{display: 'flex', flexDirection: 'column', gap: 4}}>
      <TierLegend size={size} />
      <Chart
        heading="Digital Fluency Index Score"
        rank={rankings.ranks.score}
        national={national.score == null ? null : national.score.toFixed(1)}
        referenceValue={national.score}
        rows={rankings.score}
        postal={model.postal}
        valueHeading="Score"
        valueFormat={{digits: 1}}
        interactive={interactive}
        size={size}
        width={960}
      />
      <FlexColumns
        columns={{xs: 1, md: 2}}
        columnGap={{xs: 4, md: 10}}
        rowGap={4}
      >
        <Chart
          heading="High School Access"
          rank={rankings.ranks.access}
          national={
            national.access == null ? null : `${Math.round(national.access)}%`
          }
          referenceValue={national.access}
          rows={rankings.access}
          postal={model.postal}
          valueHeading="Access"
          valueFormat={{digits: 0, suffix: '%'}}
          interactive={interactive}
          size={size}
        />
        <Chart
          heading="HS Participation (All Students)"
          rank={rankings.ranks.participation}
          national={
            national.participation == null
              ? null
              : `${national.participation.toFixed(1)}%`
          }
          referenceValue={national.participation}
          rows={rankings.participation}
          postal={model.postal}
          valueHeading="Participation"
          valueFormat={{digits: 1, suffix: '%'}}
          interactive={interactive}
          size={size}
        />
      </FlexColumns>
    </Box>
  );
}
