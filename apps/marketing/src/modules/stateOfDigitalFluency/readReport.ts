// Turns the raw report into page view models. Tolerant: any missing or
// malformed leaf becomes null ("Not reported"); nothing is re-scored.

import {
  NOT_REPORTED,
  POLICY_GROUPS,
  POLICY_LABELS,
  NOT_SCORED_COLOR,
  TIER_COLORS,
} from './constants';
import type {
  Band,
  PolicyKey,
  RawReportData,
  RawStateRecord,
  Report,
  Tier,
  TierLabel,
} from './types';

const TIERS: Tier[] = [
  'no',
  'in_progress',
  'historic',
  'emerging',
  'developing',
  'transformative',
];
const TIER_LABEL_VALUES: TierLabel[] = [
  'Transformative',
  'Developing',
  'Emerging',
];
const BAND_VALUES: Band[] = ['81-100', '51-80', '0-50'];

// ── Primitive readers ────────────────────────────────────────────────────────

export const num = (v: unknown): number | null =>
  typeof v === 'number' && Number.isFinite(v) ? v : null;

export const text = (v: unknown): string | null =>
  typeof v === 'string' && v.trim() !== '' ? v : null;

const oneOf = <T extends string>(values: readonly T[], v: unknown): T | null =>
  values.includes(v as T) ? (v as T) : null;

const obj = (v: unknown): Record<string, unknown> =>
  v && typeof v === 'object' && !Array.isArray(v)
    ? (v as Record<string, unknown>)
    : {};

// ── Formatting ───────────────────────────────────────────────────────────────

/** `2025_26` → `2025–26`. */
export const formatYear = (year: string) => {
  const [start, end] = year.split('_');
  return end ? `${start}–${end}` : year;
};

export const formatPercent = (v: number | null, digits = 1) =>
  v == null ? NOT_REPORTED : `${v.toFixed(digits)}%`;

export const formatScore = (v: number | null) =>
  v == null ? NOT_REPORTED : v.toFixed(1);

export const formatRank = (v: number | null) =>
  v == null ? NOT_REPORTED : `#${v}`;

/** Signed change, e.g. `+2.1`; null when there is none to show. */
export const formatChange = (v: number | null, suffix = '') =>
  v == null || v === 0 ? null : `${v > 0 ? '+' : ''}${v.toFixed(1)}${suffix}`;

// ── Shared pieces ────────────────────────────────────────────────────────────

export interface StateSummary {
  postal: string;
  name: string;
  slug: string;
  total: number | null;
  tierLabel: TierLabel | null;
  band: Band | null;
  ranks: {
    score: number | null;
    access: number | null;
    participation: number | null;
  };
  access: number | null;
  participation: number | null;
}

function readSummary(state: RawStateRecord): StateSummary {
  const score = obj(state.score);
  const ranks = obj(state.ranks);
  return {
    postal: state.postal,
    name: state.name,
    slug: text(state.slug) ?? state.postal.toLowerCase(),
    total: num(score.total),
    tierLabel: oneOf(TIER_LABEL_VALUES, score.tierLabel),
    band: oneOf(BAND_VALUES, score.band),
    ranks: {
      score: num(ranks.score),
      access: num(ranks.access),
      participation: num(ranks.participation),
    },
    access: num(obj(state.access).latest),
    participation: num(obj(state.participation).totalPct),
  };
}

/** Ranked first (by stored rank), then unranked in sheet order. */
function orderByRank(states: StateSummary[], key: keyof StateSummary['ranks']) {
  const ranked = states
    .filter(s => s.ranks[key] != null)
    .sort((a, b) => a.ranks[key]! - b.ranks[key]!);
  const unranked = states.filter(s => s.ranks[key] == null);
  return [...ranked, ...unranked];
}

export const tierColor = (tierLabel: TierLabel | null) =>
  tierLabel ? TIER_COLORS[tierLabel] : NOT_SCORED_COLOR;

function readTrends(data: RawReportData) {
  const trends = obj(obj(data.meta).trendsAvailable);
  return {
    access: trends.access === true,
    participation: trends.participation === true,
    score: trends.score === true,
  };
}

