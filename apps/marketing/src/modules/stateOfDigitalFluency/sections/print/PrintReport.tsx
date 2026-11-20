import Box from '@mui/material/Box';
import Image from 'next/image';
import type {ReactNode} from 'react';

import Pie from '@/components/dataDisplay/chart/Pie';
import YearBars from '@/components/dataDisplay/chart/YearBars';
import {CODEAI} from '@/components/dataDisplay/codeaiColors';
import logoImage from '@public/images/codeai-logo-primary.svg';

import {
  GENDER_COLORS,
  HIGHLIGHTS,
  NOT_REPORTED,
  SCORE_FORMULA,
  TIER_COLORS,
  TIER_LABELS,
  TIER_SEGMENTS,
} from '../../constants';
import {statePath} from '../../paths';
import {
  formatRank,
  formatScore,
  type NationalModel,
  type RankRow,
  type StateModel,
} from '../../readReport';
import type {Tier} from '../../types';

import PrintLayout, {
  DeltaTag,
  displayFont,
  footerText,
  HeaderBand,
  INK,
  MUTED,
  PrintCard,
  PrintHeading,
  PrintPage,
  PURPLE_BG,
  TIER_GRADIENT_TEXT,
  TIER_GRADIENTS,
} from './PrintLayout';
import {
  COMPACT_BAR_FILLS,
  CompactRankList,
  RankChart,
  RankChartKey,
} from './PrintRankChart';

const TIER_THRESHOLDS = [
  {label: 'Transformative', range: '81-100', color: TIER_COLORS.Transformative},
  {label: 'Developing', range: '51-80', color: TIER_COLORS.Developing},
  {label: 'Emerging', range: '0-50', color: TIER_COLORS.Emerging},
] as const;

// Report page 5's component descriptions. Leadership wording approved by the Policy team 2026-11-18.
const BREAKDOWN = [
  {
    key: 'policy',
    label: 'Policy Maturity',
    short: 'Policy Maturity',
    max: 45,
    note: 'Sum of all ten policy tiers on the 6-level AI-forward scale, normalized to 0-45 points.',
  },
  {
    key: 'access',
    label: 'Access Availability',
    short: 'Access Availability',
    max: 12,
    note: "Most recent year's % of public HS offering foundational CS, scored with a power curve (x^1.5) to 0-12 points.",
  },
  {
    key: 'participation',
    label: 'Participation',
    short: 'Participation',
    max: 18,
    note: 'Senior cohort enrollment rate, capped at 25% for full marks. Rates above 25% (from multi-course counting) also receive full marks. Power curve (x^1.5) scaling to 0-18 points.',
  },
  {
    key: 'momentum',
    label: 'Momentum',
    short: 'Momentum',
    max: 15,
    note: 'Policy tier changes over a 3-year lookback window. Recent changes worth more: 1.5 / 1.0 / 0.5 pts by recency.',
  },
  {
    key: 'leadership',
    label: 'Leadership & Commitment',
    short: 'Leadership',
    max: 10,
    note: 'Active taskforce (6 pts) + CSedWeek proclamation with AI mention (4 pts) / without AI (2 pts).',
  },
] as const;

/** Policy tier pills: dark text on the tier's light fill. */
const TIER_PILLS: Record<Tier, {color: string; background: string}> = {
  no: {color: MUTED, background: '#F5F5F5'},
  in_progress: {color: CODEAI.pinkDark, background: CODEAI.pinkLight},
  historic: {color: '#4B5563', background: '#F3F4F6'},
  emerging: {color: CODEAI.orangeDark, background: CODEAI.orangeLight},
  developing: {color: CODEAI.blueDark, background: CODEAI.blueLight},
  transformative: {color: CODEAI.purpleDark, background: CODEAI.purpleLight},
};

const fmtPct = (v: number, digits = 0) => `${v.toFixed(digits)}%`;
const digitsOf = (v: number | null) =>
  v != null && Number.isInteger(v) ? 0 : 1;

function Text({
  size = 12,
  children,
  sx,
}: {
  size?: number;
  children: ReactNode;
  sx?: object;
}) {
  return (
    <Box component="p" sx={{m: 0, fontSize: `${size}px`, ...sx}}>
      {children}
    </Box>
  );
}

