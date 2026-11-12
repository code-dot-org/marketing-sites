import Box from '@mui/material/Box';

import {Link} from '@/components/dataDisplay/brandComponents';
import UsMap from '@/components/dataDisplay/map/UsMap';
import Stat from '@/components/dataDisplay/stat/Stat';
import StatGroup from '@/components/dataDisplay/stat/StatGroup';

import {BAND_FILLS, BANDS, NOT_REPORTED, OVERVIEW_INTRO} from '../../constants';
import {
  MAP_ANCHOR,
  methodologyPath,
  nationalPrintPath,
  statePath,
} from '../../paths';
import {
  formatPercent,
  formatRank,
  formatScore,
  type OverviewModel,
} from '../../readReport';
import {ReportFooter, ReportHero, ReportSection} from '../common';

import OverviewMapPanel, {type PanelState} from './OverviewMapPanel';
import OverviewNational from './OverviewNational';
import OverviewRankings from './OverviewRankings';

const OVERVIEW = [
  OVERVIEW_INTRO,
  'Find your state on the map to see its full profile.',
];

/** The Studio "Statistics - centered no subtext" style, shrunk to fit six. */
const statStyle = {layout: 'centered', size: 'medium'} as const;

const bandLabel = (band: string | null) =>
  BANDS.find(b => b.band === band)?.label ?? NOT_REPORTED;

const bothGender = (g: {female: number | null; male: number | null} | null) =>
  g && g.female != null && g.male != null
    ? {female: g.female, male: g.male}
    : null;

/** The overview page: national figures and the score map. */
export default function OverviewSection({
  model,
  locale,
}: {
  model: OverviewModel;
  locale: string;
}) {
  const {stats} = model;

  const map = (
    <UsMap
      title="Digital Fluency Index Score by state"
      emptyLabel={NOT_REPORTED}
      legend={[
        ...BANDS.map(b => ({label: b.label, fill: b.fill})),
        {label: NOT_REPORTED, fill: null},
      ]}
      tableColumns={[
        {key: 'name', label: 'State'},
        {key: 'score', label: 'Score', numeric: true},
        {key: 'band', label: 'Score band'},
      ]}
      regions={model.regions.map(r => ({
        code: r.postal,
        name: r.name,
        label: `${r.name}, score ${formatScore(r.total)}, ${bandLabel(r.band)}`,
        fill: r.band ? BAND_FILLS[r.band] : null,
        href: statePath(r.slug, locale),
        cells: {
          name: r.name,
          score: formatScore(r.total),
          band: bandLabel(r.band),
        },
      }))}
    />
  );

  return (
    <>
      <ReportHero
        title="The State of Digital Fluency"
        titleColor="purpleDark"
        subtitle={OVERVIEW}
        subtitleMaxWidth={[680, 600]}
        centered
        primaryAction={{href: `#${MAP_ANCHOR}`, label: 'View your state'}}
        secondaryAction={{
          href: nationalPrintPath(locale),
          label: 'View printable report',
        }}
      />

      <ReportSection label="National summary" background="purpleDark">
        <StatGroup label="National summary" columns={6} wideFrom="lg">
          <Stat
            label={'Avg Digital Fluency\nIndex Score'}
            value={stats.averageScore}
            emptyLabel={NOT_REPORTED}
            {...statStyle}
          />
          {BANDS.map(b => (
            <Stat
              key={b.band}
              // The range never splits across lines.
              label={`States scoring\n${b.label.replace(/ /g, '\u00A0')}`}
              value={stats.bandCounts[b.band]}
              digits={0}
              emptyLabel={NOT_REPORTED}
              {...statStyle}
            />
          ))}
          <Stat
            label={'Avg HS\nAccess'}
            value={stats.access}
            unit="%"
            digits={0}
            emptyLabel={NOT_REPORTED}
            {...statStyle}
          />
          <Stat
            label={'Avg HS\nParticipation'}
            value={stats.participation}
            unit="%"
            emptyLabel={NOT_REPORTED}
            {...statStyle}
          />
        </StatGroup>
      </ReportSection>

      <ReportSection
        id={MAP_ANCHOR}
        title="Digital Fluency Index Score Map"
        titleColor="purpleDark"
        intro="Hover over a state for details. Select a state to open its profile."
        introSize="regular"
        centerHeader
      >
        <OverviewMapPanel
          map={map}
          footer={
            <Box sx={{textAlign: 'left'}}>
              <Link
                href={methodologyPath(locale)}
                isLinkExternal={false}
                icon="arrow-right"
                size="s"
                removeMarginBottom
              >
                How the score works
              </Link>
            </Box>
          }
          national={{
            name: 'National Average',
            score:
              stats.averageScore == null
                ? NOT_REPORTED
                : `${formatScore(stats.averageScore)} / 100`,
            access: formatPercent(stats.access, 0),
            participation: formatPercent(stats.participation),
            gender: bothGender(model.nationalGender),
          }}
          tooltips={Object.fromEntries(
            model.regions.map(r => [
              r.postal,
              {title: r.name, detail: `Score ${formatScore(r.total)}`},
            ]),
          )}
          states={Object.fromEntries(
            model.regions.map(r => [
              r.postal,
              {
                name: r.name,
                score:
                  r.total == null
                    ? NOT_REPORTED
                    : `${formatScore(r.total)} / 100`,
                rank: formatRank(r.ranks.score),
                access: formatPercent(r.access, 0),
                participation: formatPercent(r.participation),
                gender: bothGender(r.gender),
              } satisfies PanelState,
            ]),
          )}
        />
      </ReportSection>

      <OverviewNational
        national={model.national}
        stats={stats}
        stateCount={model.stateCount}
      />

      <OverviewRankings rankings={model.rankings} locale={locale} />

      <ReportFooter dataAsOf={model.dataAsOf} />
    </>
  );
}
