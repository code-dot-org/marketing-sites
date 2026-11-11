import Box from '@mui/material/Box';

import {Link, Paragraph} from '@/components/dataDisplay/brandComponents';
import FlexColumns from '@/components/dataDisplay/layout/FlexColumns';

import {NOT_REPORTED, OVERVIEW_INTRO, REPORT_TITLE} from '../../constants';
import {methodologyPath, overviewPath, printPath, statePath} from '../../paths';
import {formatRank, type StateModel} from '../../readReport';
import {ReportFooter, ReportHero, ReportPanel, ReportSection} from '../common';

import AccessCard, {ACCESS_TITLE} from './AccessCard';
import NationalRankings, {nationalRankingsTitle} from './NationalRankings';
import ParticipationCard, {PARTICIPATION_TITLE} from './ParticipationCard';
import PolicyCard, {POLICY_TITLE} from './PolicyCard';
import ScoreHero from './ScoreHero';

/** One state's profile page. */
export default function StateSection({
  model,
  locale,
}: {
  model: StateModel;
  locale: string;
}) {
  const rank = model.rankings.ranks.score;
  const neighbourLabel = (n: NonNullable<StateModel['prev']>) =>
    `${n.name}${n.rank != null ? ` (#${n.rank})` : ''}`;

  return (
    <>
      <ReportHero
        title={`${REPORT_TITLE}: *${model.name}*`}
        titleColor="purpleDark"
        accentColor="purplePrimary"
        centered
        subtitle={[
          rank == null ? (
            `Overall rank: ${NOT_REPORTED}`
          ) : (
            <>
              Ranked <strong>{formatRank(rank)}</strong> nationwide
            </>
          ),
          OVERVIEW_INTRO,
        ]}
        subtitleMaxWidth={[680, 680]}
        primaryAction={{href: overviewPath(locale), label: 'View all states'}}
        secondaryAction={{
          href: printPath(model.slug, locale),
          label: 'View full printable report',
        }}
      />

      <ScoreHero
        score={model.score}
        methodologyHref={methodologyPath(locale)}
      />

      <ReportSection
        title={POLICY_TITLE}
        titleColor="purpleDark"
        centerHeader
        divider
      >
        <ReportPanel bordered>
          <PolicyCard model={model} />
        </ReportPanel>
      </ReportSection>

      <ReportSection
        title="Access and Participation"
        titleColor="purpleDark"
        centerHeader
        divider
      >
        <FlexColumns
          columns={{xs: 1, md: 2}}
          columnGap={{xs: 4, md: 10}}
          alignItems="flex-start"
        >
          <ReportPanel title={ACCESS_TITLE} bordered>
            <AccessCard model={model} />
          </ReportPanel>
          <ReportPanel title={PARTICIPATION_TITLE} bordered>
            <ParticipationCard model={model} />
          </ReportPanel>
        </FlexColumns>
      </ReportSection>

      <ReportSection
        title={nationalRankingsTitle(model.name)}
        titleColor="purpleDark"
        centerHeader
      >
        <NationalRankings model={model} />
        <Box
          component="nav"
          aria-label="Neighbouring states by rank"
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 2,
            mt: 2,
          }}
        >
          {model.prev ? (
            <Link
              href={statePath(model.prev.slug, locale)}
              isLinkExternal={false}
              icon="arrow-left"
              iconPosition="left"
              removeMarginBottom
            >
              {neighbourLabel(model.prev)}
            </Link>
          ) : (
            <span />
          )}
          {model.next && (
            <Link
              href={statePath(model.next.slug, locale)}
              isLinkExternal={false}
              icon="arrow-right"
              removeMarginBottom
            >
              {neighbourLabel(model.next)}
            </Link>
          )}
        </Box>
      </ReportSection>

      <ReportFooter dataAsOf={model.dataAsOf}>
        {model.lastUpdated && (
          <Paragraph visualAppearance="text-sm" removeMarginBottom>
            Last updated {model.lastUpdated}
          </Paragraph>
        )}
      </ReportFooter>
    </>
  );
}
