// Multi-color Section backgrounds drawn with CSS radial gradients instead of
// images. Each preset has a wide layout and a tall (portrait) layout; the
// Section shows whichever matches its own shape.

/** A soft color spot. Center and size are % of the Section; alpha 0–1. */
export type EffectBlob = {
  x: number;
  y: number;
  w: number;
  h: number;
  color: string;
  alpha: number;
};

export type EffectLayout = {base: string; blobs: EffectBlob[]};

export const BACKGROUND_EFFECTS = [
  {
    value: 'aurora',
    displayName: 'Aurora',
    wide: {
      base: '#3f0aa6',
      blobs: [
        {x: 60, y: 50, w: 70, h: 80, color: '#2a14a8', alpha: 0.9},
        {x: 72, y: 10, w: 60, h: 62, color: '#00e1ff', alpha: 0.95},
        {x: 6, y: 32, w: 34, h: 58, color: '#18d4f6', alpha: 0.95},
        {x: 13, y: 58, w: 36, h: 50, color: '#a54dff', alpha: 0.8},
        {x: 34, y: 86, w: 58, h: 62, color: '#d600e6', alpha: 0.95},
        {x: 99, y: 46, w: 32, h: 60, color: '#e000ea', alpha: 0.9},
        {x: 74, y: 98, w: 44, h: 50, color: '#00f0ff', alpha: 0.95},
        {x: 0, y: 0, w: 36, h: 44, color: '#06121a', alpha: 0.95},
        {x: 100, y: 0, w: 26, h: 36, color: '#1f0008', alpha: 0.95},
        {x: 0, y: 100, w: 32, h: 40, color: '#02030a', alpha: 0.95},
      ],
    },
    tall: {
      base: '#3c06a5',
      blobs: [
        {x: 55, y: 40, w: 80, h: 44, color: '#3a12ac', alpha: 0.9},
        {x: 0, y: 0, w: 90, h: 40, color: '#d10aee', alpha: 0.95},
        {x: 100, y: 8, w: 60, h: 30, color: '#4a0ab4', alpha: 0.9},
        {x: 0, y: 58, w: 60, h: 34, color: '#19cffc', alpha: 0.95},
        {x: 100, y: 56, w: 56, h: 30, color: '#139ef0', alpha: 0.9},
        {x: 62, y: 96, w: 90, h: 30, color: '#d808ea', alpha: 0.95},
        {x: 0, y: 92, w: 50, h: 24, color: '#35017e', alpha: 0.9},
        {x: 100, y: 100, w: 30, h: 16, color: '#6a0038', alpha: 0.9},
      ],
    },
  },
  {
    value: 'dusk',
    displayName: 'Dusk',
    wide: {
      base: '#1c0d63',
      blobs: [
        {x: 45, y: 50, w: 80, h: 90, color: '#2a0f86', alpha: 0.85},
        {x: 96, y: 4, w: 42, h: 50, color: '#00c8f0', alpha: 0.75},
        {x: 82, y: 70, w: 50, h: 60, color: '#5a1ad6', alpha: 0.8},
        {x: 8, y: 100, w: 40, h: 50, color: '#b000cc', alpha: 0.7},
        {x: 0, y: 0, w: 40, h: 50, color: '#0a0724', alpha: 0.95},
      ],
    },
    tall: {
      base: '#1c0d63',
      blobs: [
        {x: 50, y: 40, w: 90, h: 50, color: '#2a0f86', alpha: 0.85},
        {x: 100, y: 0, w: 70, h: 26, color: '#00c8f0', alpha: 0.7},
        {x: 90, y: 72, w: 70, h: 30, color: '#5a1ad6', alpha: 0.8},
        {x: 0, y: 100, w: 80, h: 26, color: '#b000cc', alpha: 0.7},
      ],
    },
  },
] as const satisfies readonly {
  value: string;
  displayName: string;
  wide: EffectLayout;
  tall: EffectLayout;
}[];

export type BackgroundEffect = (typeof BACKGROUND_EFFECTS)[number]['value'];

