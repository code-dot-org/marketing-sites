import {
  formatChange,
  formatPercent,
  formatYear,
  toOverviewModel,
  toNationalModel,
  toRankingsModel,
  toStateModel,
} from '../readReport';
import {checkReportShape} from '../reportShape';
import type {RawReportData, Report} from '../types';

import fixture from './fixtures/reportData.json';

const reportFrom = (data: unknown): Report => {
  const shape = checkReportShape(data);
  if (!shape.success) {
    throw new Error('bad fixture');
  }
  return {data: shape.data, dataAsOf: '2026-11-09', warnings: []};
};

const clone = () =>
  JSON.parse(JSON.stringify(fixture.data)) as RawReportData &
    Record<string, unknown>;

describe('readReport', () => {
  it('formats years, percentages and changes', () => {
    expect(formatYear('2025_26')).toBe('2025–26');
    expect(formatPercent(null)).toBe('Not reported');
    expect(formatPercent(14.25)).toBe('14.3%');
    expect(formatChange(null)).toBeNull();
    expect(formatChange(0)).toBeNull();
    expect(formatChange(2.1, '%')).toBe('+2.1%');
    expect(formatChange(-1, ' pts')).toBe('-1.0 pts');
  });

  it('ignores unknown fields', () => {
    const data = clone();
    data.unexpected = {a: 1};
    (data.states[0] as Record<string, unknown>).newField = 'x';
    expect(() => toStateModel(reportFrom(data), 'AL')).not.toThrow();
  });

  it('turns missing, null and malformed leaves into null', () => {
    const data = clone();
    const al = data.states.find(s => s.postal === 'AL')!;
    delete al.score;
    al.access = {series: 'nope' as never, latest: '61' as never};
    al.participation = null;
    al.policies = {plan_guidance: 'emerging_historic' as never};

    const model = toStateModel(reportFrom(data), 'AL')!;

    expect(model.score.total).toBeNull();
    expect(model.score.momentum).toBeNull();
    expect(model.access.series).toEqual([]);
    expect(model.participation.totalPct).toBeNull();
    expect(model.participation.gender).toBeNull();
    expect(model.policyGroups[0].items[0].tier).toBeNull();
    expect(model.policyGroups[0].items[1].tier).toBeNull();
  });

  it('hides change figures unless trends are available', () => {
    const data = clone();
    const state = data.states.find(s => s.access?.change != null)!;
    state.score = {...state.score, change: 3};
    state.participation = {...state.participation, change: 1};

    const model = toStateModel(reportFrom(data), state.postal)!;
    expect(model.access.change).toBe(state.access!.change);
    expect(model.score.change).toBeNull();
    expect(model.participation.change).toBeNull();

    data.meta.trendsAvailable = {access: false, score: true};
    const next = toStateModel(reportFrom(data), state.postal)!;
    expect(next.access.change).toBeNull();
    expect(next.score.change).toBe(3);
  });

  it('keeps narrative text and line breaks as plain strings', () => {
    const data = clone();
    data.states[0].narratives = {aiPolicyIntent: '<b>x</b>\n• one'};
    const model = toStateModel(reportFrom(data), data.states[0].postal)!;
    expect(model.narratives.aiPolicyIntent).toBe('<b>x</b>\n• one');
  });

  it('orders rankings by stored rank with unranked states last', () => {
    const model = toRankingsModel(reportFrom(fixture.data));
    const ranks = model.score.map(r => r.rank);
    const firstUnranked = ranks.indexOf(null);

    expect(ranks.slice(0, firstUnranked)).toEqual(
      [...ranks.slice(0, firstUnranked)].sort((a, b) => a! - b!),
    );
    expect(ranks.slice(firstUnranked).every(r => r == null)).toBe(true);
    expect(model.participation.at(-1)?.value).toBeNull();
  });

  it('links neighbours by score rank', () => {
    const report = reportFrom(fixture.data);
    const second = toRankingsModel(report).score[1];
    const model = toStateModel(report, second.postal)!;
    expect(model.prev?.rank).toBe(1);
    expect(model.next?.rank).toBe(3);
  });

  it('returns null for a state the report does not list', () => {
    expect(toStateModel(reportFrom(fixture.data), 'ZZ')).toBeNull();
  });

  it('gives each page only its own fields', () => {
    const report = reportFrom(fixture.data);
    const overview = toOverviewModel(report);

    expect(Object.keys(overview.regions[0]).sort()).toEqual(
      [
        'access',
        'band',
        'gender',
        'name',
        'participation',
        'postal',
        'ranks',
        'slug',
        'tierLabel',
        'total',
      ].sort(),
    );
    expect(JSON.stringify(overview)).not.toContain('narratives');
    expect(JSON.stringify(toRankingsModel(report))).not.toContain('policies');
  });

  it('reads national figures for the printable report', () => {
    const national = toNationalModel(reportFrom(fixture.data));
    expect(national.policyCounts.standards).toBe(
      fixture.data.national.policyCounts.standards,
    );
    expect(national.accessSeries.at(-1)).toEqual({
      year: '2025_26',
      label: '2025–26',
      value: null,
    });
  });
});
