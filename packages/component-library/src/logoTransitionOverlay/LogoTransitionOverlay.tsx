'use client';

import classnames from 'classnames';
import {useCallback, useEffect, useId, useMemo, useRef, useState} from 'react';

import CloseButton from '@/closeButton';
import useBodyScrollLock from '@/common/hooks/useBodyScrollLock';
import useEscapeKeyHandler from '@/common/hooks/useEscapeKeyHandler';
import useFocusTrap from '@/common/hooks/useFocusTrap';

import {
  LOGO_TRANSITION_MODAL_FEATURE_TAG,
  LOGO_TRANSITION_OVERLAY_PLAYED_STORAGE_KEY,
  LogoTransitionOverlayFailureReason,
  DEFAULT_ANIMATION_DURATION_MS,
  DEFAULT_CLOSE_ARIA_LABEL,
  DEFAULT_CROSSFADE_MS,
  DEFAULT_DIALOG_ARIA_LABEL,
  DEFAULT_FADE_OUT_MS,
  DEFAULT_HANDOFF_MS,
  DEFAULT_HANDOFF_TRIGGER_MS,
  DEFAULT_LOAD_TIMEOUT_MS,
  DEFAULT_POST_PLAY_HOLD_MS,
} from './constants';

import moduleStyles from './logoTransitionOverlay.module.scss';

// Module-scoped singleton guard. Only one overlay may be active at a time.
let isSingletonMounted = false;

export interface NormalizedRect {
  /** 0..1 fraction of the media's displayed width */
  x: number;
  /** 0..1 fraction of the media's displayed height */
  y: number;
  /** 0..1 fraction of the media's displayed width */
  width: number;
  /** 0..1 fraction of the media's displayed height */
  height: number;
}

export interface LogoTransitionOverlayProps {
  /** Static URL for the logo-transition animation. In the marketing app this
   *  is an animated AVIF with an alpha channel, rendered in an `<img>` so the
   *  image decoder handles the transparency natively. Any browser-displayable
   *  animated image format works; animated images autoplay (no audio/autoplay
   *  policy to satisfy). */
  mediaSrc: string;
  /** Static URL for the destination SVG logo. */
  svgSrc: string;
  /** Media aspect ratio (width / height). The animation is rendered into a
   *  centered box that preserves this ratio while it loads. */
  mediaAspectRatio: number;
  /** CSS selector identifying the on-page element the SVG must animate into
   *  on hand-off (e.g. `'[data-logo-transition-target]'`). */
  destinationSelector: string;
  /** The on-screen position+size of the animation's final-frame logo,
   *  expressed as fractions of the animation's displayed dimensions. */
  mediaEndFrameLogoNormalizedRect: NormalizedRect;
  /** How long the animation plays before holding on its final frame. An
   *  animated `<img>` exposes no `ended` event, so the overlay arms a timer of
   *  this length once the image starts playing and treats its expiry as
   *  "playback finished". MUST match the asset's true playback duration. */
  animationDurationMs?: number;
  /** ARIA label for the close button. */
  closeAriaLabel?: string;
  /** ARIA label for the modal dialog. */
  dialogAriaLabel?: string;
  /** Bounded wait for the animation to load+start before falling back to "no
   *  overlay". Covers slow downloads and decode failures. */
  loadTimeoutMs?: number;
  /** Milliseconds to hold on the animation's final frame after playback
   *  finishes, before the fade-out crossfade begins. Lets the visitor
   *  register the destination logo before the modal starts dissolving. */
  postPlayHoldMs?: number;
  /** Optional callback invoked after the overlay unmounts. */
  onDismiss?: () => void;
  /** Optional callback fired with `true` when the overlay decides to render
   *  (post-hydration, not bypassed by reduced motion / singleton guard), and
   *  with `false` when the FLIP hand-off completes (phase 'done'/'failed')
   *  or the component unmounts. Consumers can use this to e.g.
   *  hide the real header logo while the logo-transition SVG flies into
   *  its place. */
  onActiveChange?: (active: boolean) => void;
}

type Phase =
  | 'loading'
  | 'playing'
  | 'holding'
  | 'fading'
  | 'handoff'
  | 'done'
  | 'failed';