function readNational(data: RawReportData) {
  const national = obj(data.national);
  const value = (key: string) => num(obj(national[key]).value);
  const gender = obj(national.gender);
  const bandCounts = obj(national.bandCounts);
  const access = obj(national.access);
  const series = Array.isArray(access.series) ? access.series : [];
  return {
    averageScore: value('averageScore'),
    access: value('access'),
    participation: value('participation'),
    gender: {
      female: num(obj(gender.female).value),
      male: num(obj(gender.male).value),
    },
    bandCounts: {
      '81-100': num(bandCounts['81-100']),
      '51-80': num(bandCounts['51-80']),
      '0-50': num(bandCounts['0-50']),
    },
    accessByYear: Object.fromEntries(
      series
        .map(obj)
        .filter(p => typeof p.year === 'string')
        .map(p => [p.year as string, num(p.value)]),
    ) as Record<string, number | null>,
    policyCounts: obj(national.policyCounts),
  };
}

// ── Overview ─────────────────────────────────────────────────────────────────

export interface OverviewModel {
  dataAsOf: string | null;
  yearLabel: string | null;
  stats: {
    averageScore: number | null;
    bandCounts: Record<Band, number | null>;
    access: number | null;
    participation: number | null;
  };
  regions: (StateSummary & {
    gender: {female: number | null; male: number | null} | null;
  })[];
  nationalGender: {female: number | null; male: number | null};
  rankings: RankingsModel;
  national: NationalModel;
  stateCount: number;
}

export function toOverviewModel(report: Report): OverviewModel {
  const national = readNational(report.data);
  return {
    dataAsOf: report.dataAsOf,
    yearLabel: text(obj(report.data.meta).participationYearLabel),
    stats: {
      averageScore: national.averageScore,
      bandCounts: national.bandCounts,
      access: national.access,
      participation: national.participation,
    },
    regions: report.data.states.map(state => {
      const gender = obj(state.participation).gender;
      return {
        ...readSummary(state),
        gender: gender
          ? {
              female: num(obj(gender).female),
              male: num(obj(gender).male),
            }
          : null,
      };
    }),
    nationalGender: national.gender,
    rankings: toRankingsModel(report),
    national: toNationalModel(report),
    stateCount: report.data.states.length,
  };
}

// ── Rankings ─────────────────────────────────────────────────────────────────

export interface RankRow {
  postal: string;
  name: string;
  slug: string;
  rank: number | null;
  value: number | null;
  tierLabel: TierLabel | null;
}

interface Neighbour {
  slug: string;
  postal: string;
  name: string;
  rank: number | null;
}

export interface RankingsModel {
  dataAsOf: string | null;
  score: RankRow[];
  access: RankRow[];
  participation: RankRow[];
}

const toRows = (
  states: StateSummary[],
  key: keyof StateSummary['ranks'],
  value: (s: StateSummary) => number | null,
): RankRow[] =>
  orderByRank(states, key).map(s => ({
    postal: s.postal,
    name: s.name,
    slug: s.slug,
    rank: s.ranks[key],
    value: value(s),
    tierLabel: s.tierLabel,
  }));

export function toRankingsModel(report: Report): RankingsModel {
  const states = report.data.states.map(readSummary);
  return {
    dataAsOf: report.dataAsOf,
    score: toRows(states, 'score', s => s.total),
    access: toRows(states, 'access', s => s.access),
    participation: toRows(states, 'participation', s => s.participation),
  };
}

// ── State ────────────────────────────────────────────────────────────────────

export interface PolicyItem {
  key: PolicyKey;
  label: string;
  tier: Tier | null;
}

export interface StateModel {
  dataAsOf: string | null;
  lastUpdated: string | null;
  postal: string;
  name: string;
  slug: string;
  score: {
    total: number | null;
    tierLabel: TierLabel | null;
    band: Band | null;
    policy: number | null;
    access: number | null;
    participation: number | null;
    momentum: number | null;
    leadership: number | null;
    change: number | null;
  };
  policyGroups: {label: string; items: PolicyItem[]}[];
  narratives: {
    aiPolicyIntent: string | null;
    aiPolicyRecommendation: string | null;
    accessNarrative: string | null;
    participationNarrative: string | null;
  };
  access: {
    series: {year: string; label: string; value: number | null}[];
    nationalByYear: Record<string, number | null>;
    change: number | null;
  };
  participation: {
    totalPct: number | null;
    yearLabel: string | null;
    change: number | null;
    gender: {
      female: number | null;
      male: number | null;
      other: number | null;
    } | null;
    national: number | null;
    nationalGender: {female: number | null; male: number | null};
  };
  seniorCohort: {
    totalPct: number;
    femalePct: number | null;
    yearLabel: string | null;
  } | null;
  rankings: {
    ranks: StateSummary['ranks'];
    national: {
      score: number | null;
      access: number | null;
      participation: number | null;
    };
    score: RankRow[];
    access: RankRow[];
    participation: RankRow[];
  };
  prev: Neighbour | null;
  next: Neighbour | null;
}