function TierBar({tier}: {tier: Tier}) {
  return (
    <Box aria-hidden sx={{display: 'flex', gap: '3px', mb: '3px'}}>
      {TIER_SEGMENTS[tier].map((fill, i) => (
        <Box
          key={i}
          sx={{
            flex: 1,
            height: 8,
            borderRadius: '2px',
            background: fill ?? '#E5E5E5',
          }}
        />
      ))}
    </Box>
  );
}

function TierPill({tier}: {tier: Tier}) {
  return (
    <Box
      component="span"
      sx={{
        ...TIER_PILLS[tier],
        display: 'inline-block',
        fontSize: '9px',
        fontWeight: 700,
        letterSpacing: '.04em',
        textTransform: 'uppercase',
        px: '7px',
        py: '1px',
        borderRadius: '8px',
        lineHeight: 1.4,
        fontStyle: tier === 'historic' ? 'italic' : undefined,
      }}
    >
      {TIER_LABELS[tier]}
    </Box>
  );
}

/** The score card: a white circle with the total, then the components. */
function ScoreHero({score}: {score: StateModel['score']}) {
  const tier = score.tierLabel ?? 'Emerging';
  const color = TIER_GRADIENT_TEXT[tier];
  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: 'auto 1fr',
        gap: '20px',
        alignItems: 'center',
        borderRadius: '12px',
        px: '22px',
        py: '12px',
        background: TIER_GRADIENTS[tier],
        color,
      }}
    >
      <Box
        sx={{
          width: 104,
          height: 104,
          borderRadius: '50%',
          background: '#fff',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 3px 10px rgb(0 0 0 / 20%)',
        }}
      >
        <Box
          sx={{
            fontSize: '34px',
            fontWeight: 800,
            lineHeight: 1,
            color: TIER_COLORS[tier],
          }}
        >
          {formatScore(score.total)}
        </Box>
        <Box sx={{fontSize: '10px', color: MUTED, mt: '2px'}}>out of 100</Box>
      </Box>
      <Box>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px',
            mb: '4px',
          }}
        >
          <PrintHeading level="h2" sx={{fontSize: '17px'}}>
            Digital Fluency Index Score
          </PrintHeading>
          {score.change != null && score.change !== 0 && (
            <Box
              sx={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                fontSize: '12px',
                background: 'rgb(255 255 255 / 18%)',
                px: '10px',
                py: '2px',
                borderRadius: '10px',
              }}
            >
              YoY: <DeltaTag value={score.change} suffix=" pts" />
            </Box>
          )}
        </Box>
        <Text size={12} sx={{opacity: 0.92}}>
          Composite index tracking policy maturity, access, participation,
          momentum, and leadership commitment to Digital Sciences.
        </Text>
        <Box
          component="ul"
          sx={{
            listStyle: 'none',
            p: 0,
            m: 0,
            mt: '10px',
            display: 'grid',
            gridTemplateColumns: 'repeat(5, 1fr)',
            gap: '8px',
          }}
        >
          {BREAKDOWN.map(c => (
            <Box
              component="li"
              key={c.key}
              sx={{
                background: 'rgb(255 255 255 / 12%)',
                borderRadius: '6px',
                px: '9px',
                py: '4px',
                fontSize: '10px',
              }}
            >
              <Box sx={{lineHeight: 1.3}}>{c.short}</Box>
              <Box component="span" sx={{fontWeight: 800, fontSize: '14px'}}>
                {formatScore(score[c.key])}
                <Box component="span" sx={{fontSize: '10px', opacity: 0.7}}>
                  /{c.max}
                </Box>
              </Box>
            </Box>
          ))}
        </Box>
      </Box>
    </Box>
  );
}

