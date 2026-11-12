import {checkReportShape} from '../reportShape';

import fixture from './fixtures/reportData.json';

describe('checkReportShape', () => {
  it('accepts the fixture', () => {
    expect(checkReportShape(fixture.data).success).toBe(true);
  });

  it('accepts unknown fields and missing leaves', () => {
    const result = checkReportShape({
      meta: {extra: 1},
      national: {},
      states: [{postal: 'AL', name: 'Alabama', somethingNew: true}],
      added: 'later',
    });
    expect(result.success).toBe(true);
  });

  it.each([
    ['missing states', {meta: {}, national: {}}, 'states'],
    ['non-object national', {meta: {}, national: 3, states: []}, 'national'],
    [
      'a state without postal',
      {meta: {}, national: {}, states: [{name: 'Alabama'}]},
      'states.0.postal',
    ],
  ])('rejects %s', (_, value, path) => {
    const result = checkReportShape(value);
    expect(result).toEqual({success: false, paths: [path]});
  });

  it('rejects a non-object payload', () => {
    expect(checkReportShape(null).success).toBe(false);
  });
});
