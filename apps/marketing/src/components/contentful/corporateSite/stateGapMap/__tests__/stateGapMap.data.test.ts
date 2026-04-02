import {stateGapMapData} from '../data';
import {STATE_GAP_MAP_GEOMETRY_BY_CODE} from '../geometry';

describe('stateGapMapData', () => {
  it('contains all 50 states plus Washington, D.C.', () => {
    expect(stateGapMapData.states).toHaveLength(51);
  });

  it('contains unique state codes and matching geometry records', () => {
    const codes = stateGapMapData.states.map(state => state.code);
    expect(new Set(codes).size).toBe(codes.length);

    for (const code of codes) {
      expect(STATE_GAP_MAP_GEOMETRY_BY_CODE.has(code)).toBe(true);
    }
  });

  it('contains unique tier identifiers', () => {
    const ids = stateGapMapData.tiers.map(tier => tier.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});