function PolicyGrid({model}: {model: StateModel}) {
  return (
    <Box sx={{display: 'flex', flexDirection: 'column', gap: '6px'}}>
      {model.policyGroups.map(group => (
        <Box key={group.label}>
          <PrintHeading
            level="h3"
            sx={{
              fontFamily: 'inherit',
              fontSize: '10px',
              fontWeight: 800,
              textTransform: 'uppercase',
              letterSpacing: '.08em',
              color: CODEAI.purplePrimary,
              background: PURPLE_BG,
              borderRadius: '5px',
              px: '8px',
              py: '2px',
              mb: '4px',
            }}
          >
            {group.label}
          </PrintHeading>
          <Box
            component="ul"
            sx={{
              listStyle: 'none',
              p: 0,
              m: 0,
              px: '4px',
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '4px 18px',
            }}
          >
            {group.items.map(item => {
              const tier = item.tier ?? 'no';
              return (
                <li key={item.key}>
                  <Text
                    size={11}
                    sx={{
                      fontWeight: 600,
                      textAlign: 'center',
                      lineHeight: 1.3,
                      mb: '2px',
                    }}
                  >
                    {item.label}
                  </Text>
                  <TierBar tier={tier} />
                  <TierPill tier={tier} />
                </li>
              );
            })}
          </Box>
        </Box>
      ))}
    </Box>
  );
}

function AccessCard({model}: {model: StateModel}) {
  const {access} = model;
  return (
    <PrintCard title="Public High Schools Offering Digital Sciences Courses">
      <Text size={12} sx={{fontWeight: 700, textAlign: 'center'}}>
        Access by School Year
      </Text>
      <YearBars
        title={`${model.name}: public high schools offering Digital Sciences courses, by school year`}
        seriesLabel="State"
        referenceLabel="National average"
        color={CODEAI.purplePrimary}
        // Scale to the data, not 100%, so the bars reach the title.
        max={Math.max(
          1,
          ...access.series.map(p => p.value ?? 0),
          ...access.series.map(p => access.nationalByYear[p.year] ?? 0),
        )}
        emptyLabel={NOT_REPORTED}
        interactive={false}
        size="print"
        // The card's inner width, so labels print at their set size.
        width={320}
        height={150}
        points={access.series.map(p => ({
          key: p.year,
          label: p.label,
          value: p.value,
          reference: access.nationalByYear[p.year] ?? null,
        }))}
      />
      {access.change != null && access.change !== 0 && (
        <Text size={12} sx={{textAlign: 'center', mt: '6px'}}>
          Year-over-year:{' '}
          <DeltaTag
            value={access.change}
            suffix="%"
            digits={digitsOf(access.change)}
          />
        </Text>
      )}
    </PrintCard>
  );
}

function ParticipationCard({model}: {model: StateModel}) {
  const {participation: p, name} = model;
  const divider = {
    mt: '6px',
    pt: '6px',
    borderTop: '1px solid #ECECEC',
    textAlign: 'center',
    color: '#555',
  };
  const nationalGender = [
    p.nationalGender.female != null &&
      `${Math.round(p.nationalGender.female)}% Women`,
    p.nationalGender.male != null &&
      `${Math.round(p.nationalGender.male)}% Men`,
  ].filter(Boolean);

  return (
    <PrintCard title="HS Student Participation in Digital Sciences Courses">
      {p.totalPct == null ? (
        <Text size={13} sx={{color: MUTED, textAlign: 'center', py: '16px'}}>
          Participation data not yet available.
        </Text>
      ) : (
        <>
          <Text size={14} sx={{fontWeight: 800, lineHeight: 1.25}}>
            <Box component="strong" sx={{color: CODEAI.purplePrimary}}>
              {fmtPct(p.totalPct, 1)}
            </Box>{' '}
            of all high school students enrolled in at least one Digital
            Sciences course
            {p.yearLabel ? ` during the ${p.yearLabel} school year` : ''}.{' '}
            <DeltaTag value={p.change} suffix="%" />
          </Text>
          {p.national != null && (
            <Text size={11} sx={divider}>
              <strong>National average:</strong> {fmtPct(p.national, 1)}
            </Text>
          )}
          {p.gender && (
            <Box sx={{mt: '8px'}}>
              <Pie
                title={`${name}: high school Digital Sciences enrollment by gender`}
                emptyLabel={NOT_REPORTED}
                size="print"
                slices={[
                  {
                    key: 'female',
                    label: 'Young Women',
                    value: p.gender.female,
                    color: GENDER_COLORS.female,
                  },
                  {
                    key: 'male',
                    label: 'Young Men',
                    value: p.gender.male,
                    color: GENDER_COLORS.male,
                  },
                  ...(p.gender.other != null
                    ? [
                        {
                          key: 'other',
                          label: 'Other',
                          value: p.gender.other,
                          color: GENDER_COLORS.other,
                        },
                      ]
                    : []),
                ]}
              />
              {nationalGender.length > 0 && (
                <Text size={11} sx={divider}>
                  <strong>National avg:</strong> {nationalGender.join(' · ')}
                </Text>
              )}
            </Box>
          )}
          <Text size={10} sx={{color: '#555', textAlign: 'center', mt: '6px'}}>
            Non-duplicative; each student counted once across all course types.
          </Text>
        </>
      )}
    </PrintCard>
  );
}

