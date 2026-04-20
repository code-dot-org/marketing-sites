import {stateGapMapData} from '../data';

describe('stateGapMapData', () => {
  it('contains all 50 states plus Washington, D.C.', () => {
    expect(stateGapMapData.states).toHaveLength(51);
  });

  it('contains unique state codes', () => {
    const codes = stateGapMapData.states.map(state => state.code);
    expect(new Set(codes).size).toBe(codes.length);
  });

  it('contains unique tier identifiers', () => {
    const ids = stateGapMapData.tiers.map(tier => tier.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('marks incomplete records as unavailable instead of implying a policy tier', () => {
    const unavailableCodes = stateGapMapData.states
      .filter(state => state.dataStatus === 'unavailable')
      .map(state => state.code);

    expect(unavailableCodes).toContain('DC');
    expect(unavailableCodes.length).toBeGreaterThan(0);
  });
});
