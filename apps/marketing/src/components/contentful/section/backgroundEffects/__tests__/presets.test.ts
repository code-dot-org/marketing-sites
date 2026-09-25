import {
  BACKGROUND_EFFECTS,
  blobMotion,
  isBackgroundEffect,
  layoutBackground,
  mirrorLayout,
  motionReachFactor,
  motionSpeedFactor,
} from '../presets';

describe('background effect presets', () => {
  it('recognizes only preset values', () => {
    expect(isBackgroundEffect('aurora')).toBe(true);
    expect(isBackgroundEffect('dusk')).toBe(true);
    expect(isBackgroundEffect('purpleDark')).toBe(false);
    expect(isBackgroundEffect(undefined)).toBe(false);
  });

  it('draws each layout as radial gradients over its base color', () => {
    BACKGROUND_EFFECTS.forEach(({wide, tall}) => {
      [wide, tall].forEach(layout => {
        const css = layoutBackground(layout);
        expect(css.match(/radial-gradient/g)).toHaveLength(layout.blobs.length);
        expect(css.endsWith(layout.base)).toBe(true);
      });
    });
  });

  it('maps motion speeds to factors, Normal by default', () => {
    expect(motionSpeedFactor('slow')).toBe(1);
    expect(motionSpeedFactor('normal')).toBe(3);
    expect(motionSpeedFactor('fast')).toBe(5);
    expect(motionSpeedFactor()).toBe(3);
    expect(
      ['slow', 'normal', 'fast'].map(s => motionReachFactor(s as 'slow')),
    ).toEqual([1, 2, 3]);
  });

  it('mirrors blobs horizontally for the Breathe frame', () => {
    const {wide} = BACKGROUND_EFFECTS[0];
    expect(mirrorLayout(wide).blobs.map(b => b.x)).toEqual(
      wide.blobs.map(b => 100 - b.x),
    );
  });

  it('gives each blob stable, bounded motion', () => {
    for (let i = 0; i < 12; i++) {
      const motion = blobMotion(i);
      expect(blobMotion(i)).toEqual(motion);
      [motion.dx, motion.dy].forEach(offset => {
        expect(Math.abs(offset)).toBeGreaterThanOrEqual(12);
        expect(Math.abs(offset)).toBeLessThanOrEqual(28);
      });
      expect(motion.duration).toBeGreaterThanOrEqual(40);
      expect(motion.duration).toBeLessThanOrEqual(75);
    }
  });
});
