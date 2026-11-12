import {formatAges} from '@/components/contentful/activityCard/formatAges';

describe('formatAges', () => {
  it('merges bands into one span, whatever their order', () => {
    expect(formatAges(['9-12', '6-8']).span).toBe('6-12');
    expect(formatAges(['9-12', '13-18', '6-8']).span).toBe('6-18');
    expect(formatAges(['13-18']).span).toBe('13-18');
  });

  it('reads "5 and under" as the lower bound', () => {
    expect(formatAges(['5 and under']).span).toBe('5 and under');
    expect(formatAges(['6-8', '5 and under', '9-12']).span).toBe(
      '12 and under',
    );
  });

  it('returns non-age audiences separately', () => {
    expect(formatAges(['13-18', 'Educators', '6-8'])).toEqual({
      span: '6-18',
      audiences: ['Educators'],
    });
    expect(formatAges(['Parents or community members'])).toEqual({
      span: undefined,
      audiences: ['Parents or community members'],
    });
  });

  it('returns nothing when there are no ages', () => {
    expect(formatAges([])).toEqual({span: undefined, audiences: []});
    expect(formatAges(undefined)).toEqual({span: undefined, audiences: []});
  });
});
