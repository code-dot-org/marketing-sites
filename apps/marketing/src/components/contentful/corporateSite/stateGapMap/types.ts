export type StateGapMapTierId = 'lagging' | 'progressing' | 'leading';

export type StateGapMapDisplayRegion =
  | 'contiguous'
  | 'alaskaInset'
  | 'hawaiiInset';

export interface StateGapMapTier {
  id: StateGapMapTierId;
  label: string;
  description?: string;
}

export interface StateGapMapRecord {
  id: string;
  code: string;
  name: string;
  tier: StateGapMapTierId;
  accessPercent: number;
  participationPercent: number;
  reportUrl?: string;
  presentationUrl?: string;
  isSelectable: boolean;
  displayRegion: StateGapMapDisplayRegion;
}

export interface StateGapMapDataset {
  tiers: StateGapMapTier[];
  states: StateGapMapRecord[];
}

export interface StateGapMapGeometry {
  code: string;
  displayRegion: StateGapMapDisplayRegion;
}

export type StateGapMapMode = 'default' | 'preview' | 'locked';
