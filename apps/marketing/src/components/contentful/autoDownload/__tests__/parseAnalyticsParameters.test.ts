import {parseAnalyticsParameters} from '../parseAnalyticsParameters';

describe('parseAnalyticsParameters', () => {
  it('returns nothing for empty input', () => {
    expect(parseAnalyticsParameters(undefined)).toEqual({
      parameters: {},
      rejected: [],
    });
    expect(parseAnalyticsParameters('  ')).toEqual({
      parameters: {},
      rejected: [],
    });
  });

  it('parses a single pair', () => {
    expect(
      parseAnalyticsParameters('download_campaign=springplcourse').parameters,
    ).toEqual({download_campaign: 'springplcourse'});
  });

  it('parses comma- and newline-separated pairs and trims whitespace', () => {
    expect(
      parseAnalyticsParameters(
        ' download_campaign = springplcourse ,download_content=hero\ncohort=2026 ',
      ).parameters,
    ).toEqual({
      download_campaign: 'springplcourse',
      download_content: 'hero',
      cohort: '2026',
    });
  });

  it('keeps any = after the first as part of the value', () => {
    expect(parseAnalyticsParameters('note=a=b').parameters).toEqual({
      note: 'a=b',
    });
  });

  it.each([
    ['springplcourse', 'not in name=value form'],
    ['1st=x', 'invalid name'],
    ['has space=x', 'invalid name'],
    [`${'a'.repeat(41)}=x`, 'invalid name'],
    ['method=link', 'reserved name'],
    ['file_name=x', 'reserved name'],
    ['Campaign=x', 'reserved name'],
    ['google_ads=x', 'reserved name'],
    ['download_campaign=', 'empty value'],
    [`download_campaign=${'v'.repeat(101)}`, 'value over 100 characters'],
  ])('rejects %s (%s)', (entry, reason) => {
    const {parameters, rejected} = parseAnalyticsParameters(entry);
    expect(parameters).toEqual({});
    expect(rejected).toEqual([{entry, reason}]);
  });

  it('keeps the first of duplicate names', () => {
    const {parameters, rejected} = parseAnalyticsParameters(
      'download_campaign=a, download_campaign=b',
    );
    expect(parameters).toEqual({download_campaign: 'a'});
    expect(rejected).toEqual([
      {entry: 'download_campaign=b', reason: 'duplicate name'},
    ]);
  });

  it('caps the number of parameters', () => {
    const input = Array.from({length: 21}, (_, i) => `p${i}=v`).join(',');
    const {parameters, rejected} = parseAnalyticsParameters(input);
    expect(Object.keys(parameters)).toHaveLength(20);
    expect(rejected).toEqual([{entry: 'p20=v', reason: 'too many parameters'}]);
  });

  it('keeps valid pairs alongside rejected ones', () => {
    const {parameters, rejected} = parseAnalyticsParameters(
      'download_campaign=spring, method=link',
    );
    expect(parameters).toEqual({download_campaign: 'spring'});
    expect(rejected).toHaveLength(1);
  });
});
