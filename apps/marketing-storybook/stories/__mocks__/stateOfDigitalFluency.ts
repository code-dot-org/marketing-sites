// Story data for the State of Digital Fluency data-display components. Built
// from the synthetic test fixture only; every value is made up.

import type {RankedBarItem} from '@/components/dataDisplay/chart/RankedBars';
import type {YearBarPoint} from '@/components/dataDisplay/chart/YearBars';
import type {MapRegion} from '@/components/dataDisplay/map/UsMap';
import type {MapTooltip} from '@/components/dataDisplay/map/UsMapInteractive';
import type {ScaleGroup} from '@/components/dataDisplay/scale/Scale';
import fixture from '@/modules/stateOfDigitalFluency/__tests__/fixtures/reportData.json';
import {
  BAND_FILLS,
  BANDS,
  GENDER_COLORS,
  NOT_REPORTED,
  TIER_LABELS,
  TIER_BADGES,
  TIER_SEGMENTS,
} from '@/modules/stateOfDigitalFluency/constants';
import {statePath} from '@/modules/stateOfDigitalFluency/paths';
import {
  formatScore,
  tierColor,
  toOverviewModel,
  toRankingsModel,
  toStateModel,
  type StateModel,
} from '@/modules/stateOfDigitalFluency/readReport';
import type {
  RawReportData,
  Report,
} from '@/modules/stateOfDigitalFluency/types';

export {NOT_REPORTED};

export const sodfReport: Report = {
  data: fixture.data as unknown as RawReportData,
  dataAsOf: fixture.dataAsOf,
  warnings: fixture.warnings.items,
};

const stateModel = (postal: string) => {
  const model = toStateModel(sodfReport, postal);
  if (!model) {
    throw new Error(`Fixture has no state ${postal}`);
  }
  return model;
};

/** Fully scored, every policy reported, has an "other" gender share. */
export const minnesota = stateModel('MN');
/** One policy (preservice) not reported; unscored. */
export const wyoming = stateModel('WY');
/** Latest access year not reported. */
export const georgia = stateModel('GA');
/** Gender "other" not reported. */
export const alabama = stateModel('AL');

export const rankings = toRankingsModel(sodfReport);
export const overview = toOverviewModel(sodfReport);

/** All 51 jurisdictions by stored score rank, unranked last. */
export const rankedScoreItems: RankedBarItem[] = rankings.score.map(r => ({
  key: r.postal,
  label: r.postal,
  value: r.value,
  color: tierColor(r.tierLabel),
}));

export const nationalAverageScore = overview.stats.averageScore;

export const accessPoints = (model: StateModel): YearBarPoint[] =>
  model.access.series.map(p => ({
    key: p.year,
    label: p.label,
    value: p.value,
    reference: model.access.nationalByYear[p.year] ?? null,
  }));

export const genderSlices = (model: StateModel, includeOther: boolean) => {
  const gender = model.participation.gender;
  return [
    {
      key: 'female',
      label: 'Young Women',
      value: gender?.female ?? null,
      color: GENDER_COLORS.female,
    },
    {
      key: 'male',
      label: 'Young Men',
      value: gender?.male ?? null,
      color: GENDER_COLORS.male,
    },
    ...(includeOther
      ? [
          {
            key: 'other',
            label: 'Other',
            value: gender?.other ?? null,
            color: GENDER_COLORS.other,
          },
        ]
      : []),
  ];
};

export const policyScaleGroups = (model: StateModel): ScaleGroup[] =>
  model.policyGroups.map(group => ({
    label: group.label,
    items: group.items.map(item => ({
      key: item.key,
      label: item.label,
      segments: item.tier
        ? TIER_SEGMENTS[item.tier]
        : [null, null, null, null, null],
      levelLabel: item.tier ? TIER_LABELS[item.tier] : null,
      badge: item.tier ? TIER_BADGES[item.tier] : 'black',
    })),
  }));

const bandLabel = (band: string | null) =>
  BANDS.find(b => b.band === band)?.label ?? NOT_REPORTED;

export const mapRegions: MapRegion[] = overview.regions.map(r => ({
  code: r.postal,
  name: r.name,
  label: `${r.name}, score ${formatScore(r.total)}, ${bandLabel(r.band)}`,
  fill: r.band ? BAND_FILLS[r.band] : null,
  href: statePath(r.slug, 'en-US'),
  cells: {
    name: r.name,
    score: formatScore(r.total),
    band: bandLabel(r.band),
  },
}));

export const mapLegend = [
  ...BANDS.map(b => ({label: b.label, fill: b.fill})),
  {label: NOT_REPORTED, fill: null},
];

export const mapTooltips: Record<string, MapTooltip> = Object.fromEntries(
  overview.regions.map(r => [
    r.postal,
    {title: r.name, detail: `Score ${formatScore(r.total)}`},
  ]),
);