// Phases after which the overlay renders nothing and is finished. Used both
// to short-circuit rendering and to fire the final onActiveChange/onDismiss.
const TERMINAL_PHASES: ReadonlySet<Phase> = new Set(['done', 'failed']);
const isTerminalPhase = (phase: Phase): boolean => TERMINAL_PHASES.has(phase);

type SentryLike = {
  captureMessage?: (
    message: string,
    options?: {level?: string; tags?: Record<string, string>},
  ) => void;
};

const reportFailure = (reason: LogoTransitionOverlayFailureReason) => {
  // Lazy-load Sentry from the global scope so this component can be used
  // outside of an environment that has @sentry/nextjs configured (e.g. Storybook
  // and unit tests). When Sentry is unavailable, fall back to console.warn.
  const sentry: SentryLike | undefined =
    typeof window !== 'undefined'
      ? (
          window as unknown as {
            Sentry?: SentryLike;
          }
        ).Sentry
      : undefined;

  if (sentry?.captureMessage) {
    sentry.captureMessage(`LogoTransitionOverlay: ${reason}`, {
      level: 'warning',
      tags: {feature: LOGO_TRANSITION_MODAL_FEATURE_TAG, reason},
    });
  } else if (typeof console !== 'undefined') {
    console.warn(`[${LOGO_TRANSITION_MODAL_FEATURE_TAG}] ${reason}`);
  }
};

const prefersReducedMotion = (): boolean => {
  if (typeof window === 'undefined' || !window.matchMedia) return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
};

// Has the visitor already seen the logo-transition animation in this browser?
// Stored in localStorage so the flag persists across tabs and browser
// restarts (so the animation plays only once per browser). Note this does NOT
// cross browsers or devices -- that would require server-side state. Returns
// false (i.e. "let it play") if localStorage is unavailable (some privacy
// modes) -- acceptable degradation.
const hasPlayed = (): boolean => {
  if (typeof window === 'undefined') return false;
  try {
    return (
      window.localStorage.getItem(
        LOGO_TRANSITION_OVERLAY_PLAYED_STORAGE_KEY,
      ) === '1'
    );
  } catch {
    return false;
  }
};

const markPlayed = (): void => {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(
      LOGO_TRANSITION_OVERLAY_PLAYED_STORAGE_KEY,
      '1',
    );
  } catch {
    // localStorage unavailable; the next mount will play the animation
    // again. Acceptable.
  }
};

/**
 * Logo Transition Overlay.
 *
 * Plays a one-shot logo-transition animation (an animated AVIF with alpha,
 * rendered in an `<img>`) over the full viewport, then fades out and hands off
 * to an existing on-page SVG element via a FLIP-style animation. The SVG is
 * layered behind the animation from the moment of mount, sized and positioned
 * to match the animation's final frame, so the animation->SVG hand-off is
 * pixel-seamless across viewports.
 *
 * Because an animated `<img>` fires no `playing`/`ended` events (unlike
 * `<video>`), playback start is detected via `onLoad` and the end of playback
 * is driven by a timer matched to the asset's known `animationDurationMs`. The
 * AVIF is authored to play once and freeze on its last frame.
 *
 * Honors `prefers-reduced-motion` (renders null). ESC and the close button
 * dismiss the overlay. The overlay enforces a singleton at the module scope.
 *
 * Marked `'use client'`: depends on matchMedia, the DOM, and timers.
 */
const LogoTransitionOverlay: React.FunctionComponent<
  LogoTransitionOverlayProps
