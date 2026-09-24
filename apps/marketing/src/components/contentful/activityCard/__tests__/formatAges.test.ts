import {formatAges} from '@/components/contentful/activityCard/formatAges';

describe('formatAges', () => {
  it('merges bands into one span, whatever their order', () => {
    expect(formatAges(['9-12', '13-18', '6-8'])).toBe('Ages 6-18');
    expect(formatAges(['13-18'])).toBe('Ages 13-18');
  });

  it('reads "5 and under" as the lower bound', () => {
    expect(formatAges(['5 and under'])).toBe('Ages 5 and under');
    expect(formatAges(['6-8', '5 and under', '9-12'])).toBe(
      'Ages 12 and under',
    );
  });

  it('lists non-age audiences after the span', () => {
    expect(formatAges(['13-18', 'Educators', '6-8'])).toBe(
      'Ages 6-18, Educators',
    );
    expect(formatAges(['Parents or community members'])).toBe(
      'Parents or community members',
    );
  });

  it('returns undefined when there are no ages', () => {
    expect(formatAges([])).toBeUndefined();
    expect(formatAges(undefined)).toBeUndefined();
  });
});
