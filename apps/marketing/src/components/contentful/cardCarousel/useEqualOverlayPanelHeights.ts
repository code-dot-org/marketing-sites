import {RefObject, useEffect} from 'react';

export const OVERLAY_PANEL_SELECTOR =
  '[data-testid="content-card-overlay-panel"]';

// Equalizes the overlay cards' glass-panel heights across a carousel. CSS
// can't reach across Swiper's transform-positioned slides (no grid/flex
// relationship spans them), so this measures every panel and applies the
// tallest natural height as min-height on all of them. Panels are
// bottom-anchored inside the card, so growth extends the glass upward; the
// link row's `margin-top: auto` then opens the flexible gap between the body
// text and the link.
//
// ResizeObserver re-runs the measurement on viewport resizes, font loads,
// and content changes. Without ResizeObserver (jsdom, very old browsers) the
// hook is a no-op and panels keep their natural heights.
export const useEqualOverlayPanelHeights = (
  containerRef: RefObject<HTMLElement | null>,
  enabled: boolean,
  // Changing card sets render new panel elements; re-run to observe them.
  cardCount: number,
): void => {
  useEffect(() => {
    const container = containerRef.current;
    if (!enabled || !container || typeof ResizeObserver === 'undefined') {
      return;
    }
    const panels = Array.from(
      container.querySelectorAll<HTMLElement>(OVERLAY_PANEL_SELECTOR),
    );
    if (panels.length < 2) {
      return;
    }

    let frame = 0;
    const equalize = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        // Reset first so panels can shrink back when the widest content no
        // longer needs the old height (e.g. the viewport grew); reads happen
        // together before the writes to avoid interleaved reflows. The reset
        // and re-apply land in the same frame, so there is no flicker and the
        // observer sees no net change once heights converge.
        panels.forEach(el => {
          el.style.minHeight = '';
        });
        const max = Math.max(...panels.map(el => el.offsetHeight));
        panels.forEach(el => {
          el.style.minHeight = `${max}px`;
        });
      });
    };

    const observer = new ResizeObserver(equalize);
    panels.forEach(el => observer.observe(el));
    equalize();

    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      panels.forEach(el => {
        el.style.minHeight = '';
      });
    };
  }, [containerRef, enabled, cardCount]);
};