function RankingTitle({
  heading,
  name,
  rank,
  summary,
  note,
}: {
  heading: string;
  name: string;
  rank: number | null;
  summary?: string;
  note?: string;
}) {
  return (
    <Box>
      <PrintHeading
        level="h2"
        sx={{
          textAlign: 'center',
          color: CODEAI.purplePrimary,
          fontSize: '17px',
          mb: '6px',
        }}
      >
        {heading} – 50 States and D.C.
      </PrintHeading>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'baseline',
          gap: '12px',
          mb: '8px',
        }}
      >
        <Text size={13} sx={{color: '#444'}}>
          {name} ranks{' '}
          <Box component="strong" sx={{color: CODEAI.purplePrimary}}>
            {rank == null ? NOT_REPORTED : `${formatRank(rank)} nationally`}
          </Box>
          {summary ? ` ${summary}` : ''}
        </Text>
        {note && (
          <Text size={11} sx={{color: MUTED}}>
            {note}
          </Text>
        )}
      </Box>
      <RankChartKey />
    </Box>
  );
}

function RankingPage({
  label,
  heading,
  summary,
  note,
  model,
  rows,
  rank,
  national,
  format,
  footer,
  children,
}: {
  label: string;
  heading: string;
  summary?: string;
  note?: string;
  model: StateModel;
  rows: RankRow[];
  rank: number | null;
  national: number | null;
  format: (v: number) => string;
  footer: string;
  children?: ReactNode;
}) {
  return (
    <PrintPage label={label} footer={footer}>
      <RankingTitle
        heading={heading}
        name={model.name}
        rank={rank}
        summary={summary}
        note={note}
      />
      <RankChart
        label={`${heading}: all states, ranked`}
        rows={rows}
        postal={model.postal}
        national={national}
        format={format}
      />
      {children}
    </PrintPage>
  );
}

