import Box from '@mui/material/Box';

import {Paragraph} from '@/components/dataDisplay/brandComponents';
import {CODEAI} from '@/components/dataDisplay/codeaiColors';
import FlexColumns from '@/components/dataDisplay/layout/FlexColumns';

import {TIER_COLORS} from '../../constants';
import {RANKINGS_ANCHOR} from '../../paths';
import {type RankingsModel, type RankRow, tierColor} from '../../readReport';
import {PanelHeading, ReportPanel, ReportSection} from '../common';
import RankList from '../rankings/RankList';

const TIER_LEGEND = [
  {label: 'Transformative', range: '81–100', color: TIER_COLORS.Transformative},
  {label: 'Developing', range: '51–80', color: TIER_COLORS.Developing},
  {label: 'Emerging', range: '0–50', color: TIER_COLORS.Emerging},
];

/** States per column in the two-column score ranking. */
const SCORE_COLUMN_LENGTH = 25;

const largest = (rows: RankRow[]) =>
  Math.max(0, ...rows.map(r => r.value ?? 0));

const twoColumns = {
  columns: {xs: 1, md: 2},
  columnGap: {xs: 4, md: 10},
  alignItems: 'flex-start',
} as const;

function TierLegend() {
  return (
    <Box
      component="ul"
      aria-label="Tiers"
      sx={{
        listStyle: 'none',
        p: 0,
        m: 0,
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'center',
        gap: 3,
      }}
    >
      {TIER_LEGEND.map(t => (
        <Box
          component="li"
          key={t.label}
          sx={{display: 'flex', alignItems: 'center', gap: 1}}
        >
          <Box
            aria-hidden
            sx={{
              width: 12,
              height: 12,
              borderRadius: '50%',
              background: t.color,
            }}
          />
          <Paragraph visualAppearance="text-sm" removeMarginBottom>
            <strong>{t.label}</strong>: {t.range}
          </Paragraph>
        </Box>
      ))}
    </Box>
  );
}

function ListHeading({title, subtitle}: {title: string; subtitle: string}) {
  return (
    <Box sx={{mb: 2}}>
      <PanelHeading size="small">{title}</PanelHeading>
      <Paragraph
        visualAppearance="text-sm"
        color="gray6"
        removeMarginBottom
        sx={{marginTop: '-8px'}}
      >
        {subtitle}
      </Paragraph>
    </Box>
  );
}

/** The overview's ranking sections: score in two columns, then access and participation side by side. */
export default function OverviewRankings({
  rankings,
  locale,
}: {
  rankings: RankingsModel;
  locale: string;
}) {
  const scoreColumns = [
    rankings.score.slice(0, SCORE_COLUMN_LENGTH),
    rankings.score.slice(SCORE_COLUMN_LENGTH),
  ];
  const scoreMax = largest(rankings.score);
  const formatScore = (v: number) => v.toFixed(1);

  return (
    <>
      <ReportSection
        id={RANKINGS_ANCHOR}
        title="Digital Fluency Index Score"
        titleColor="purpleDark"
        centerHeader
        intro="Policy (45) + Access Availability (12) + Participation (18) + Momentum (15) + Leadership (10)"
        introSize="regular"
        divider
      >
        <TierLegend />
        <ReportPanel bordered>
          <FlexColumns {...twoColumns}>
            {scoreColumns.map((rows, i) => (
              <RankList
                key={i}
                // Positions, not ranks: unranked states close the list.
                label={`Digital Fluency Index Score ranking, ${
                  i * SCORE_COLUMN_LENGTH + 1
                }–${i * SCORE_COLUMN_LENGTH + rows.length}`}
                rows={rows}
                max={scoreMax}
                format={formatScore}
                color={row => tierColor(row.tierLabel)}
                locale={locale}
              />
            ))}
          </FlexColumns>
        </ReportPanel>
      </ReportSection>

      <ReportSection
        title="Access and Participation"
        titleColor="purpleDark"
        centerHeader
      >
        <FlexColumns {...twoColumns}>
          <ReportPanel bordered>
            <ListHeading
              title="High School Access"
              subtitle="% of schools offering foundational CS"
            />
            <RankList
              label="States ranked by high school access"
              rows={rankings.access}
              format={v => `${v.toFixed(0)}%`}
              color={() => CODEAI.bluePrimary}
              locale={locale}
            />
          </ReportPanel>
          <ReportPanel bordered>
            <ListHeading
              title="HS Participation (All Students)"
              subtitle="% of HS students in Digital Sciences (non-dup)"
            />
            <RankList
              label="States ranked by high school participation"
              rows={rankings.participation}
              format={v => `${v.toFixed(1)}%`}
              color={() => CODEAI.purplePrimary}
              locale={locale}
            />
          </ReportPanel>
        </FlexColumns>
      </ReportSection>
    </>
  );
}
