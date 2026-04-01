import {
  StateGapMapDataset,
  StateGapMapMode,
  StateGapMapRecord,
  StateGapMapTier,
} from './types';

export function computeGapPercent(
  record: Pick<StateGapMapRecord, 'accessPercent' | 'participationPercent'>,
) {
  return Number(
    (record.accessPercent - record.participationPercent).toFixed(1),
  );
}

export function formatPercent(value: number) {
  return `${value.toFixed(1)}%`;
}

export function getTier(
  dataset: StateGapMapDataset,
  tierId: StateGapMapRecord['tier'],
): StateGapMapTier | undefined {
  return dataset.tiers.find(tier => tier.id === tierId);
}

export function getStateRecord(
  dataset: StateGapMapDataset,
  code?: string | null,
) {
  if (!code) return undefined;

  return dataset.states.find(state => state.code === code);
}

export function hasValidUrl(url?: string) {
  if (!url) return false;

  try {
    const parsed = new URL(url);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
}

export function isRecordComplete(state?: StateGapMapRecord) {
  if (!state) {
    return false;
  }

  return (
    Number.isFinite(state.accessPercent) &&
    Number.isFinite(state.participationPercent) &&
    state.accessPercent > 0 &&
    state.participationPercent > 0
  );
}

export function getPanelMode(
  lockedCode: string | null,
  hoveredCode: string | null,
): StateGapMapMode {
  if (lockedCode) return 'locked';
  if (hoveredCode) return 'preview';
  return 'default';
}

export function getStateAriaLabel(
  dataset: StateGapMapDataset,
  state: StateGapMapRecord,
) {
  if (!isRecordComplete(state)) {
    return `${state.name}, data unavailable`;
  }

  const tier = getTier(dataset, state.tier);
  return `${state.name}, ${tier?.label ?? state.tier}, access ${formatPercent(
    state.accessPercent,
  )}, participation ${formatPercent(state.participationPercent)}, gap ${formatPercent(
    computeGapPercent(state),
  )}`;
}
