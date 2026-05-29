'use client';

import {useLayoutEffect, useRef, useState} from 'react';

import styles from './logoAnimationStage.module.scss';

// The animation is authored in a fixed 1053x396 user space (the keyframe
// coordinates are in those units). The stage renders at that native size and is
// scaled to fit its container; CSS can't derive a unitless scale factor from a
// width, so it's computed here and applied as an inline transform.
const STAGE_WIDTH = 1053;

/**
 * The Code.org "CODE + Ai" logo-transition animation: inline SVG letterforms
 * driven entirely by CSS keyframes (see logoAnimationStage.module.scss), played
 * once and frozen on the final all-black logo. Designed to be dropped into
 * LogoTransitionOverlay's children slot, which FLIPs the frozen logo into the
 * header. Responsive: scales to the available width, never above native size.
 */
const LogoAnimationStage: React.FC = () => {
  const scalerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  useLayoutEffect(() => {
    const scaler = scalerRef.current;
    if (!scaler) return;
    const update = () =>
      setScale(Math.min(1, scaler.clientWidth / STAGE_WIDTH));
    update();
    const observer = new ResizeObserver(update);
    observer.observe(scaler);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={scalerRef} className={styles.scaler}>
      <div className={styles.stage} style={{transform: `scale(${scale})`}}>
        <div className={`${styles.elem} ${styles.square} ${styles.c}`}>
          <svg viewBox="0 0 100 100">
            <rect width="100" height="100" rx="18" ry="18" fill="#fff" />
            <path d="M82,0H18C8.06,0,0,8.06,0,18v64C0,91.94,8.06,100,18,100h64c9.94,0,18-8.06,18-18V18C100,8.06,91.94,0,82,0ZM51.52,66.64c6.83,0,10.34-4.1,11.44-7.74h8.32c-1.37,7.09-7.74,14.82-19.96,14.82-13.07,0-22.49-9.04-22.49-23.73s10.27-23.73,22.49-23.73,18.53,7.67,19.96,14.82h-8.32c-1.1-3.64-4.62-7.74-11.44-7.74-8.12,0-14.04,6.05-14.04,16.64s5.92,16.64,14.04,16.64Z" />
          </svg>
        </div>
        <div className={`${styles.elem} ${styles.square} ${styles.o}`}>
          <svg viewBox="0 0 100 100">
            <rect width="100" height="100" rx="18" ry="18" fill="#fff" />
            <path d="M82,0h-64C8.06,0,0,8.06,0,18v64c0,9.94,8.06,18,18,18h64c9.94,0,18-8.06,18-18V18C100,8.06,91.94,0,82,0ZM50.01,73.72c-12.54,0-23.34-9.43-23.34-23.73s10.79-23.73,23.34-23.73,23.34,9.36,23.34,23.73-10.79,23.73-23.34,23.73Z" />
            <ellipse cx="50.01" cy="50" rx="14.76" ry="16.77" />
          </svg>
        </div>
        <div className={`${styles.elem} ${styles.square} ${styles.d}`}>
          <svg viewBox="0 0 100 100">
            <rect width="100" height="100" rx="18" ry="18" fill="#fff" />
            <path d="M82,0h-64C8.06,0,0,8.06,0,18v64c0,9.94,8.06,18,18,18h64c9.94,0,18-8.06,18-18V18C100,8.06,91.94,0,82,0ZM48.01,72.74h-14.95V27.24h14.95c13.65,0,23.92,9.1,23.92,22.75s-10.27,22.75-23.92,22.75Z" />
            <path d="M47.36,34.2h-6.17v31.59h6.17c10.27,0,16.32-5.72,16.32-15.8s-6.05-15.8-16.32-15.8Z" />
          </svg>
        </div>
        <div className={`${styles.elem} ${styles.square} ${styles.e}`}>
          <svg viewBox="0 0 100 100">
            <rect width="100" height="100" rx="18" ry="18" fill="#fff" />
            <path d="M82,0h-64C8.06,0,0,8.06,0,18v64c0,9.94,8.06,18,18,18h64c9.94,0,18-8.06,18-18V18C100,8.06,91.94,0,82,0ZM66.19,72.74h-32.18V27.24h31.85v6.96h-23.73v11.77h20.15v6.83h-20.15v13h24.05v6.96Z" />
          </svg>
        </div>
        <div className={`${styles.elem} ${styles.triangle}`}>
          <svg viewBox="438 0 108.22 100">
            <path
              className={styles.triOuter}
              d="M487.36,2.92l-49.15,88.66c-2.1,3.78,0.64,8.42,4.96,8.42h98.3c4.32,0,7.06-4.64,4.96-8.42L497.29,2.92c-2.16-3.9-7.76-3.9-9.92,0Z"
            />
            <path
              className={styles.triInner}
              d="M487.36,2.92l-49.15,88.66c-2.1,3.78,0.64,8.42,4.96,8.42h98.3c4.32,0,7.06-4.64,4.96-8.42L497.29,2.92c-2.16-3.9-7.76-3.9-9.92,0Z"
              transform="translate(490.67 67.64) scale(0.55) translate(-490.67 -67.64)"
            />
          </svg>
        </div>
        <div className={`${styles.elem} ${styles.ibar}`}>
          <svg viewBox="557.65 0 33.5 100">
            <rect
              className={styles.barOuter}
              x="557.65"
              width="33.5"
              height="100"
              rx="5.5"
              ry="5.5"
            />
            <rect
              className={styles.barInner}
              x="566.025"
              y="25.0"
              width="16.75"
              height="50.0"
              rx="3"
              ry="3"
            />
          </svg>
        </div>
      </div>
    </div>
  );
};

export default LogoAnimationStage;
