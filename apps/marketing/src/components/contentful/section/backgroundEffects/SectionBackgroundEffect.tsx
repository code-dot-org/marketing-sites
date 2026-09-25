'use client';
import {keyframes, styled} from '@mui/material/styles';
import {CSSProperties, useEffect, useRef} from 'react';

import {
  BackgroundEffect,
  BackgroundMotion,
  BackgroundMotionSpeed,
  blobMotion,
  EffectLayout,
  getBackgroundEffect,
  layoutBackground,
  mirrorLayout,
  motionReachFactor,
  motionSpeedFactor,
  rgba,
} from './presets';

export interface SectionBackgroundEffectProps {
  effect: BackgroundEffect;
  motion?: BackgroundMotion;
  speed?: BackgroundMotionSpeed;
}

// Motion only moves or fades whole layers (transform/opacity), so the
// browser composites it without repainting the gradients.
// A closed loop, so each color wanders rather than sliding back and forth.
const drift = keyframes`
  0%, 100% { transform: translate3d(0, 0, 0) scale(1); }
  25% { transform: translate3d(var(--dx), calc(var(--dy) * 0.5), 0) scale(var(--scale)); }
  50% { transform: translate3d(calc(var(--dx) * 0.3), var(--dy), 0) scale(1); }
  75% { transform: translate3d(calc(var(--dx) * -0.5), calc(var(--dy) * 0.4), 0) scale(var(--scale)); }
`;
const breathe = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`;
const scrollShift = keyframes`
  from { transform: translate3d(calc(var(--dx) * var(--reach) * -1), calc(var(--dy) * var(--reach) * -1), 0) scale(1); }
  to { transform: translate3d(calc(var(--dx) * var(--reach)), calc(var(--dy) * var(--reach)), 0) scale(var(--scale)); }