> = ({
  mediaSrc,
  svgSrc,
  mediaAspectRatio,
  destinationSelector,
  mediaEndFrameLogoNormalizedRect,
  animationDurationMs = DEFAULT_ANIMATION_DURATION_MS,
  closeAriaLabel = DEFAULT_CLOSE_ARIA_LABEL,
  dialogAriaLabel = DEFAULT_DIALOG_ARIA_LABEL,
  loadTimeoutMs = DEFAULT_LOAD_TIMEOUT_MS,
  postPlayHoldMs = DEFAULT_POST_PLAY_HOLD_MS,
  onDismiss,
  onActiveChange,
}) => {
  const dialogId = useId();

  // shouldRender starts as `false` so the first render produces the same
  // output on the server (no dialog) and on the first client paint (no
  // dialog). After hydration completes, the effect below decides whether to
  // render the dialog -- this avoids a SSR/CSR hydration mismatch that would
  // otherwise occur because matchMedia/prefersReducedMotion is browser-only.
  const [shouldRender, setShouldRender] = useState(false);
  const claimedSingleton = useRef(false);

  useEffect(() => {
    // Post-hydration decision. Reduced motion, a sibling instance, or a
    // prior playthrough in this browser all bypass the overlay.
    if (prefersReducedMotion()) {
      onDismiss?.();
      return;
    }
    if (isSingletonMounted) {
      reportFailure('multiple-instances');
      onDismiss?.();
      return;
    }
    if (hasPlayed()) {
      // The visitor has already seen the logo-transition animation in this
      // browser. Show the page normally with the real header logo and skip
      // the overlay entirely.
      onDismiss?.();
      return;
    }

    // Claim the singleton up-front so a second instance mounting while we
    // decode is still rejected.
    isSingletonMounted = true;
    claimedSingleton.current = true;

    // Decode-gate: fetch + decode the animation OFF-SCREEN before revealing the
    // overlay, so the first frame paints the instant the overlay appears -- no
    // empty-backdrop wait, no mid-load skip, and no timer-vs-paint drift on slow
    // connections. Bounded by loadTimeoutMs: if the asset is too slow or cannot
    // be decoded, skip gracefully and let the page render with the normal header
    // logo (the same outcome a load failure/timeout produced before).
    // markPlayed() fires only once we commit to showing it.
    let settled = false;
    const releaseSingleton = () => {
      if (claimedSingleton.current) {
        isSingletonMounted = false;
        claimedSingleton.current = false;
      }
    };
    const skip = (reason: LogoTransitionOverlayFailureReason) => {
      reportFailure(reason);
      releaseSingleton();
      onDismiss?.();
    };

    const preload = new Image();
    preload.src = mediaSrc;

    // If decode hasn't finished within loadTimeoutMs, skip gracefully.
    const timeoutId = window.setTimeout(() => {
      if (settled) return;
      settled = true;
      skip('media-load-timeout');
    }, loadTimeoutMs);

    preload
      .decode()
      .then(() => {
        if (settled) return;
        settled = true;
        window.clearTimeout(timeoutId);
        markPlayed();
        setShouldRender(true);
      })
      .catch(() => {
        if (settled) return;
        settled = true;
        window.clearTimeout(timeoutId);
        skip('media-load-failed');
      });

    return () => {
      // Unmounted (or re-run): cancel the timeout, ignore any late decode
      // callback, and release the singleton if we still hold it.
      settled = true;
      window.clearTimeout(timeoutId);
      releaseSingleton();
    };
    // Effect deliberately runs once on mount; props are captured at that point.
  }, []);

  // Notify consumers when the logo-transition animation starts/stops, so
  // they can e.g. hide the real header logo while the SVG is flying into
  // its place. Active becomes true once we've committed to render (i.e.
  // shouldRender flipped to true); becomes false on unmount.
  useEffect(() => {
    if (!shouldRender) return;
    onActiveChange?.(true);
    return () => {
      onActiveChange?.(false);
    };
  }, [shouldRender, onActiveChange]);

  const [phase, setPhase] = useState<Phase>('loading');
  const [handoffStyle, setHandoffStyle] = useState<React.CSSProperties | null>(
    null,
  );
  const [handoffRunning, setHandoffRunning] = useState(false);
  // Transform applied to .mediaWrapper during 'handoff' so the animation's
  // logo region flies to the header alongside the SVG. Computed once at handoff
  // start; null otherwise.
  const [mediaHandoffTransform, setMediaHandoffTransform] = useState<
    string | null
  >(null);

  const dialogRef = useRef<HTMLDivElement>(null);
  const mediaRef = useRef<HTMLImageElement>(null);

  // Body scroll lock is active until we begin the hand-off (so the page
  // doesn't scroll while the modal is the focus of attention).
  useBodyScrollLock(shouldRender && phase !== 'handoff' && phase !== 'done');

  useFocusTrap(dialogRef as React.RefObject<HTMLElement>);

  // Auto-fade trigger: kicks off the modal/animation fade and the eventual
  // FLIP to the header. Used only by the post-play hold timeout below -- user-
  // initiated dismissals skip straight to 'done' (see dismissImmediately).
  const beginFadeOut = useCallback(() => {
    setPhase(currentPhase => {
      if (
        currentPhase === 'fading' ||
        currentPhase === 'handoff' ||
        currentPhase === 'done'
      ) {
        return currentPhase;
      }
      return 'fading';
    });
  }, []);

  // User-initiated dismissal: jump straight to 'done', which unmounts the
  // dialog and the in-transit SVG in the same render pass and fires
  // onActiveChange(false) so the real header logo reveals immediately.
  // No fade-out animations are played.
  const dismissImmediately = useCallback(() => {
    setPhase('done');
  }, []);

  useEscapeKeyHandler(shouldRender ? dismissImmediately : undefined);

  // End-of-playback timer. An animated <img> fires no `ended` event, so we
  // drive the transition off the asset's known animation duration: once the
  // image has begun playing ('playing'), wait animationDurationMs and then
  // move to 'holding' (the brief final-frame dwell) just as <video>'s onEnded
  // used to. The AVIF is authored to play once and freeze on its last frame,
  // so the frame on screen when this fires is the final logo.
  useEffect(() => {
    if (phase !== 'playing') return;
    const id = window.setTimeout(() => {
      setPhase(currentPhase =>
        currentPhase === 'playing' ? 'holding' : currentPhase,
      );
    }, animationDurationMs);
    return () => window.clearTimeout(id);
  }, [phase, animationDurationMs]);

  // Schedule the fade-out after postPlayHoldMs once the animation has finished
  // playing and we're holding on its final frame.
  useEffect(() => {
    if (phase !== 'holding') return;
    const id = window.setTimeout(beginFadeOut, postPlayHoldMs);
    return () => window.clearTimeout(id);
  }, [phase, postPlayHoldMs, beginFadeOut]);

  // Begin playback once the decode-gate commits to rendering (shouldRender
  // flips true after the off-screen decode resolves). The rendered <img> is
  // already decoded, so it paints its first frame immediately; arming 'playing'
  // here keeps the animationDurationMs timer in lockstep with that first frame.
  // (markPlayed() and the load timeout are handled by the decode-gate in the
  // mount-decision effect above, so there is no separate load-timeout here.)
  useEffect(() => {
    if (shouldRender && phase === 'loading') {
      setPhase('playing');
    }
  }, [shouldRender, phase]);

  // When 'fading' phase is entered, the animation fades out IN PLACE (it does
  // not travel) while the SVG sitting behind it fades in (both over
  // DEFAULT_FADE_OUT_MS). Only once the animation has fully faded to transparent
  // -- i.e. after DEFAULT_HANDOFF_TRIGGER_MS, which equals DEFAULT_FADE_OUT_MS --
  // do we enter 'handoff', where the now-fully-revealed SVG (and only the SVG)
  // flies to the header. Revealing the stationary SVG first, then moving just
  // it, avoids any drift between the animation frame and the SVG during travel.
  // The grey background stays full through fading so the SVG reads cleanly
  // against it, then fades to nothing during the handoff travel.
  useEffect(() => {
    if (phase !== 'fading') return;
    const id = window.setTimeout(
      () => setPhase('handoff'),
      DEFAULT_HANDOFF_TRIGGER_MS,
    );
    return () => window.clearTimeout(id);
  }, [phase]);

  // When the 'handoff' phase begins, measure the destination element and fly
  // BOTH the SVG and the animation's .mediaWrapper to it, in lockstep, while
  // they crossfade (the animation fades out by the midpoint, the SVG fades in).
  // If no destination is found, skip the travel and unmount.
  useEffect(() => {
    if (phase !== 'handoff') return;
    if (typeof document === 'undefined') {
      setPhase('done');
      return;
    }
    const destination = document.querySelector(
      destinationSelector,
    ) as HTMLElement | null;
    if (!destination) {
      reportFailure('destination-not-found');
      setPhase('done');
      return;
    }
    const destinationRect = destination.getBoundingClientRect();
    // Move the SVG from its current absolute position (the animation's
    // final-frame logo rect) to the destination's rect. CSS uses
    // left/top/width/height rather than transform to keep the math simple and
    // the result pixel-accurate.
    setHandoffStyle(prev => {
      return {
        ...prev,
        left: destinationRect.left,
        top: destinationRect.top,
        width: destinationRect.width,
        height: destinationRect.height,
      };
    });
    // Compute the matching FLIP for the media wrapper so the animation's logo
    // region tracks the SVG. Maps the wrapper's logo sub-rect (per
    // mediaEndFrameLogoNormalizedRect) onto destinationRect; the AVIF's alpha
    // background hides the rest of the (now-shrunken) frame.
    const mediaRect = mediaRef.current?.getBoundingClientRect();
    if (mediaRect && mediaRect.width > 0) {
      const logoLeft =
        mediaRect.left + mediaEndFrameLogoNormalizedRect.x * mediaRect.width;
      const logoTop =
        mediaRect.top + mediaEndFrameLogoNormalizedRect.y * mediaRect.height;
      const logoWidth = mediaEndFrameLogoNormalizedRect.width * mediaRect.width;
      const scale = destinationRect.width / logoWidth;
      const dx = destinationRect.left - logoLeft;
      const dy = destinationRect.top - logoTop;
      setMediaHandoffTransform(`translate(${dx}px, ${dy}px) scale(${scale})`);
    }
    setHandoffRunning(true);
    const id = window.setTimeout(() => setPhase('done'), DEFAULT_HANDOFF_MS);
    return () => window.clearTimeout(id);
  }, [phase, destinationSelector, mediaEndFrameLogoNormalizedRect]);

  // Unmount on terminal phases. Also notify onActiveChange immediately so
  // the header logo can reveal at the moment the FLIP completes (rather
  // than waiting for the parent to actually unmount this component).
  useEffect(() => {
    if (isTerminalPhase(phase)) {
      onActiveChange?.(false);
      onDismiss?.();
    }
  }, [phase, onActiveChange, onDismiss]);

  // Singleton flag is released in the cleanup of the mount-decision effect
  // above; no extra cleanup needed here.

  // The wrapper is intrinsic-sized to (animation + padding). The image itself
  // has an explicit width baked into the SCSS, so no inline sizing is
  // needed here. We keep aspect-ratio + min-width as defensive defaults so
  // the wrapper doesn't collapse before the image loads.
  const mediaWrapperStyle = useMemo<React.CSSProperties>(() => {
    return {
      // Pre-load placeholder. After the image loads, its intrinsic
      // dimensions drive the wrapper's content size.
      aspectRatio: `${mediaAspectRatio}`,
    };
  }, [mediaAspectRatio]);

  // Compute the SVG's initial absolute position.
  //   left:   aligned to the animation's logo content area (rect.left +
  //           normalizedRect.x * rect.width). This preserves the
  //           seamless visual match between the animation's final-frame logo
  //           and the SVG.
  //   top:    centered in the viewport. The animation's logo is not
  //           necessarily vertically centered within its frame, so deriving y
  //           from the normalized rect produces a misalignment; viewport
  //           center matches the user's stated intent.
  //   width / height: from the normalized rect's width/height fractions
  //                   of the animation's measured dimensions.
  const computeSvgInitialStyle = useCallback((): React.CSSProperties | null => {
    const media = mediaRef.current;
    if (!media) return null;
    if (typeof window === 'undefined') return null;
    const rect = media.getBoundingClientRect();
    const svgWidth = mediaEndFrameLogoNormalizedRect.width * rect.width;
    const svgHeight = mediaEndFrameLogoNormalizedRect.height * rect.height;
    return {
      left: rect.left + mediaEndFrameLogoNormalizedRect.x * rect.width,
      top: (window.innerHeight - svgHeight) / 2,
      width: svgWidth,
      height: svgHeight,
    };
  }, [mediaEndFrameLogoNormalizedRect]);

  // On entering 'playing' phase, set the SVG's initial style. The SVG remains
  // at this position through the fade-out; the handoff effect above mutates
  // it to the destination's rect.
  useEffect(() => {
    if (phase !== 'playing' && phase !== 'holding') return;
    const initialStyle = computeSvgInitialStyle();
    if (initialStyle) setHandoffStyle(initialStyle);
  }, [phase, computeSvgInitialStyle]);

  // Re-measure on viewport resize while the SVG is sitting at the modal-
  // center position so it stays aligned to the animation if the viewport
  // changes.
  useEffect(() => {
    if (phase !== 'playing' && phase !== 'holding' && phase !== 'fading') {
      return;
    }
    const handleResize = () => {
      const initialStyle = computeSvgInitialStyle();
      if (initialStyle && !handoffRunning) setHandoffStyle(initialStyle);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [phase, computeSvgInitialStyle, handoffRunning]);

  if (!shouldRender) {
    // Reduced motion or singleton conflict: render nothing. Fire onDismiss
    // synchronously so callers that wait on it can unmount cleanly.
    return null;
  }

  if (isTerminalPhase(phase)) {
    return null;
  }

  return (
    <div
      ref={dialogRef}
      role="dialog"
      aria-modal="true"
      aria-label={dialogAriaLabel}
      id={dialogId}
      // Emit the TS timing constants as CSS custom properties so the SCSS
      // transition durations stay in lockstep with the JS timers without
      // duplicating the magic numbers. These cascade to every descendant
      // (media wrapper, image, close button, hand-off SVG).
      style={
        {
          '--lto-handoff-ms': `${DEFAULT_HANDOFF_MS}ms`,
          '--lto-fade-out-ms': `${DEFAULT_FADE_OUT_MS}ms`,
          '--lto-crossfade-ms': `${DEFAULT_CROSSFADE_MS}ms`,
        } as React.CSSProperties
      }
      className={classnames(
        moduleStyles.overlayRoot,
        phase === 'fading' && moduleStyles['overlayRoot--fading'],
        // The backdrop fades during 'handoff' (in parallel with the SVG
        // moving to the header), so the transparent SVG is always over
        // a backdrop (full during fading, fading-to-zero during handoff)
        // and never over fully-revealed page content.
        phase === 'handoff' && moduleStyles['overlayRoot--backdropFading'],
      )}
    >
      <CloseButton
        aria-label={closeAriaLabel}
        onClick={dismissImmediately}
        className={classnames(
          moduleStyles.closeButton,
          // The close button fades together with the modal box.
          (phase === 'fading' || phase === 'handoff') &&
            moduleStyles['closeButton--fading'],
        )}
        size="l"
        color="dark"
      />
      <div
        className={classnames(
          moduleStyles.mediaWrapper,
          // The animation fades out during the hand-off (to 0 by the midpoint
          // of the travel) and stays gone for the rest of it.
          (phase === 'fading' || phase === 'handoff') &&
            moduleStyles['mediaWrapper--fading'],
          // During 'handoff' the wrapper FLIPs to the header in lockstep with
          // the SVG (inline transform below), so the animation's logo region
          // tracks the SVG as both shrink toward the destination.
          phase === 'handoff' && moduleStyles['mediaWrapper--running'],
        )}
        style={{
          ...mediaWrapperStyle,
          transform: mediaHandoffTransform ?? undefined,
        }}
      >
        <img
          ref={mediaRef}
          src={mediaSrc}
          // Decorative: the dialog's aria-label conveys the purpose; the
          // animation itself carries no additional meaning for AT.
          alt=""
          aria-hidden="true"
          decoding="async"
          draggable={false}
          // Opacity fade is owned by the parent .mediaWrapper (single curve);
          // the <img> itself does not fade. The src is already decoded (the
          // decode-gate in the mount effect ran before we rendered), so it
          // paints from cache immediately -- no load event is needed to drive
          // playback. onError is a defensive net only: if the cached frame
          // somehow fails to render, skip to the header.
          className={moduleStyles.mediaElement}
          onError={() => {
            reportFailure('media-load-failed');
            setPhase('failed');
          }}
        />
      </div>
      {handoffStyle && (
        // SVG is a sibling of mediaWrapper (not a child) so the modal
        // box's opacity fade during 'fading' does NOT cascade to the SVG
        // via CSS opacity inheritance. The SVG fades in (revealed behind the
        // animation) while the animation fades out, then stays put against the
        // dark backdrop until the travel-to-header begins.
        <img
          src={svgSrc}
          alt=""
          aria-hidden="true"
          className={classnames(
            moduleStyles.handoffSvg,
            // Visible from 'fading' onward: opacity 1.
            (phase === 'fading' || phase === 'handoff') &&
              moduleStyles['handoffSvg--visible'],
            handoffRunning && moduleStyles['handoffSvg--running'],
          )}
          style={{
            position: 'fixed',
            ...handoffStyle,
          }}
        />
      )}
    </div>
  );
};

export default LogoTransitionOverlay;

// Test-only helper to reset the module-scoped singleton flag between tests.
// Not exported from the public index; tests import directly from this file.
export const __resetSingletonForTests = () => {
  isSingletonMounted = false;
};
