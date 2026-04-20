import {StateGapMapRecord} from './types';

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
    state.dataStatus !== 'unavailable' &&
    Number.isFinite(state.accessPercent) &&
    Number.isFinite(state.participationPercent) &&
    state.accessPercent >= 0 &&
    state.participationPercent >= 0
  );
}
