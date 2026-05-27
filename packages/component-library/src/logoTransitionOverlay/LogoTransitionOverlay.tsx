'use client';

import classnames from 'classnames';
import {useCallback, useEffect, useId, useMemo, useRef, useState} from 'react';

import CloseButton from '@/closeButton';
import useBodyScrollLock from '@/common/hooks/useBodyScrollLock';
import useEscapeKeyHandler from '@/common/hooks/useEscapeKeyHandler';
import useFocusTrap from '@/common/hooks/useFocusTrap';

import {
  LOGO_TRANSITION_MODAL_FEATURE_TAG,
  LOGO_TRANSITION_OVERLAY_SESSION_STORAGE_KEY,
  LOGO_TRANSITION_OVERLAY_SHOWS_STORAGE_KEY,
  LogoTransitionOverlayFailureReason,
  DEFAULT_ANIMATION_DURATION_MS,
  DEFAULT_CLOSE_ARIA_LABEL,
  DEFAULT_CROSSFADE_MS,
  DEFAULT_DIALOG_ARIA_LABEL,
  DEFAULT_FADE_OUT_MS,
  DEFAULT_HANDOFF_MS,
  DEFAULT_HANDOFF_TRIGGER_MS,
  DEFAULT_LOAD_TIMEOUT_MS,
  DEFAULT_MAX_SHOWS_PER_WINDOW,
  DEFAULT_POST_PLAY_HOLD_MS,
  DEFAULT_SHOW_WINDOW_MS,
} from './constants';

import moduleStyles from './logoTransitionOverlay.module.scss';

// Only one overlay may be active at a time.
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
  /** Animation URL. In marketing this is an animated AVIF with alpha rendered
   *  in an `<img>` (the decoder handles transparency); any animated image
   *  format works. */
  mediaSrc: string;
  /** Static URL for the destination SVG logo. */
  svgSrc: string;
  /** Animation aspect ratio (width / height); sizes the centered box while it
   *  loads. */
  mediaAspectRatio: number;
  /** CSS selector for the on-page element the SVG flies into on hand-off. */
  destinationSelector: string;
  /** On-screen position+size of the animation's final-frame logo, as fractions
   *  of the animation's displayed dimensions. */
  mediaEndFrameLogoNormalizedRect: NormalizedRect;
  /** Playback length. An animated `<img>` has no `ended` event, so a timer of
   *  this length stands in for it; MUST match the asset's true duration. */
  animationDurationMs?: number;
  /** ARIA label for the close button. */
  closeAriaLabel?: string;
  /** ARIA label for the modal dialog. */
  dialogAriaLabel?: string;
  /** Bounded wait for load+decode before skipping the overlay. */
  loadTimeoutMs?: number;
  /** Hold on the final frame after playback before the fade begins. */
  postPlayHoldMs?: number;
  /** Max shows per trailing `showWindowMs`, on top of the once-per-session
   *  gate. */
  maxShowsPerWindow?: number;
  /** Rolling window (ms) over which shows are counted; a show ages out this
   *  long after it occurred. */
  showWindowMs?: number;
  /** Called after the overlay unmounts. */
  onDismiss?: () => void;
  /** Fired `true` when the overlay commits to rendering and `false` when the
   *  hand-off completes or it unmounts -- e.g. to hide/reveal the real header
   *  logo as the SVG flies into place. */
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

// Phases after which the overlay renders nothing and is finished.
const TERMINAL_PHASES: ReadonlySet<Phase> = new Set(['done', 'failed']);
const isTerminalPhase = (phase: Phase): boolean => TERMINAL_PHASES.has(phase);

type SentryLike = {
  captureMessage?: (
    message: string,
    options?: {level?: string; tags?: Record<string, string>},
  ) => void;
};

const reportFailure = (reason: LogoTransitionOverlayFailureReason) => {
  // Read Sentry off the global so this works outside @sentry/nextjs (Storybook,
  // tests); fall back to console.warn when it's absent.
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

// Shown already in this tab session? sessionStorage clears at session end, so
// it can play again next session but not twice within one. False ("play") if
// storage is unavailable.
const shownThisSession = (): boolean => {
  if (typeof window === 'undefined') return false;
  try {
    return (
      window.sessionStorage.getItem(
        LOGO_TRANSITION_OVERLAY_SESSION_STORAGE_KEY,
      ) === '1'
    );
  } catch {
    return false;
  }
};

// Show timestamps still within the trailing `windowMs`, from localStorage.
// Drops stale/future/malformed entries so a bad value can't permanently
// suppress the overlay. Read-only; returns [] ("play") on any error.
const getRecentShows = (windowMs: number): number[] => {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(
      LOGO_TRANSITION_OVERLAY_SHOWS_STORAGE_KEY,
    );
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    const now = Date.now();
    return parsed.filter(
      (ts): ts is number =>
        typeof ts === 'number' &&
        Number.isFinite(ts) &&
        ts <= now &&
        now - ts < windowMs,
    );
  } catch {
    return [];
  }
};