/** Page 2's summary: the score in a tier-coloured circle, and how it's built. */
function ScoreSummary({model}: {model: StateModel}) {
  const {score} = model;
  const tier = score.tierLabel ?? 'Emerging';
  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: 'auto 1fr',
        gap: '20px',
        alignItems: 'start',
        px: '20px',
        py: '14px',
        background: PURPLE_BG,
        border: `1px solid ${CODEAI.purpleLight}`,
        borderRadius: '10px',
      }}
    >
      <Box sx={{textAlign: 'center'}}>
        <Box
          sx={{
            width: 96,
            height: 96,
            mx: 'auto',
            borderRadius: '50%',
            background: TIER_GRADIENTS[tier],
            color: TIER_GRADIENT_TEXT[tier],
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 800,
            boxShadow: '0 2px 8px rgb(0 0 0 / 15%)',
          }}
        >
          <Box sx={{fontSize: '30px', lineHeight: 1}}>
            {formatScore(score.total)}
          </Box>
          <Box sx={{fontSize: '9px', fontWeight: 400}}>out of 100</Box>
          {score.tierLabel && (
            <Box sx={{fontSize: '11px', mt: '2px'}}>{score.tierLabel}</Box>
          )}
        </Box>
        <Text size={11} sx={{fontWeight: 700, color: '#555', mt: '8px'}}>
          {model.name}
          {model.rankings.ranks.score != null &&
            ` · ${formatRank(model.rankings.ranks.score)} nationally`}
        </Text>
      </Box>
      <Box sx={{fontSize: '11px', color: '#333'}}>
        <PrintHeading
          level="h3"
          sx={{fontSize: '12px', color: CODEAI.purplePrimary, mb: '6px'}}
        >
          How the score is built
        </PrintHeading>
        <Box
          component="ul"
          sx={{
            listStyle: 'none',
            p: 0,
            m: 0,
            mb: '8px',
            display: 'flex',
            flexWrap: 'wrap',
            gap: '6px 14px',
          }}
        >
          {BREAKDOWN.map(c => (
            <li key={c.key}>
              <strong>{formatScore(score[c.key])}</strong>{' '}
              <Box component="span" sx={{color: MUTED}}>
                /{c.max} {c.short}
              </Box>
            </li>
          ))}
        </Box>
        <Text size={11} sx={{fontWeight: 700, color: '#555', mb: '4px'}}>
          Tier thresholds:
        </Text>
        <Box
          component="ul"
          sx={{
            listStyle: 'none',
            p: 0,
            m: 0,
            display: 'flex',
            flexWrap: 'wrap',
            gap: '12px',
          }}
        >
          {TIER_THRESHOLDS.map(t => (
            <Box
              component="li"
              key={t.label}
              sx={{display: 'flex', alignItems: 'center', gap: '5px'}}
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
              <span>
                <strong>{t.label}</strong> {t.range}
              </span>
            </Box>
          ))}
        </Box>
      </Box>
    </Box>
  );
}

const LANDSCAPE = [
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
] as const;

