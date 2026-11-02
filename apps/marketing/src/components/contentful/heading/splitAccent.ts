export type AccentSegment = {text: string; accent: boolean};

// `*text*` marks an accent run. Asterisks without a non-empty partner
// (e.g. a footnote "Free*") stay literal.
const ACCENT_PATTERN = /\*([^*]+)\*/g;

/** Splits heading copy into plain and accent runs at `*…*` markers. */
export const splitAccent = (text: string): AccentSegment[] => {
  const segments: AccentSegment[] = [];
  let cursor = 0;

  for (const match of text.matchAll(ACCENT_PATTERN)) {
    if (match.index > cursor) {
      segments.push({text: text.slice(cursor, match.index), accent: false});
    }
    segments.push({text: match[1], accent: true});
    cursor = match.index + match[0].length;
  }
  if (cursor < text.length) {
    segments.push({text: text.slice(cursor), accent: false});
  }

  return segments;
};
