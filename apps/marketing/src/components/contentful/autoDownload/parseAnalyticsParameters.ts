// GA4 limits: names up to 40 characters starting with a letter, values up to
// 100 characters, 25 parameters per event (4 are used by file_download).
const NAME_PATTERN = /^[A-Za-z][A-Za-z0-9_]{0,39}$/;
const MAX_VALUE_LENGTH = 100;
const MAX_PARAMETERS = 20;

// The event's own fields, plus names GA uses for page and campaign
// attribution; letting authors set these would corrupt core reporting.
const RESERVED_NAMES = new Set([
  'file_name',
  'file_extension',
  'link_url',
  'link_text',
  'link_id',
  'link_classes',
  'method',
  'page_location',
  'page_referrer',
  'page_title',
  'campaign',
  'campaign_id',
  'source',
  'medium',
  'term',
  'content',
  'language',
  'screen_resolution',
  'engagement_time_msec',
  'session_id',
  'session_number',
]);
const RESERVED_PREFIXES = ['google_', 'ga_', 'firebase_'];

export type RejectedParameter = {entry: string; reason: string};

export type ParsedAnalyticsParameters = {
  parameters: Record<string, string>;
  rejected: RejectedParameter[];
};

const isReserved = (name: string) => {
  const lower = name.toLowerCase();
  return (
    RESERVED_NAMES.has(lower) ||
    RESERVED_PREFIXES.some(prefix => lower.startsWith(prefix))
  );
};

/**
 * Parses an authored `name=value` list (comma- or newline-separated) into GA4
 * event parameters. Entries that break GA4's naming limits or would overwrite
 * reserved fields are returned in `rejected` so Studio can flag them.
 */
export function parseAnalyticsParameters(
  input?: string,
): ParsedAnalyticsParameters {
  const parameters: Record<string, string> = {};
  const rejected: RejectedParameter[] = [];

  const entries = (input ?? '')
    .split(/[,\n]/)
    .map(entry => entry.trim())
    .filter(Boolean);

  for (const entry of entries) {
    const separator = entry.indexOf('=');
    const name = separator === -1 ? '' : entry.slice(0, separator).trim();
    const value = separator === -1 ? '' : entry.slice(separator + 1).trim();

    let reason: string | undefined;
    if (separator === -1) reason = 'not in name=value form';
    else if (!NAME_PATTERN.test(name)) reason = 'invalid name';
    else if (isReserved(name)) reason = 'reserved name';
    else if (!value) reason = 'empty value';
    else if (value.length > MAX_VALUE_LENGTH)
      reason = 'value over 100 characters';
    else if (name in parameters) reason = 'duplicate name';
    else if (Object.keys(parameters).length >= MAX_PARAMETERS)
      reason = 'too many parameters';

    if (reason) {
      rejected.push({entry, reason});
    } else {
      parameters[name] = value;
    }
  }

  return {parameters, rejected};
}