/** The view model for one state's page, or null if the report doesn't list it. */
export function toStateModel(
  report: Report,
  postal: string,
): StateModel | null {
  const data = report.data;
  const state = data.states.find(
    s => s.postal.toUpperCase() === postal.toUpperCase(),
  );
  if (!state) {
    return null;
  }

  const trends = readTrends(data);
  const national = readNational(data);
  const meta = obj(data.meta);
  const summary = readSummary(state);
  const score = obj(state.score);
  const policies = obj(state.policies);
  const narratives = obj(state.narratives);
  const access = obj(state.access);
  const participation = obj(state.participation);
  const gender = participation.gender ? obj(participation.gender) : null;
  const cohort = obj(state.seniorCohort);
  const cohortTotal = num(cohort.totalPct);

  const rankings = toRankingsModel(report);
  const byScore = rankings.score;
  const index = byScore.findIndex(r => r.postal === state.postal);
  const neighbour = (row: RankRow | undefined) =>
    row
      ? {slug: row.slug, postal: row.postal, name: row.name, rank: row.rank}
      : null;

  return {
    dataAsOf: report.dataAsOf,
    lastUpdated: text(state.lastUpdated),
    postal: state.postal,
    name: state.name,
    slug: summary.slug,
    score: {
      total: summary.total,
      tierLabel: summary.tierLabel,
      band: summary.band,
      policy: num(score.policy),
      access: num(score.access),
      participation: num(score.participation),
      momentum: num(score.momentum),
      leadership: num(score.leadership),
      change: trends.score ? num(score.change) : null,
    },
    policyGroups: POLICY_GROUPS.map(group => ({
      label: group.label,
      items: group.keys.map(key => ({
        key,
        label: POLICY_LABELS[key],
        tier: oneOf(TIERS, policies[key]),
      })),
    })),
    narratives: {
      aiPolicyIntent: text(narratives.aiPolicyIntent),
      aiPolicyRecommendation: text(narratives.aiPolicyRecommendation),
      accessNarrative: text(narratives.accessNarrative),
      participationNarrative: text(narratives.participationNarrative),
    },
    access: {
      series: (Array.isArray(access.series) ? access.series : [])
        .map(obj)
        .filter(p => typeof p.year === 'string')
        .map(p => ({
          year: p.year as string,
          label: formatYear(p.year as string),
          value: num(p.value),
        })),
      nationalByYear: national.accessByYear,
      change: trends.access ? num(access.change) : null,
    },
    participation: {
      totalPct: summary.participation,
      yearLabel: text(meta.participationYearLabel),
      change: trends.participation ? num(participation.change) : null,
      gender: gender
        ? {
            female: num(gender.female),
            male: num(gender.male),
            other: num(gender.other),
          }
        : null,
      national: national.participation,
      nationalGender: national.gender,
    },
    seniorCohort:
      cohortTotal == null
        ? null
        : {
            totalPct: cohortTotal,
            femalePct: num(cohort.femalePct),
            yearLabel: text(meta.cohortYearLabel),
          },
    rankings: {
      ranks: summary.ranks,
      national: {
        score: national.averageScore,
        access: national.access,
        participation: national.participation,
      },
      score: rankings.score,
      access: rankings.access,
      participation: rankings.participation,
    },
    prev: neighbour(byScore[index - 1]),
    next: neighbour(byScore[index + 1]),
  };
}

/** National figures the printable report adds to the state model. */
export type NationalModel = ReturnType<typeof toNationalModel>;

/** National figures beyond the headline stats: series, policy counts. */
export function toNationalModel(report: Report) {
  const national = readNational(report.data);
  return {
    averageScore: national.averageScore,
    bandCounts: national.bandCounts,
    access: national.access,
    accessSeries: Object.entries(national.accessByYear).map(
      ([year, value]) => ({year, label: formatYear(year), value}),
    ),
    participation: national.participation,
    gender: national.gender,
    policyCounts: Object.fromEntries(
      Object.entries(national.policyCounts).map(([k, v]) => [k, num(v)]),
    ) as Partial<Record<PolicyKey, number | null>>,
    yearLabel: text(obj(report.data.meta).participationYearLabel),
  };
}
