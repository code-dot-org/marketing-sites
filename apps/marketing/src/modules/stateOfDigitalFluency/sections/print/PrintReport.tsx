import Box from '@mui/material/Box';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableFooter from '@mui/material/TableFooter';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import type {ReactNode} from 'react';

import Badge from '@/components/contentful/badge/Badge';
import {CustomText, Paragraph} from '@/components/dataDisplay/brandComponents';
import type {ValueFormat} from '@/components/dataDisplay/chart/format';
import Pie from '@/components/dataDisplay/chart/Pie';
import RankedBars from '@/components/dataDisplay/chart/RankedBars';
import YearBars from '@/components/dataDisplay/chart/YearBars';
import {CODEAI, codeaiVar} from '@/components/dataDisplay/codeaiColors';
import {flexColumnsSx} from '@/components/dataDisplay/layout/FlexColumns';

import {
  GENDER_COLORS,
  HIGHLIGHTS,
  NOT_REPORTED,
  REPORT_TITLE,
  TIER_COLORS,
  TIER_FAMILIES,
} from '../../constants';
import {statePath} from '../../paths';
import {
  formatChange,
  formatRank,
  formatScore,
  type RankRow,
  type StateModel,
  tierColor,
  type NationalModel,
} from '../../readReport';
import {Narrative} from '../common';
import RankList from '../rankings/RankList';
import AccessCard, {ACCESS_TITLE} from '../state/AccessCard';
import ParticipationCard, {
  PARTICIPATION_TITLE,
} from '../state/ParticipationCard';
import PolicyCard, {POLICY_TITLE} from '../state/PolicyCard';
import {PrintScoreBand} from '../state/ScoreHero';

import PrintLayout, {
  PageTitle,
  PrintBand,
  PrintHeading,
  PrintPage,
  PrintPanel,
  printTile as tile,
  Small,
} from './PrintLayout';

type National = NationalModel;

const TIER_THRESHOLDS = [
  {label: 'Transformative', range: '81–100', color: TIER_COLORS.Transformative},
  {label: 'Developing', range: '51–80', color: TIER_COLORS.Developing},
  {label: 'Emerging', range: '0–50', color: TIER_COLORS.Emerging},
];

// Report page 5's component descriptions, carried unchanged (research open item 3).
const BREAKDOWN = [
  {
    key: 'policy',
    label: 'Policy Maturity',
    max: 45,
    note: 'Sum of all ten policy tiers on the 6-level AI-forward scale, normalized to 0-45 points.',
  },
  {
    key: 'access',
    label: 'Access Availability',
    max: 12,
    note: "Most recent year's % of public HS offering foundational CS, scored with a power curve (x^1.5) to 0-12 points.",
  },
  {
    key: 'participation',
    label: 'Participation',
    max: 18,
    note: 'Senior cohort enrollment rate, capped at 25% for full marks. Rates above 25% (from multi-course counting) also receive full marks. Power curve (x^1.5) scaling to 0-18 points.',
  },
  {
    key: 'momentum',
    label: 'Momentum',
    max: 15,
    note: 'Policy tier changes over a 3-year lookback window. Recent changes worth more: 1.5 / 1.0 / 0.5 pts by recency.',
  },
  {
    key: 'leadership',
    label: 'Leadership & Commitment',
    max: 10,
    note: 'Active taskforce (4 pts) + TeachAI membership (3 pts) + CSedWeek proclamation with AI mention (3 pts) / without (1.5 pts).',
  },
] as const;

const outOf = (value: number | null, max: number) =>
  value == null ? NOT_REPORTED : `${value.toFixed(1)} / ${max}`;

