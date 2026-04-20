export type StateGapMapTierId = 'lagging' | 'progressing' | 'leading';
export type StateGapMapDataStatus = 'complete' | 'unavailable';

export type StateGapMapDisplayRegion =
  | 'contiguous'
  | 'alaskaInset'
  | 'hawaiiInset';

export interface StateGapMapTier {
  /** Stable tier identifier used for styling and analytics. */
  id: StateGapMapTierId;
  /** Reader-facing label shown in the legend and panel chip. */
  label: string;
  /** Optional supporting copy for future CMS-driven explanatory UI. */
  description?: string;
}

export interface StateGapMapRecord {
  /** Stable record identifier for external data sources and CMS mapping. */
  id: string;
  /** Two-letter geography code used by the map package and geometry helpers. */
  code: string;
  /** Reader-facing geography name. */
  name: string;
  /** Policy tier used for categorical fill styling. */
  tier: StateGapMapTierId;
  /** Percentage of schools offering the tracked program. */
  accessPercent: number;
  /** Percentage of students participating in the tracked program. */
  participationPercent: number;
  /** Marks records whose metrics should render as unavailable rather than as a tier. */
  dataStatus?: StateGapMapDataStatus;
  /** State-specific report download URL shown in the locked panel. */
  reportUrl?: string;
  /** State-specific presentation deck URL shown in the locked panel. */
  presentationUrl?: string;
  /** Whether the state should be interactive in the rendered geography. */
  isSelectable: boolean;
  /** Display region allows inset handling without coupling UI to map internals. */
  displayRegion: StateGapMapDisplayRegion;
}

export interface StateGapMapDataset {
  /** Tier metadata drives the legend and tier labels independently of records. */
  tiers: StateGapMapTier[];
  /** One entry per state or district rendered in the experience. */
  states: StateGapMapRecord[];
}

export type StateGapMapMode = 'default' | 'preview' | 'locked';
