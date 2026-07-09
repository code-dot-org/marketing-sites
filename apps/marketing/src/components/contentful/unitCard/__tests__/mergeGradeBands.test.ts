import {
  gradeRangesOverlap,
  mergeGradeBands,
  parseGradeSpan,
} from '@/components/contentful/unitCard/mergeGradeBands';

describe('mergeGradeBands', () => {
  it('returns undefined for undefined, empty, or blank input', () => {
    expect(mergeGradeBands(undefined)).toBeUndefined();
    expect(mergeGradeBands([])).toBeUndefined();
    expect(mergeGradeBands(['  ', ''])).toBeUndefined();
  });

  it('merges adjacent bands into one span', () => {
    expect(mergeGradeBands(['K-5', '6-8'])).toBe('K-8');
  });

  it('merges regardless of input order', () => {
    expect(mergeGradeBands(['6-8', 'K-5'])).toBe('K-8');
    expect(mergeGradeBands(['9-12', 'K-5', '6-8'])).toBe('K-12');
  });

  it('passes a single band through', () => {
    expect(mergeGradeBands(['K-5'])).toBe('K-5');
    expect(mergeGradeBands(['6-8'])).toBe('6-8');
  });

  it('collapses equal endpoints to a single grade', () => {
    expect(mergeGradeBands(['3'])).toBe('3');
    expect(mergeGradeBands(['K'])).toBe('K');
    expect(mergeGradeBands(['3-3'])).toBe('3');
  });

  it('normalizes reversed ranges', () => {
    expect(mergeGradeBands(['5-K'])).toBe('K-5');
  });

  it('accepts en-dashes, lowercase k, and whitespace padding', () => {
    expect(mergeGradeBands(['K–5'])).toBe('K-5');
    expect(mergeGradeBands(['k-5'])).toBe('K-5');
    expect(mergeGradeBands([' K - 5 ', '6-8'])).toBe('K-8');
  });

  it('merges numeric age-style ranges numerically', () => {
    expect(mergeGradeBands(['8-10', '11-13'])).toBe('8-13');
  });

  it('falls back to a joined list when any value does not parse', () => {
    expect(mergeGradeBands(['Ages 8-10'])).toBe('Ages 8-10');
    expect(mergeGradeBands(['K-5', 'All grades'])).toBe('K-5, All grades');
  });
});

describe('parseGradeSpan', () => {
  it('parses single grades', () => {
    expect(parseGradeSpan('K')).toEqual([0, 0]);
    expect(parseGradeSpan('5')).toEqual([5, 5]);
  });

  it('parses ranges with K as 0', () => {
    expect(parseGradeSpan('K-5')).toEqual([0, 5]);
    expect(parseGradeSpan('9-12')).toEqual([9, 12]);
  });

  it('normalizes reversed ranges', () => {
    expect(parseGradeSpan('5-K')).toEqual([0, 5]);
  });

  it('accepts en-dashes, lowercase k, and whitespace', () => {
    expect(parseGradeSpan('K–5')).toEqual([0, 5]);
    expect(parseGradeSpan('k-5')).toEqual([0, 5]);
    expect(parseGradeSpan(' 9 - 10 ')).toEqual([9, 10]);
  });

  it('returns undefined for unparseable values', () => {
    expect(parseGradeSpan('Ages 8-10')).toBeUndefined();
    expect(parseGradeSpan('All grades')).toBeUndefined();
    expect(parseGradeSpan('')).toBeUndefined();
  });
});

describe('gradeRangesOverlap', () => {
  it('detects overlap and disjoint ranges', () => {
    expect(gradeRangesOverlap([0, 5], [6, 8])).toBe(false);
    expect(gradeRangesOverlap([9, 10], [9, 12])).toBe(true);
    expect(gradeRangesOverlap([0, 8], [6, 8])).toBe(true);
  });

  it('treats a shared endpoint as overlapping', () => {
    expect(gradeRangesOverlap([0, 5], [5, 8])).toBe(true);
  });

  it('handles single-grade spans', () => {
    expect(gradeRangesOverlap([3, 3], [0, 5])).toBe(true);
    expect(gradeRangesOverlap([3, 3], [6, 8])).toBe(false);
  });
});