function RankingPage({
  label,
  heading,
  summary,
  model,
  rows,
  rank,
  national,
  valueHeading,
  valueFormat,
  dataAsOf,
  children,
}: {
  label: string;
  heading: string;
  summary: string;
  model: StateModel;
  rows: RankRow[];
  rank: number | null;
  national: number | null;
  valueHeading: string;
  valueFormat: ValueFormat;
  dataAsOf: string | null;
  children?: ReactNode;
}) {
  return (
    <PrintPage label={label} edition={model.name} dataAsOf={dataAsOf}>
      <Box sx={{textAlign: 'center'}}>
        <PrintHeading level="h2">{heading} – 50 States and D.C.</PrintHeading>
        <Paragraph visualAppearance="text-sm" removeMarginBottom>
          {model.name} ranks{' '}
          <strong>
            {rank == null ? NOT_REPORTED : `${formatRank(rank)} nationally`}
          </strong>{' '}
          {summary}
        </Paragraph>
      </Box>
      <RankedBars
        title={`${heading}: all states, ranked`}
        labelHeading="State"
        valueHeading={valueHeading}
        valueFormat={valueFormat}
        emptyLabel={NOT_REPORTED}
        highlightKey={model.postal}
        reference={{value: national, label: 'National average'}}
        interactive={false}
        size="print"
        rowHeight={11}
        width={720}
        items={rows.map(r => ({
          key: r.postal,
          label: r.postal,
          value: r.value,
          color: tierColor(r.tierLabel),
        }))}
      />
      {children}
    </PrintPage>
  );
}