// Mark the session flag and append now to the rolling list (pruned on write).
// Best-effort: write failures are swallowed (the next mount just isn't
// throttled).
const recordShow = (windowMs: number): void => {
  if (typeof window === 'undefined') return;
  try {
    window.sessionStorage.setItem(
      LOGO_TRANSITION_OVERLAY_SESSION_STORAGE_KEY,
      '1',
    );
  } catch {
    // Session gate degrades to off.
  }
  try {
    const shows = [...getRecentShows(windowMs), Date.now()];
    window.localStorage.setItem(
      LOGO_TRANSITION_OVERLAY_SHOWS_STORAGE_KEY,
      JSON.stringify(shows),
    );
  } catch {
    // Per-window cap degrades to off.
  }
};

/**
 * Plays a one-shot logo animation (animated AVIF with alpha, in an `<img>`)
 * full-viewport, then fades out and FLIPs to an on-page SVG. The SVG is layered
 * behind the animation from mount, matched to its final frame, so the hand-off
 * is seamless across viewports.
 *
 * An animated `<img>` fires no `ended` event, so end-of-playback is a timer of
 * `animationDurationMs` (the AVIF plays once and freezes on its last frame).
 * Throttled to once per session + `maxShowsPerWindow` per `showWindowMs`
 * (functional, non-tracking storage that degrades toward showing). Honors
 * reduced-motion (renders null); ESC/close dismiss; singleton at module scope.
 * `'use client'`: needs matchMedia, the DOM, and timers.
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
  maxShowsPerWindow = DEFAULT_MAX_SHOWS_PER_WINDOW,
  showWindowMs = DEFAULT_SHOW_WINDOW_MS,
  onDismiss,
  onActiveChange,
}) => {
  const dialogId = useId();

  // Starts false so SSR and the first client paint match (no dialog); the
  // effect below decides post-hydration, avoiding a matchMedia hydration
  // mismatch.
  const [shouldRender, setShouldRender] = useState(false);
  const claimedSingleton = useRef(false);

  useEffect(() => {
    // Reduced motion, a sibling instance, an earlier show this session, or the
    // per-window cap all bypass the overlay.
    if (prefersReducedMotion()) {
      onDismiss?.();
      return;
    }
    if (isSingletonMounted) {
      reportFailure('multiple-instances');
      onDismiss?.();
      return;
    }
    if (shownThisSession()) {
      onDismiss?.();
      return;
    }
    if (getRecentShows(showWindowMs).length >= maxShowsPerWindow) {
      onDismiss?.();
      return;
    }

    // Claim the singleton up-front so a second instance is rejected while we
    // decode.
    isSingletonMounted = true;
    claimedSingleton.current = true;

    // Decode the animation OFF-SCREEN before revealing the overlay, so the first
    // frame paints immediately (no empty-backdrop wait, no timer-vs-paint
    // drift). Bounded by loadTimeoutMs: too slow / undecodable skips gracefully
    // to the normal header. recordShow() fires only once we commit.
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
        recordShow(showWindowMs);
        setShouldRender(true);
      })
      .catch(() => {
        if (settled) return;
        settled = true;
        window.clearTimeout(timeoutId);
        skip('media-load-failed');
      });

    return () => {
      // Cancel the timeout, ignore any late decode, release the singleton.
      settled = true;
      window.clearTimeout(timeoutId);
      releaseSingleton();
    };
    // Runs once on mount; props captured at that point.
  }, []);

  // Tell consumers when the overlay is active (true on commit, false on
  // unmount) so they can hide/reveal the real header logo.
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
  // Transform that flies .mediaWrapper to the header during 'handoff'; computed
  // once at handoff start, null otherwise.
  const [mediaHandoffTransform, setMediaHandoffTransform] = useState<
    string | null
  >(null);

  const dialogRef = useRef<HTMLDivElement>(null);
  const mediaRef = useRef<HTMLImageElement>(null);

  // Lock body scroll until the hand-off begins.
  useBodyScrollLock(shouldRender && phase !== 'handoff' && phase !== 'done');

  useFocusTrap(dialogRef as React.RefObject<HTMLElement>);

  // Auto-fade trigger (post-play hold only; user dismissals jump to 'done').
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

  // User dismissal: jump straight to 'done' (unmounts dialog + in-transit SVG
  // and fires onActiveChange(false) so the header logo reveals at once). No
  // fade.
  const dismissImmediately = useCallback(() => {
    setPhase('done');
  }, []);

  useEscapeKeyHandler(shouldRender ? dismissImmediately : undefined);

  // No `ended` event on an animated <img>, so move to 'holding' a fixed
  // animationDurationMs after playback starts; the frame on screen is the final
  // logo.
  useEffect(() => {
    if (phase !== 'playing') return;
    const id = window.setTimeout(() => {
      setPhase(currentPhase =>
        currentPhase === 'playing' ? 'holding' : currentPhase,
      );
    }, animationDurationMs);
    return () => window.clearTimeout(id);
  }, [phase, animationDurationMs]);

  // After the final-frame hold, begin the fade.
  useEffect(() => {
    if (phase !== 'holding') return;
    const id = window.setTimeout(beginFadeOut, postPlayHoldMs);
    return () => window.clearTimeout(id);
  }, [phase, postPlayHoldMs, beginFadeOut]);

  // Start playback once the decode-gate commits. The <img> is already decoded,
  // so it paints at once; arming 'playing' here keeps the duration timer in
  // lockstep with the first frame.
  useEffect(() => {
    if (shouldRender && phase === 'loading') {
      setPhase('playing');
    }
  }, [shouldRender, phase]);

  // 'fading' is a near-instant hinge into 'handoff' (DEFAULT_HANDOFF_TRIGGER_MS
  // is 0): no static-at-center pause. Animation and SVG then travel together
  // and crossfade, front-loaded over DEFAULT_CROSSFADE_MS (first ~25% of the
  // trip) so the animation drops out while still nearly coincident with the
  // SVG -- no double-image trail. The grey backdrop stays full through fading,
  // then fades during the travel.
  useEffect(() => {
    if (phase !== 'fading') return;
    const id = window.setTimeout(
      () => setPhase('handoff'),
      DEFAULT_HANDOFF_TRIGGER_MS,
    );
    return () => window.clearTimeout(id);
  }, [phase]);

  // On 'handoff', measure the destination and fly BOTH the SVG and
  // .mediaWrapper to it in lockstep (crossfading as above). No destination ->
  // skip the travel and unmount.
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
    // Move the SVG from its current rect to the destination via
    // left/top/width/height (simple, pixel-accurate).
    setHandoffStyle(prev => {
      return {
        ...prev,
        left: destinationRect.left,
        top: destinationRect.top,
        width: destinationRect.width,
        height: destinationRect.height,
      };
    });
    // Matching FLIP for the wrapper: map its logo sub-rect (per
    // mediaEndFrameLogoNormalizedRect) onto destinationRect so the animation's
    // logo tracks the SVG; the AVIF's alpha hides the rest.
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

  // Unmount on terminal phases; fire onActiveChange(false) now so the header
  // logo reveals the moment the FLIP completes.
  useEffect(() => {
    if (isTerminalPhase(phase)) {
      onActiveChange?.(false);
      onDismiss?.();
    }
  }, [phase, onActiveChange, onDismiss]);

  // (Singleton released in the mount effect's cleanup.)

  // The <img> has an explicit width in SCSS; aspect-ratio is a defensive
  // pre-load placeholder so the wrapper doesn't collapse before it loads.
  const mediaWrapperStyle = useMemo<React.CSSProperties>(() => {
    return {
      aspectRatio: `${mediaAspectRatio}`,
    };
  }, [mediaAspectRatio]);

  // SVG's initial absolute position: left aligned to the animation's logo area
  // (so the hand-off start matches the final frame); top centered in the
  // viewport (the logo isn't vertically centered within its frame);
  // width/height from the normalized rect.
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

  // Position the SVG while it sits at center; the handoff effect later moves it
  // to the destination.
  useEffect(() => {
    if (phase !== 'playing' && phase !== 'holding') return;
    const initialStyle = computeSvgInitialStyle();
    if (initialStyle) setHandoffStyle(initialStyle);
  }, [phase, computeSvgInitialStyle]);

  // Keep the centered SVG aligned to the animation across viewport resizes.
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
      // Emit the JS timing constants as CSS vars so SCSS durations can't drift
      // from the JS timers. Cascade to all descendants.
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
        // Backdrop fades during 'handoff' so the SVG is never over fully-
        // revealed page content (it's a sibling, not faded by opacity).
        phase === 'handoff' && moduleStyles['overlayRoot--backdropFading'],
      )}
    >
      <CloseButton
        aria-label={closeAriaLabel}
        onClick={dismissImmediately}
        className={classnames(
          moduleStyles.closeButton,
          (phase === 'fading' || phase === 'handoff') &&
            moduleStyles['closeButton--fading'],
        )}
        size="l"
        color="dark"
      />
      <div
        className={classnames(
          moduleStyles.mediaWrapper,
          // Animation fades out within the first quarter of the travel.
          (phase === 'fading' || phase === 'handoff') &&
            moduleStyles['mediaWrapper--fading'],
          // FLIPs to the header (inline transform below) in lockstep with the
          // SVG.
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
          // Decorative; the dialog's aria-label conveys the purpose.
          alt=""
          aria-hidden="true"
          decoding="async"
          draggable={false}
          // Opacity fade is owned by .mediaWrapper. Already decoded by the mount
          // effect, so it paints from cache; onError is a defensive net.
          className={moduleStyles.mediaElement}
          onError={() => {
            reportFailure('media-load-failed');
            setPhase('failed');
          }}
        />
      </div>
      {handoffStyle && (
        // Sibling of mediaWrapper (not a child) so the box's opacity fade
        // doesn't cascade to it; the SVG crossfades in as the animation fades
        // out.
        <img
          src={svgSrc}
          alt=""
          aria-hidden="true"
          className={classnames(
            moduleStyles.handoffSvg,
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

// Test-only: reset the module-scoped singleton between tests (not publicly
// exported).
export const __resetSingletonForTests = () => {
  isSingletonMounted = false;
};