export const BACKGROUND_MOTIONS = [
  {value: 'none', displayName: 'None'},
  {value: 'drift', displayName: 'Drift'},
  {value: 'breathe', displayName: 'Breathe'},
  {value: 'pointer', displayName: 'Follow pointer'},
  {value: 'scroll', displayName: 'On scroll'},
] as const;

export type BackgroundMotion = (typeof BACKGROUND_MOTIONS)[number]['value'];

// `factor` speeds up the Drift and Breathe loops; Slow is the base speed.
export const BACKGROUND_MOTION_SPEEDS = [
  {value: 'slow', displayName: 'Slow', factor: 1},
  {value: 'normal', displayName: 'Normal', factor: 3},
  {value: 'fast', displayName: 'Fast', factor: 5},
] as const;

export type BackgroundMotionSpeed =
  (typeof BACKGROUND_MOTION_SPEEDS)[number]['value'];

export const motionSpeedFactor = (speed: BackgroundMotionSpeed = 'normal') =>
  BACKGROUND_MOTION_SPEEDS.find(s => s.value === speed)?.factor ?? 3;

/**
 * Gentler scale for how quickly Follow pointer catches up and how far On
 * scroll travels: 1×, 2× and 3× for Slow, Normal and Fast.
 */
export const motionReachFactor = (speed?: BackgroundMotionSpeed) =>
  (1 + motionSpeedFactor(speed)) / 2;

// Drop-in for Section's `validations.in`.
export const SECTION_EFFECT_OPTIONS = BACKGROUND_EFFECTS.map(
  ({value, displayName}) => ({value, displayName}),
);

const EFFECT_VALUE_SET = new Set<string>(BACKGROUND_EFFECTS.map(e => e.value));

export const isBackgroundEffect = (
  value: string | undefined,
): value is BackgroundEffect => !!value && EFFECT_VALUE_SET.has(value);

export const getBackgroundEffect = (value: BackgroundEffect) =>
  BACKGROUND_EFFECTS.find(e => e.value === value)!;

export const rgba = (hex: string, alpha: number) => {
  const [r, g, b] = [1, 3, 5].map(i => parseInt(hex.slice(i, i + 2), 16));
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

/** One CSS `background` value for a static layout: blobs over the base. */
export const layoutBackground = ({base, blobs}: EffectLayout) =>
  [
    // Later blobs paint on top, so they come first in the layer list.
    ...[...blobs]
      .reverse()
      .map(
        ({x, y, w, h, color, alpha}) =>
          `radial-gradient(${w / 2}% ${h / 2}% at ${x}% ${y}%, ${rgba(color, alpha)} 0%, ${rgba(color, 0)} 100%)`,
      ),
    base,
  ].join(', ');

/** Mirrored copy of a layout, the second frame of the Breathe crossfade. */
export const mirrorLayout = ({base, blobs}: EffectLayout): EffectLayout => ({
  base,
  blobs: blobs.map(blob => ({...blob, x: 100 - blob.x})),
});

/**
 * Stable per-blob motion: offset (% of the blob's own size, so it reads at
 * any Section size), scale, loop length and start offset (s), and pointer
 * depth (px). An integer hash of the index, so SSR and every browser engine
 * produce the same inline styles.
 */
export const blobMotion = (index: number) => {
  const rand = (n: number) => {
    let h = Math.imul(index + 1, 0x9e3779b1) ^ Math.imul(n, 0x85ebca6b);
    h = Math.imul(h ^ (h >>> 15), 0x2c1b3c6d);
    return ((h ^ (h >>> 13)) >>> 0) / 0x100000000;
  };
  const offset = (n: number) =>
    (rand(n) < 0.5 ? -1 : 1) * Math.round(12 + rand(n + 10) * 16);
  return {
    dx: offset(1),
    dy: offset(2),
    scale: Math.round((0.85 + rand(3) * 0.35) * 100) / 100,
    duration: Math.round(40 + rand(4) * 35),
    delay: -Math.round(rand(5) * 30),
    depth: Math.round(12 + rand(6) * 36),
  };
};
