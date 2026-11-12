// Matches an age band ("6-8", "13–18") or "5 and under".
const RANGE_PATTERN = /^(\d{1,2})\s*[-–]\s*(\d{1,2})$/;
const UNDER_PATTERN = /^(\d{1,2}) and under$/i;

const parseAgeSpan = (value: string): [number, number] | undefined => {
  const range = value.match(RANGE_PATTERN);
  if (range) {
    const [a, b] = [Number(range[1]), Number(range[2])];
    return a <= b ? [a, b] : [b, a];
  }
  const under = value.match(UNDER_PATTERN);
  return under ? [0, Number(under[1])] : undefined;
};

export interface FormattedAges {
  /** The merged age span, e.g. "6-12" or "12 and under" */
  span?: string;
  /** Non-age audiences, e.g. "Educators" */
  audiences: string[];
}

/**
 * Collapses an activity's age bands into one span, e.g. ["9-12", "13-18",
 * "6-8"] → "6-18", like Unit Card's grade bands. Non-age audiences
 * ("Educators") are returned separately.
 */
export function formatAges(ages?: string[]): FormattedAges {
  const values = (ages ?? []).map(age => String(age).trim()).filter(Boolean);
  let min = Infinity;
  let max = -Infinity;
  const audiences: string[] = [];
  for (const value of values) {
    const span = parseAgeSpan(value);
    if (span) {
      min = Math.min(min, span[0]);
      max = Math.max(max, span[1]);
    } else {
      audiences.push(value);
    }
  }

  const span =
    max === -Infinity
      ? undefined
      : min === 0
        ? `${max} and under`
        : min === max
          ? `${min}`
          : `${min}-${max}`;
  return {span, audiences};
}
