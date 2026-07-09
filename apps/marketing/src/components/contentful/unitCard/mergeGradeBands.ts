// Matches a single grade ("K", "5") or a grade range ("K-5", "6–8").
const GRADE_PATTERN = /^(k|\d{1,2})(?:\s*[-–]\s*(k|\d{1,2}))?$/i;

const toNumber = (grade: string) =>
  grade.toLowerCase() === 'k' ? 0 : parseInt(grade, 10);

const toLabel = (grade: number) => (grade === 0 ? 'K' : String(grade));

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
    const match = value.match(GRADE_PATTERN);
    if (!match) return values.join(', ');
    const start = toNumber(match[1]);
    const end = match[2] === undefined ? start : toNumber(match[2]);
    min = Math.min(min, start, end);
    max = Math.max(max, start, end);
  }

  return min === max ? toLabel(min) : `${toLabel(min)}-${toLabel(max)}`;
}
