// Matches a single grade ("K", "5") or a grade range ("K-5", "6–8").
const GRADE_PATTERN = /^(k|\d{1,2})(?:\s*[-–]\s*(k|\d{1,2}))?$/i;

const toNumber = (grade: string) =>
  grade.toLowerCase() === 'k' ? 0 : parseInt(grade, 10);

const toLabel = (grade: number) => (grade === 0 ? 'K' : String(grade));

/**
 * Parses a grade-band value ("K", "5", "K-5", "6–8", reversed "5-K") into a
 * normalized numeric span with K = 0. Returns undefined when it doesn't
 * parse as a grade or grade range.
 */
export function parseGradeSpan(value: string): [number, number] | undefined {
  const match = String(value).trim().match(GRADE_PATTERN);
  if (!match) return undefined;
  const start = toNumber(match[1]);
  const end = match[2] === undefined ? start : toNumber(match[2]);
  return start <= end ? [start, end] : [end, start];
}

/** Inclusive overlap test between two grade spans. */
export function gradeRangesOverlap(
  a: readonly [number, number],
  b: readonly [number, number],
): boolean {
  return a[0] <= b[1] && b[0] <= a[1];
}

/**
 * Collapses a curriculum entry's grade-band values into one span, e.g.
 * ["K-5", "6-8"] → "K-8". Values that don't parse as grades or grade
 * ranges fall back to a comma-joined list.
 */
export function mergeGradeBands(bands?: string[]): string | undefined {
  const values = (bands ?? []).map(band => String(band).trim()).filter(Boolean);
  if (!values.length) return undefined;

  let min = Infinity;
  let max = -Infinity;
  for (const value of values) {
    const span = parseGradeSpan(value);
    if (!span) return values.join(', ');
    min = Math.min(min, span[0]);
    max = Math.max(max, span[1]);
  }

  return min === max ? toLabel(min) : `${toLabel(min)}-${toLabel(max)}`;
}