/** The 8-page printable report for one state, matching report.html. */
export default function PrintReport({
  model,
  national,
  stateCount,
  locale,
}: {
  model: StateModel;
  national: NationalModel;
  stateCount: number;
  locale: string;
}) {
  const {score, rankings, dataAsOf, narratives, name, postal} = model;
  const year = dataAsOf ? dataAsOf.slice(0, 4) : null;
  const dataLine = dataAsOf ? `Data as of ${dataAsOf}` : null;
  const stateFooter = footerText(year, name, dataLine);
  const tier = score.tierLabel ?? 'Emerging';
  const counts = national.policyCounts;
  const scoreText = `${formatScore(score.total)} / 100`;
  const nationalGender = national.gender;

  return (
    <PrintLayout
      back={{
        href: statePath(model.slug, locale),
        label: `Back to ${name} profile`,
      }}
    >
      {/* 1 · Profile */}
      <PrintPage label={`Page 1 · ${name} Profile`} footer={stateFooter}>
        <HeaderBand
          aside={
            <>
              {rankings.ranks.score == null ? (
                `Overall rank: ${NOT_REPORTED}`
              ) : (
                <>
                  Ranked <strong>{formatRank(rankings.ranks.score)}</strong>{' '}
                  nationwide
                </>
              )}
              {dataLine && (
                <Box
                  sx={{
                    fontSize: '10px',
                    color: CODEAI.purplePrimary,
                    fontWeight: 600,
                  }}
                >
                  {dataLine}
                </Box>
              )}
              <Box sx={{color: CODEAI.purplePrimary}}>code.org/advocacy</Box>
            </>
          }
        >
          <Box sx={{display: 'flex', alignItems: 'center', gap: '14px'}}>
            <Image
              src={logoImage}
              alt="CodeAI"
              style={{height: 30, width: 'auto'}}
            />
            <Box
              aria-hidden
              sx={{
                width: 44,
                height: 44,
                borderRadius: '50%',
                background: CODEAI.purplePrimary,
                color: '#fff',
                fontWeight: 700,
                fontSize: '14px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {postal}
            </Box>
            <PrintHeading
              level="h1"
              sx={{fontSize: '26px', letterSpacing: '.02em'}}
            >
              {name.toUpperCase()}
            </PrintHeading>
          </Box>
        </HeaderBand>
        <ScoreHero score={score} />
        {/* The policy focus and recommendation print in full on page 5. */}
        <PrintCard title="Policies for Digital Sciences Education">
          <PolicyGrid model={model} />
        </PrintCard>
        <Box
          sx={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px'}}
        >
          <AccessCard model={model} />
          <ParticipationCard model={model} />
        </Box>
      </PrintPage>

      {/* 2 · Score ranking */}
      <RankingPage
        label="Page 2 · Digital Fluency Index Score Ranking"
        heading="Digital Fluency Index Score"
        note="Sorted highest to lowest · bar color = score band"
        model={model}
        rows={rankings.score}
        rank={rankings.ranks.score}
        national={rankings.national.score}
        format={v => v.toFixed(1)}
        footer={stateFooter}
      >
        <ScoreSummary model={model} />
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
        format={v => fmtPct(v)}
        footer={stateFooter}
      />

      {/* 4 · Participation ranking */}
      <RankingPage
        label="Page 4 · HS Participation Ranking"
        heading="High School Participation (all students)"
        summary="in HS participation"
        model={model}
        rows={rankings.participation}
        rank={rankings.ranks.participation}
        national={rankings.national.participation}
        format={v => fmtPct(v, 1)}
        footer={stateFooter}
      />

      {/* 5 · Score deep dive */}
      <PrintPage
        label={`Page 5 · ${name} Score Deep Dive`}
        footer={stateFooter}
      >
        <HeaderBand
          aside={`${scoreText}${score.tierLabel ? ` · ${score.tierLabel}` : ''}`}
        >
          <PrintHeading level="h2" sx={{fontSize: '24px'}}>
            {name.toUpperCase()} · Score Breakdown
          </PrintHeading>
        </HeaderBand>
        <PrintCard title={`How the ${formatScore(score.total)}/100 is built`}>
          <Box
            component="table"
            sx={{
              width: '100%',
              borderCollapse: 'collapse',
              fontSize: '12px',
              '& th, & td': {
                px: '10px',
                py: '6px',
                borderBottom: '1px solid #EEE',
                textAlign: 'left',
              },
              '& thead th, & tfoot th': {
                background: '#F7F3FA',
                color: CODEAI.purplePrimary,
              },
              '& .num': {
                textAlign: 'right',
                fontWeight: 700,
                whiteSpace: 'nowrap',
              },
            }}
          >
            <thead>
              <tr>
                <th scope="col">Component</th>
                <th scope="col" className="num">
                  Score
                </th>
              </tr>
            </thead>
            <tbody>
              {BREAKDOWN.map(c => (
                <tr key={c.key}>
                  <Box component="th" scope="row" sx={{fontWeight: 400}}>
                    <strong>{c.label}</strong>
                    <Box sx={{fontSize: '10px', color: '#666'}}>{c.note}</Box>
                  </Box>
                  <td className="num">
                    {formatScore(score[c.key])} / {c.max}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <th scope="row">Total</th>
                <Box component="th" className="num" sx={{fontSize: '15px'}}>
                  {scoreText}
                </Box>
              </tr>
            </tfoot>
          </Box>
          {score.change != null && score.change !== 0 && (
            <Text size={12} sx={{mt: '8px'}}>
              Year-over-year change:{' '}
              <DeltaTag value={score.change} suffix=" pts" />
              {year ? ` versus the ${Number(year) - 1} snapshot.` : ''}
            </Text>
          )}
        </PrintCard>
        <PrintCard title="Policy Intent & Recommendation">
          <Box sx={{display: 'flex', flexDirection: 'column', gap: '8px'}}>
            {(
              [
                ['Intent', narratives.aiPolicyIntent],
                ['Recommendation', narratives.aiPolicyRecommendation],
                ['Access context', narratives.accessNarrative],
                ['Participation context', narratives.participationNarrative],
              ] as const
            ).map(([lead, text]) =>
              text ? (
                <Text key={lead} size={11.5} sx={{lineHeight: 1.5}}>
                  <strong>{lead}:</strong> {text}
                </Text>
              ) : null,
            )}
          </Box>
        </PrintCard>
        <PrintCard title="A Call to Action">
          <Text size={12}>
            Advocates, educators, and policymakers in {name} can use this
            profile to identify the next high-leverage policy move. Join the
            Code.org advocacy coalition at code.org/advocacy to receive alerts
            and state-level toolkits.
          </Text>
        </PrintCard>
      </PrintPage>

      {/* 6 · National overview */}
      <PrintPage label="Page 6 · National Overview" footer={stateFooter}>
        <Box
          sx={{
            background: TIER_GRADIENTS[tier],
            color: TIER_GRADIENT_TEXT[tier],
            borderRadius: '12px',
            px: '30px',
            py: '24px',
          }}
        >
          <Text
            size={11}
            sx={{letterSpacing: '.12em', textTransform: 'uppercase', mb: '6px'}}
          >
            {year ? `${year} ` : ''}Annual Report · {name} Edition
          </Text>
          <PrintHeading
            level="h2"
            sx={{fontSize: '30px', letterSpacing: '.02em', mb: '8px'}}
          >
            THE STATE OF DIGITAL FLUENCY
          </PrintHeading>
          <Text size={14}>
            A snapshot of how every U.S. jurisdiction is building the policy,
            access, and participation foundations that make Digital Sciences
            education foundational for all students.
          </Text>
        </Box>
        <PrintCard title="AI Policy Landscape">
          <Text size={13}>
            Of the ten foundational Digital Sciences policies tracked this year,
            here is how many jurisdictions have reached meaningful adoption,
            defined as the <em>Developing</em> tier or higher.
          </Text>
          <Box
            component="ul"
            sx={{
              listStyle: 'none',
              p: 0,
              m: 0,
              mt: '12px',
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '16px',
            }}
          >
            {LANDSCAPE.map(([key, text]) => (
              <Box
                component="li"
                key={key}
                sx={{
                  background: '#F7F3FA',
                  border: `1px solid ${CODEAI.purpleLight}`,
                  borderRadius: '10px',
                  px: '20px',
                  py: '16px',
                }}
              >
                <Box
                  sx={{
                    ...displayFont,
                    fontSize: '28px',
                    fontWeight: 800,
                    lineHeight: 1,
                    color: CODEAI.purplePrimary,
                  }}
                >
                  {counts[key] == null
                    ? NOT_REPORTED
                    : `${counts[key]} of ${stateCount}`}
                </Box>
                <Text size={13} sx={{color: '#333', mt: '6px'}}>
                  {text}
                </Text>
              </Box>
            ))}
          </Box>
          <Text size={13} sx={{mt: '16px'}}>
            National Digital Fluency Index Score average:{' '}
            <strong>
              {national.averageScore == null
                ? NOT_REPORTED
                : `${national.averageScore.toFixed(1)} / 100`}
            </strong>
            . {name}&apos;s individual score of <strong>{scoreText}</strong>{' '}
            appears on Page 1 with a full component breakdown on Page 5.
          </Text>
        </PrintCard>
      </PrintPage>

      {/* 7 · National trends */}
      <PrintPage
        label="Page 7 · National Trends & Highlights"
        footer={footerText(year, 'code.org/advocacy')}
      >
        <PrintCard title="Trends in AI and CS Education">
          <Text size={12} sx={{fontWeight: 700, textAlign: 'center'}}>
            National High School CS Access (avg % of schools offering)
          </Text>
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
          <Text size={12} sx={{textAlign: 'center', mt: '6px'}}>
            National avg HS participation in Digital Sciences:{' '}
            <strong>
              {national.participation == null
                ? NOT_REPORTED
                : fmtPct(
                    national.participation,
                    digitsOf(national.participation),
                  )}
            </strong>
          </Text>
        </PrintCard>
        <Box
          sx={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px'}}
        >
          <PrintCard title="Participation by Gender">
            <Pie
              title="National high school Digital Sciences enrollment by gender"
              emptyLabel={NOT_REPORTED}
              size="print"
              slices={[
                {
                  key: 'female',
                  label: 'Young Women',
                  value: nationalGender.female,
                  color: GENDER_COLORS.female,
                },
                {
                  key: 'male',
                  label: 'Young Men',
                  value: nationalGender.male,
                  color: GENDER_COLORS.male,
                },
              ]}
            />
            {nationalGender.female != null && (
              <Text
                size={11}
                sx={{color: '#555', textAlign: 'center', mt: '8px'}}
              >
                Young women represent {Math.round(nationalGender.female)}% of
                national CS enrollment
              </Text>
            )}
          </PrintCard>
          <PrintCard title="Why This Matters">
            <Text size={12} sx={{mb: '8px'}}>
              States that anchor Digital Sciences in statute move the fastest.
              The ten policies tracked in this report form a shared vocabulary
              for policymakers, practitioners, and advocates working across very
              different state contexts.
            </Text>
            <Text size={12}>
              Numbers on every page are recomputed from {stateCount}{' '}
              jurisdiction records. When a state updates, these figures update
              automatically.
            </Text>
          </PrintCard>
        </Box>
        <PrintCard title="Digital Sciences Highlights">
          <Box
            component="ul"
            sx={{
              listStyle: 'none',
              p: 0,
              m: 0,
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: '12px',
            }}
          >
            {HIGHLIGHTS.map(h => (
              <Box
                component="li"
                key={h.state}
                sx={{
                  background: PURPLE_BG,
                  border: `1px solid ${CODEAI.purpleLight}`,
                  borderRadius: '10px',
                  p: '12px',
                }}
              >
                <PrintHeading
                  level="h3"
                  sx={{
                    color: CODEAI.purplePrimary,
                    fontSize: '14px',
                    fontWeight: 800,
                    mb: '4px',
                  }}
                >
                  {h.state}
                </PrintHeading>
                <Box
                  sx={{
                    display: 'inline-block',
                    fontSize: '9px',
                    textTransform: 'uppercase',
                    letterSpacing: '.04em',
                    background: '#fff',
                    color: CODEAI.purplePrimary,
                    px: '7px',
                    py: '2px',
                    borderRadius: '8px',
                    mb: '6px',
                  }}
                >
                  {h.tag}
                </Box>
                <Text
                  size={12}
                  sx={{fontWeight: 700, mb: '4px', color: '#222'}}
                >
                  {h.headline}
                </Text>
                <Text size={10.5} sx={{color: '#444', lineHeight: 1.4}}>
                  {h.body}
                </Text>
              </Box>
            ))}
          </Box>
        </PrintCard>
      </PrintPage>

      {/* 8 · National rankings */}
      <PrintPage label="Page 8 · National Rankings" footer={footerText(year)}>
        <HeaderBand
          aside={
            <>
              Your state: <strong>{postal}</strong>
            </>
          }
        >
          <PrintHeading level="h2" sx={{fontSize: '24px'}}>
            STATE RANKINGS
          </PrintHeading>
        </HeaderBand>
        <Box
          sx={{display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '12px'}}
        >
          <PrintCard title="Digital Fluency Index Score">
            <Text size={9} sx={{textAlign: 'center', mb: '8px'}}>
              {SCORE_FORMULA}
            </Text>
            <CompactRankList
              label="States ranked by Digital Fluency Index Score"
              rows={rankings.score}
              postal={postal}
              fill={COMPACT_BAR_FILLS.score}
              format={v => v.toFixed(1)}
              rowHeight={15}
            />
          </PrintCard>
          <PrintCard title="Access & Participation">
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '16px',
              }}
            >
              {(
                [
                  ['High School Access', rankings.access, 'access', 0],
                  [
                    'High School Participation',
                    rankings.participation,
                    'participation',
                    1,
                  ],
                ] as const
              ).map(([heading, rows, fill, digits]) => (
                <Box key={heading}>
                  <PrintHeading
                    level="h3"
                    sx={{
                      fontSize: '13px',
                      textAlign: 'center',
                      color: INK,
                      mb: '8px',
                    }}
                  >
                    {heading}
                  </PrintHeading>
                  <CompactRankList
                    label={`States ranked by ${heading}`}
                    rows={rows}
                    postal={postal}
                    fill={COMPACT_BAR_FILLS[fill]}
                    format={v => fmtPct(v, digits)}
                    rowHeight={15}
                  />
                </Box>
              ))}
            </Box>
          </PrintCard>
        </Box>
      </PrintPage>
    </PrintLayout>
  );
}