/** The 8-page printable report for one state, matching report.html. */
export default function PrintReport({
  model,
  national,
  stateCount,
  locale,
}: {
  model: StateModel;
  national: National;
  stateCount: number;
  locale: string;
}) {
  const {score, rankings, dataAsOf} = model;
  const scoreChange = formatChange(score.change, ' pts');
  const narratives = model.narratives;
  const counts = national.policyCounts;
  const count = (key: keyof typeof counts) =>
    counts[key] == null ? NOT_REPORTED : `${counts[key]} of ${stateCount}`;

  return (
    <PrintLayout
      back={{
        href: statePath(model.slug, locale),
        label: `Back to ${model.name} profile`,
      }}
    >
      {/* 1 · Profile */}
      <PrintPage
        label={`Page 1 · ${model.name} Profile`}
        edition={model.name}
        dataAsOf={dataAsOf}
      >
        <PageTitle
          level="h1"
          overline={REPORT_TITLE}
          title={model.name}
          aside={
            <>
              <Small>
                {rankings.ranks.score == null ? (
                  `Overall rank: ${NOT_REPORTED}`
                ) : (
                  <>
                    Ranked <strong>{formatRank(rankings.ranks.score)}</strong>{' '}
                    nationwide
                  </>
                )}
              </Small>
              <Small>code.org/advocacy</Small>
            </>
          }
        />
        <PrintScoreBand score={score} />
        <PrintPanel title={POLICY_TITLE}>
          <PolicyCard model={model} size="print" showNarratives={false} />
        </PrintPanel>
        <Box sx={flexColumnsSx(2, 1)}>
          <PrintPanel title={ACCESS_TITLE}>
            <AccessCard model={model} size="print" showNarrative={false} />
          </PrintPanel>
          <PrintPanel title={PARTICIPATION_TITLE}>
            <ParticipationCard
              model={model}
              size="print"
              showNarrative={false}
              showSeniorCohort={false}
            />
          </PrintPanel>
        </Box>
      </PrintPage>

      {/* 2 · Score ranking */}
      <RankingPage
        label="Page 2 · Digital Fluency Index Score Ranking"
        heading="Digital Fluency Index Score"
        summary="· bar colour = score tier"
        model={model}
        rows={rankings.score}
        rank={rankings.ranks.score}
        national={rankings.national.score}
        valueHeading="Score"
        valueFormat={{digits: 1}}
        dataAsOf={dataAsOf}
      >
        <PrintPanel>
          <Box
            sx={{
              display: 'flex',
              gap: 2.5,
              alignItems: 'center',
            }}
          >
            <Box sx={{flex: '0 0 auto'}}>
              <CustomText
                type="statistic"
                htmlTag="p"
                fontSize={2}
                lineHeight={1.1}
                removeMarginBottom
              >
                {formatScore(score.total)}
              </CustomText>
              {score.total != null && <Small>out of 100</Small>}
              {score.tierLabel && (
                <Box sx={{mt: 0.5}}>
                  <Badge
                    text={score.tierLabel}
                    color={TIER_FAMILIES[score.tierLabel]}
                    size="small"
                    appearance="light"
                  />
                </Box>
              )}
            </Box>
            <Box sx={{flex: 1, minWidth: 0}}>
              <PrintHeading level="h3">How the score is built</PrintHeading>
              <Box
                component="ul"
                sx={{
                  listStyle: 'none',
                  p: 0,
                  m: 0,
                  display: 'flex',
                  flexWrap: 'wrap',
                  columnGap: 2,
                }}
              >
                {BREAKDOWN.map(c => (
                  <li key={c.key}>
                    <Small>
                      <strong>{formatScore(score[c.key])}</strong> /{c.max}{' '}
                      {c.label}
                    </Small>
                  </li>
                ))}
              </Box>
              <Box
                component="ul"
                sx={{
                  listStyle: 'none',
                  p: 0,
                  m: 0,
                  mt: 1,
                  display: 'flex',
                  gap: 2,
                }}
              >
                {TIER_THRESHOLDS.map(t => (
                  <Box
                    component="li"
                    key={t.label}
                    sx={{display: 'flex', alignItems: 'center', gap: 0.5}}
                  >
                    <Box
                      aria-hidden
                      sx={{
                        width: 10,
                        height: 10,
                        borderRadius: '2px',
                        background: t.color,
                      }}
                    />
                    <Small>
                      <strong>{t.label}</strong> {t.range}
                    </Small>
                  </Box>
                ))}
              </Box>
            </Box>
          </Box>
        </PrintPanel>
      </RankingPage>

      {/* 3 · Access ranking */}
      <RankingPage
        label="Page 3 · High School Access Ranking"
        heading="High School Access"
        summary="in HS access"
        model={model}
        rows={rankings.access}
        rank={rankings.ranks.access}
        national={rankings.national.access}
        valueHeading="Access"
        valueFormat={{digits: 0, suffix: '%'}}
        dataAsOf={dataAsOf}
      />

      {/* 4 · Participation ranking */}
      <RankingPage
        label="Page 4 · HS Participation Ranking"
        heading="HS Participation (All Students)"
        summary="in HS participation"
        model={model}
        rows={rankings.participation}
        rank={rankings.ranks.participation}
        national={rankings.national.participation}
        valueHeading="Participation"
        valueFormat={{digits: 1, suffix: '%'}}
        dataAsOf={dataAsOf}
      />

      {/* 5 · Score deep dive */}
      <PrintPage
        label={`Page 5 · ${model.name} Score Deep Dive`}
        edition={model.name}
        dataAsOf={dataAsOf}
      >
        <PageTitle
          title={`${model.name} · Score Breakdown`}
          aside={
            <Small strong>
              {`${formatScore(score.total)} / 100${score.tierLabel ? ` · ${score.tierLabel}` : ''}`}
            </Small>
          }
        />
        <PrintPanel title={`How the ${formatScore(score.total)}/100 is built`}>
          <Table
            size="small"
            sx={{
              '& td, & th': {
                py: 0.5,
                fontSize: '0.75rem',
                lineHeight: 1.35,
                borderColor: codeaiVar('gray2'),
              },
            }}
          >
            <caption style={{captionSide: 'top', padding: 0}}>
              <Small>Score components for {model.name}</Small>
            </caption>
            <TableHead>
              <TableRow>
                <TableCell scope="col">Component</TableCell>
                <TableCell scope="col" align="right">
                  Score
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {BREAKDOWN.map(c => (
                <TableRow key={c.key}>
                  <TableCell component="th" scope="row">
                    <strong>{c.label}</strong>
                    <Box
                      sx={{fontSize: '0.6875rem', color: codeaiVar('gray6')}}
                    >
                      {c.note}
                    </Box>
                  </TableCell>
                  <TableCell align="right">
                    {outOf(score[c.key], c.max)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
            <TableFooter>
              <TableRow>
                <TableCell component="th" scope="row">
                  Total
                </TableCell>
                <TableCell
                  align="right"
                  sx={{color: codeaiVar('purplePrimary'), fontWeight: 700}}
                >
                  {outOf(score.total, 100)}
                </TableCell>
              </TableRow>
            </TableFooter>
          </Table>
          {scoreChange && (
            <Box sx={{mt: 1}}>
              <Small>Year-over-year change: {scoreChange}</Small>
            </Box>
          )}
        </PrintPanel>
        <PrintPanel title="Policy Intent & Recommendation">
          <Box sx={flexColumnsSx(2, 1.5)}>
            {[
              ['Intent', narratives.aiPolicyIntent],
              ['Recommendation', narratives.aiPolicyRecommendation],
              ['Access context', narratives.accessNarrative],
              ['Participation context', narratives.participationNarrative],
            ].map(([heading, text]) =>
              text ? (
                <Box key={heading}>
                  <PrintHeading level="h3">{heading}</PrintHeading>
                  <Narrative text={text} size="print" />
                </Box>
              ) : null,
            )}
          </Box>
        </PrintPanel>
        <PrintPanel title="A Call to Action">
          <Small>
            Advocates, educators, and policymakers in {model.name} can use this
            profile to identify the next high-leverage policy move. Join the
            Code.org advocacy coalition at code.org/advocacy to receive alerts
            and state-level toolkits.
          </Small>
        </PrintPanel>
      </PrintPage>

      {/* 6 · National overview */}
      <PrintPage
        label="Page 6 · National Overview"
        edition={model.name}
        dataAsOf={dataAsOf}
      >
        <PrintBand background="purpleDark">
          <Paragraph visualAppearance="text-xs" isStrong removeMarginBottom>
            {national.yearLabel ? `${national.yearLabel} ` : ''}Annual Report ·{' '}
            {model.name} Edition
          </Paragraph>
          <PrintHeading level="h2">{REPORT_TITLE}</PrintHeading>
          <Paragraph visualAppearance="text-sm" removeMarginBottom>
            A snapshot of how every U.S. jurisdiction is building the policy,
            access, and participation foundations that make Digital Sciences
            education foundational for all students.
          </Paragraph>
        </PrintBand>
        <PrintPanel title="AI Policy Landscape">
          <Small>
            Of the ten foundational Digital Sciences policies tracked this year,
            here is how many jurisdictions have reached meaningful adoption,
            defined as the <em>Developing</em> tier or higher.
          </Small>
          <Box
            component="ul"
            sx={{
              listStyle: 'none',
              p: 0,
              m: 0,
              mt: 1.5,
              ...flexColumnsSx(2, 1.5),
            }}
          >
            {(
              [
                [
                  'standards',
                  'jurisdictions have Digital Science standards at Developing or above',
                ],
                [
                  'pd_funding',
                  'jurisdictions fund Digital Sciences professional development at Developing or above',
                ],
                [
                  'diploma_req',
                  'jurisdictions require Digital Sciences for graduation at Developing or above',
                ],
                [
                  'plan_guidance',
                  'jurisdictions publish a statewide Digital Sciences plan at Developing or above',
                ],
              ] as const
            ).map(([key, text]) => (
              <Box component="li" key={key} sx={tile}>
                <CustomText
                  type="statistic"
                  htmlTag="p"
                  fontSize={1.375}
                  lineHeight={1.2}
                  removeMarginBottom
                >
                  {count(key)}
                </CustomText>
                <Small>{text}</Small>
              </Box>
            ))}
          </Box>
          <Box sx={{mt: 2}}>
            <Small>
              National Digital Fluency Index Score average:{' '}
              <strong>{outOf(national.averageScore, 100)}</strong>. {model.name}
              &apos;s individual score of{' '}
              <strong>{outOf(score.total, 100)}</strong> appears on Page 1 with
              a full component breakdown on Page 5.
            </Small>
          </Box>
        </PrintPanel>
      </PrintPage>

      {/* 7 · National trends */}
      <PrintPage
        label="Page 7 · National Trends & Highlights"
        edition={model.name}
        dataAsOf={dataAsOf}
      >
        <PrintPanel title="Trends in AI and CS Education">
          <YearBars
            title="National high school CS access by school year"
            seriesLabel="National"
            color={CODEAI.purplePrimary}
            emptyLabel={NOT_REPORTED}
            interactive={false}
            size="print"
            points={national.accessSeries.map(p => ({
              key: p.year,
              label: p.label,
              value: p.value,
            }))}
          />
          <Box sx={{mt: 1}}>
            <Small center>
              National avg HS participation in Digital Sciences:{' '}
              <strong>
                {national.participation == null
                  ? NOT_REPORTED
                  : `${national.participation.toFixed(1)}%`}
              </strong>
            </Small>
          </Box>
        </PrintPanel>
        <Box sx={flexColumnsSx(2, 1)}>
          <PrintPanel title="Participation by Gender">
            <Pie
              title="National high school Digital Sciences enrollment by gender"
              emptyLabel={NOT_REPORTED}
              size="print"
              slices={[
                {
                  key: 'female',
                  label: 'Young Women',
                  value: national.gender.female,
                  color: GENDER_COLORS.female,
                },
                {
                  key: 'male',
                  label: 'Young Men',
                  value: national.gender.male,
                  color: GENDER_COLORS.male,
                },
              ]}
            />
          </PrintPanel>
          <PrintPanel title="Why This Matters">
            <Small>
              States that anchor Digital Sciences in statute move the fastest.
              The ten policies tracked in this report form a shared vocabulary
              for policymakers, practitioners, and advocates working across very
              different state contexts.
            </Small>
            <Box sx={{mt: 1}}>
              <Small>
                Numbers on every page are recomputed from {stateCount}{' '}
                jurisdiction records. When a state updates, these figures update
                automatically.
              </Small>
            </Box>
          </PrintPanel>
        </Box>
        <PrintPanel title="Digital Sciences Highlights">
          <Box
            component="ul"
            sx={{
              listStyle: 'none',
              p: 0,
              m: 0,
              ...flexColumnsSx(2, 1.5),
            }}
          >
            {HIGHLIGHTS.map(h => (
              <Box component="li" key={h.state} sx={tile}>
                <Small strong>{h.state}</Small>
                <CustomText
                  type="overline"
                  htmlTag="p"
                  color="purplePrimary"
                  fontSize={0.625}
                  removeMarginBottom
                >
                  {h.tag}
                </CustomText>
                <Box sx={{mt: 0.5}}>
                  <Small strong>{h.headline}</Small>
                </Box>
                <Box sx={{mt: 0.5}}>
                  <Small>{h.body}</Small>
                </Box>
              </Box>
            ))}
          </Box>
        </PrintPanel>
      </PrintPage>

      {/* 8 · Compact national rankings */}
      <PrintPage
        label="Page 8 · National Rankings"
        edition={model.name}
        dataAsOf={dataAsOf}
      >
        <PageTitle
          title="State Rankings"
          aside={
            <Small>
              Your state: <strong>{model.postal}</strong>
            </Small>
          }
        />
        <Box sx={flexColumnsSx(3, 1.5)}>
          {(
            [
              [
                'Digital Fluency Index Score',
                rankings.score,
                (v: number) => v.toFixed(1),
              ],
              [
                'High School Access',
                rankings.access,
                (v: number) => `${v.toFixed(0)}%`,
              ],
              [
                'High School Participation',
                rankings.participation,
                (v: number) => `${v.toFixed(1)}%`,
              ],
            ] as const
          ).map(([heading, rows, format]) => (
            <Box key={heading}>
              <PrintHeading level="h3">{heading}</PrintHeading>
              <RankList
                label={`States ranked by ${heading}`}
                rows={rows}
                format={format}
                color={row => tierColor(row.tierLabel)}
                locale={locale}
                highlightPostal={model.postal}
                size="print"
              />
            </Box>
          ))}
        </Box>
      </PrintPage>
    </PrintLayout>
  );
}