`;

// The Section's own pass through the viewport drives the "On scroll" motion.
const TIMELINE = '--section-background';

// Faint noise over the gradients hides 8-bit banding.
const GRAIN =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='2' stitchTiles='stitch'/%3E%3CfeColorMatrix values='0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 .55 0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")";

const REDUCED_MOTION = '@media (prefers-reduced-motion: reduce)';

// A size container (it's absolutely positioned, so its size comes from the
// Section, not its content) lets the layouts switch on the Section's shape.
const EffectRoot = styled('div', {
  shouldForwardProp: prop => prop !== 'motion',
})<{motion: BackgroundMotion}>(({motion}) => ({
  position: 'absolute',
  inset: 0,
  zIndex: 0,
  overflow: 'hidden',
  pointerEvents: 'none',
  containerType: 'size',
  ...(motion === 'scroll' && {viewTimelineName: TIMELINE}),
}));

const Layout = styled('div', {
  shouldForwardProp: prop => prop !== 'shape' && prop !== 'motion',
})<{shape: 'wide' | 'tall'; motion: BackgroundMotion}>(({shape, motion}) => ({
  position: 'absolute',
  inset: 0,
  display: shape === 'wide' ? 'block' : 'none',
  '@container (orientation: portrait)': {
    display: shape === 'wide' ? 'none' : 'block',
  },
  ...(motion === 'breathe' && {
    '&[data-frame="alt"]': {
      opacity: 0,
      animation: `${breathe} calc(14s / var(--speed)) ease-in-out infinite alternate`,
      '[data-offscreen] &': {animationPlayState: 'paused'},
      [REDUCED_MOTION]: {animation: 'none'},
    },
  }),
}));

const Blob = styled('div', {
  shouldForwardProp: prop => prop !== 'motion',
})<{motion: BackgroundMotion}>(({motion}) => ({
  position: 'absolute',
  borderRadius: '50%',
  ...(motion === 'drift' && {
    animation: `${drift} calc(var(--duration) / var(--speed)) ease-in-out calc(var(--delay) / var(--speed)) infinite`,
    '[data-offscreen] &': {animationPlayState: 'paused'},
  }),
  ...(motion === 'pointer' && {
    transform:
      'translate3d(calc(var(--px, 0) * var(--depth)), calc(var(--py, 0) * var(--depth)), 0)',
  }),
  // Browsers without scroll-driven animations keep the static layout.
  ...(motion === 'scroll' && {
    '@supports (animation-timeline: view())': {
      animation: `${scrollShift} linear both`,
      animationTimeline: TIMELINE,
    },
  }),
  [REDUCED_MOTION]: {animation: 'none', transform: 'none'},
}));

const Grain = styled('div')({
  position: 'absolute',
  inset: 0,
  opacity: 0.09,
  backgroundImage: GRAIN,
});

const renderBlobs = (layout: EffectLayout, motion: BackgroundMotion) =>
  layout.blobs.map(({x, y, w, h, color, alpha}, index) => {
    const {dx, dy, scale, duration, delay, depth} = blobMotion(index);
    return (
      <Blob
        key={index}
        motion={motion}
        style={
          {
            left: `${x - w / 2}%`,
            top: `${y - h / 2}%`,
            width: `${w}%`,
            height: `${h}%`,
            background: `radial-gradient(closest-side, ${rgba(color, alpha)} 0%, ${rgba(color, 0)} 100%)`,
            '--dx': `${dx}%`,
            '--dy': `${dy}%`,
            '--scale': scale,
            '--duration': `${duration}s`,
            '--delay': `${delay}s`,
            '--depth': `${depth}px`,
          } as CSSProperties
        }
      />
    );
  });

const renderLayout = (
  shape: 'wide' | 'tall',
  layout: EffectLayout,
  motion: BackgroundMotion,
) => {
  // Static: one CSS background, no blob elements.
  if (motion === 'none') {
    return (
      <Layout
        shape={shape}
        motion={motion}
        style={{background: layoutBackground(layout)}}
      />
    );
  }
  return (
    <>
      <Layout shape={shape} motion={motion} style={{background: layout.base}}>
        {renderBlobs(layout, motion)}
      </Layout>
      {motion === 'breathe' && (
        <Layout shape={shape} motion={motion} data-frame="alt">
          {renderBlobs(mirrorLayout(layout), motion)}
        </Layout>
      )}
    </>
  );
};

/**
 * Decorative multi-color background for a Section, drawn with CSS gradients.
 * Sits behind the Section's content; motion stops for "reduce motion".
 */
const SectionBackgroundEffect = ({
  effect,
  motion = 'none',
  speed = 'normal',
}: SectionBackgroundEffectProps) => {
  const speedFactor = motionSpeedFactor(speed);
  const reachFactor = motionReachFactor(speed);
  const rootRef = useRef<HTMLDivElement>(null);
  const {wide, tall} = getBackgroundEffect(effect);

  useEffect(() => {
    const root = rootRef.current;
    const section = root?.parentElement;
    if (!root || !section) return;

    // Looping motion pauses while the Section is off-screen.
    if (
      (motion === 'drift' || motion === 'breathe') &&
      'IntersectionObserver' in window
    ) {
      const observer = new IntersectionObserver(([entry]) =>
        root.toggleAttribute('data-offscreen', !entry.isIntersecting),
      );
      observer.observe(section);
      return () => observer.disconnect();
    }

    if (motion !== 'pointer') return;
    const canFollow =
      window.matchMedia('(hover: hover) and (pointer: fine)').matches &&
      !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!canFollow) return;

    // Eases the layers toward the pointer; the loop stops once settled.
    const ease = 0.07 * reachFactor;
    let target = {x: 0, y: 0};
    let current = {x: 0, y: 0};
    let frame = 0;
    const tick = () => {
      current = {
        x: current.x + (target.x - current.x) * ease,
        y: current.y + (target.y - current.y) * ease,
      };
      root.style.setProperty('--px', current.x.toFixed(3));
      root.style.setProperty('--py', current.y.toFixed(3));
      const settled =
        Math.abs(target.x - current.x) + Math.abs(target.y - current.y) < 0.002;
      frame = settled ? 0 : requestAnimationFrame(tick);
    };
    const start = () => {
      if (!frame) frame = requestAnimationFrame(tick);
    };
    const onMove = (event: PointerEvent) => {
      const rect = section.getBoundingClientRect();
      target = {
        x: ((event.clientX - rect.left) / rect.width - 0.5) * 2,
        y: ((event.clientY - rect.top) / rect.height - 0.5) * 2,
      };
      start();
    };
    const onLeave = () => {
      target = {x: 0, y: 0};
      start();
    };
    section.addEventListener('pointermove', onMove);
    section.addEventListener('pointerleave', onLeave);
    return () => {
      section.removeEventListener('pointermove', onMove);
      section.removeEventListener('pointerleave', onLeave);
      cancelAnimationFrame(frame);
    };
  }, [motion, reachFactor]);

  return (
    <EffectRoot
      ref={rootRef}
      motion={motion}
      aria-hidden="true"
      data-background-effect={effect}
      style={{'--speed': speedFactor, '--reach': reachFactor} as CSSProperties}
    >
      {renderLayout('wide', wide, motion)}
      {renderLayout('tall', tall, motion)}
      <Grain />
    </EffectRoot>
  );
};

export default SectionBackgroundEffect;
