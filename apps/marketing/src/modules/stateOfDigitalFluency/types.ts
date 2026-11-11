// The `reportData.data` payload written by the spec 013 pipeline. Mirrors
// specs/014-state-digital-fluency/data-model.md. `null` means not reported.

export type PolicyKey =
  | 'plan_guidance'
  | 'standards'
  | 'sea_position'
  | 'data_reporting'
  | 'diploma_req'
  | 'counts_grad'
  | 'require_offer'
  | 'pd_funding'
  | 'credentialing'
  | 'preservice';

export type Tier =
  | 'no'
  | 'in_progress'
  | 'historic'
  | 'emerging'
  | 'developing'
  | 'transformative';

export type TierLabel = 'Transformative' | 'Developing' | 'Emerging';
export type Band = '81-100' | '51-80' | '0-50';
/** A school year header such as `2025_26`. */
export type YearKey = string;

export interface YearValue {
  year: YearKey;
  value: number | null;
}

export interface Figure {
  value: number | null;
  source: 'sheet' | 'mean';
  statesCovered: number;
}

export interface StateRecord {
  postal: string;
  slug: string;
  name: string;
  lastUpdated: string;
  policies: Record<PolicyKey, Tier | null>;
  access: {
    series: YearValue[];
    latest: number | null;
    latestYear: YearKey | null;
    change: number | null;
  };
  participation: {
    totalPct: number | null;
    change: number | null;
    gender: {
      male: number | null;
      female: number | null;
      other: number | null;
    } | null;
  };
  seniorCohort: {totalPct: number | null; femalePct: number | null};
  leadership: {
    taskforce: boolean | null;
    csedweek: 'full' | 'partial' | 'no' | null;
  };
  narratives: {
    aiPolicyIntent: string | null;
    aiPolicyRecommendation: string | null;
    accessNarrative: string | null;
    participationNarrative: string | null;
  };
  momentum: Record<PolicyKey, {lastRiseYear: YearKey | null; points: number}>;
  score: {
    policy: number | null;
    access: number | null;
    participation: number | null;
    momentum: number;
    leadership: number | null;
    total: number | null;
    complete: boolean;
    tierLabel: TierLabel | null;
    band: Band | null;
    change: number | null;
  };
  ranks: {
    score: number | null;
    access: number | null;
    participation: number | null;
  };
}

export interface ReportData {
  meta: {
    builtAt: string;
    currentYear: YearKey;
    years: YearKey[];
    participationYearLabel: string;
    cohortYearLabel: string;
    blankIndexRule: 'hold-back' | 'rescale';
    trendsAvailable: {
      access: boolean;
      participation: boolean;
      score: boolean;
      tierHistory: boolean;
    };
  };
  national: {
    averageScore: Figure;
    bandCounts: Record<Band | 'notScored', number>;
    access: Figure & {series: YearValue[]};
    participation: Figure;
    gender: {female: Figure; male: Figure};
    policyCounts: Record<PolicyKey, number>;
  };
  states: StateRecord[];
}

/** A pipeline warning. Spec 013 sets the final shape, so strings are accepted too. */
export type ReportWarning =
  | string
  | {
      severity?: string;
      row?: number | null;
      column?: string | null;
      postal?: string | null;
      code?: string;
      message?: string;
    };

export type DeepPartial<T> = T extends (infer U)[]
  ? DeepPartial<U>[]
  : T extends object
    ? {[K in keyof T]?: DeepPartial<T[K]> | null}
    : T;

export type RawStateRecord = DeepPartial<StateRecord> & {
  postal: string;
  name: string;
};

/** Report data after the shape check: containers are known, leaves are not. */
export interface RawReportData {
  meta: DeepPartial<ReportData['meta']>;
  national: DeepPartial<ReportData['national']>;
  states: RawStateRecord[];
}

/** What `getReport()` returns: the entry's fields the pages use. */
export interface Report {
  data: RawReportData;
  dataAsOf: string | null;
  warnings: ReportWarning[];
}
