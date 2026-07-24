'use client';
import {useEffect, useRef, useState} from 'react';

export type HeaderCollapse = 'none' | 'secondary' | 'all';

// Slack so subpixel rounding differences between the real bar and the ghost
// rows can't flip the decision.
const EPSILON = 0.5;

/**
 * Content-aware two-stage menu collapse ("priority+" pattern). Two invisible
 * ghost rows render the bar's full and secondary-collapsed contents at
 * natural width; whichever fits the real bar decides the stage. Because the
 * ghosts always render the complete menus, the decision never feeds back
 * into the measurement — no oscillation at the boundary.
 *
 * Returns null until the first measurement: SSR, pre-hydration paints, and
 * no-JS clients stay on the media-query baseline (see the `data-collapse`
 * rules on the styled components).
 */
export function useAutoCollapse() {
  const barRef = useRef<HTMLDivElement>(null);
  const ghostFullRef = useRef<HTMLDivElement>(null);
  const ghostCompactRef = useRef<HTMLDivElement>(null);
  const [collapse, setCollapse] = useState<HeaderCollapse | null>(null);

  useEffect(() => {
    const bar = barRef.current;
    const full = ghostFullRef.current;
    const compact = ghostCompactRef.current;
    if (!bar || !full || !compact || typeof ResizeObserver === 'undefined') {
      return;
    }

    const measure = () => {
      const width = bar.getBoundingClientRect().width;
      // Zero width means the header isn't laid out (hidden/detached); a
      // decision from it would be meaningless.
      if (width === 0) return;
      if (width + EPSILON >= full.getBoundingClientRect().width) {
        setCollapse('none');
      } else if (width + EPSILON >= compact.getBoundingClientRect().width) {
        setCollapse('secondary');
      } else {
        setCollapse('all');
      }
    };

    const observer = new ResizeObserver(measure);
    observer.observe(bar);
    // The ghosts resize when web fonts swap in, LocalizeJS replaces labels,
    // or menu content changes — each re-decides the stage.
    observer.observe(full);
    observer.observe(compact);
    measure();
    return () => observer.disconnect();
  }, []);

  return {collapse, barRef, ghostFullRef, ghostCompactRef};
}
