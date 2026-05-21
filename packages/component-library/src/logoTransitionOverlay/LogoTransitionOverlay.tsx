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
  DEFAULT_CLOSE_ARIA_LABEL,
  DEFAULT_DIALOG_ARIA_LABEL,
  DEFAULT_FADE_OUT_MS,
  DEFAULT_HANDOFF_MS,
  DEFAULT_LOAD_TIMEOUT_MS,
  DEFAULT_POST_PLAY_HOLD_MS,
} from './constants';

import moduleStyles from './logoTransitionOverlay.module.scss';

// Module-scoped singleton guard. Only one overlay may be active at a time.
let isSingletonMounted = false;

export interface NormalizedRect {
  /** 0..1 fraction of the video's displayed width */
  x: number;
  /** 0..1 fraction of the video's displayed height */
  y: number;
  /** 0..1 fraction of the video's displayed width */
  width: number;
  /** 0..1 fraction of the video's displayed height */
  height: number;
}

export interface LogoTransitionOverlayProps {
  /** Static URL for the bundled logo-transition MP4. The file must have no
   *  audio track (or be safely muted) so the browser allows autoplay. */
  videoSrc: string;
  /** Static URL for the destination SVG logo. */
  svgSrc: string;
  /** Video aspect ratio (width / height). The video is rendered into a
   *  centered box that preserves this ratio while metadata loads. */
  videoAspectRatio: number;
  /** CSS selector identifying the on-page element the SVG must animate into
   *  on hand-off (e.g. `'[data-logo-transition-target]'`). */
  destinationSelector: string;
  /** The on-screen position+size of the video's final-frame logo, expressed
   *  as fractions of the video's displayed dimensions. */
  videoEndFrameLogoNormalizedRect: NormalizedRect;
  /** ARIA label for the close button. */
  closeAriaLabel?: string;
  /** ARIA label for the modal dialog. */
  dialogAriaLabel?: string;
  /** Bounded wait for the video to start playing before falling back to "no
   *  overlay". Covers both slow downloads and silent autoplay rejections. */
  loadTimeoutMs?: number;
  /** Milliseconds to hold on the video's final frame after `ended` fires,
   *  before the fade-out crossfade begins. Lets the visitor register the
   *  destination logo before the modal starts dissolving. */
  postPlayHoldMs?: number;
  /** Optional callback invoked after the overlay unmounts. */
  onDismiss?: () => void;
  /** Optional callback fired with `true` when the overlay decides to render
   *  (post-hydration, not bypassed by reduced motion / singleton guard), and
   *  with `false` when the FLIP hand-off completes (phase 'done'/'failed'/
   *  'skipped') or the component unmounts. Consumers can use this to e.g.
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
  | 'skipped'
  | 'failed';

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

// Has the visitor already seen the logo-transition animation in this tab?
// Stored in sessionStorage so the flag clears at end-of-session. Returns
// false (i.e. "let it play") if sessionStorage is unavailable (some privacy
// modes) -- acceptable degradation.
const hasPlayedThisSession = (): boolean => {
  if (typeof window === 'undefined') return false;
  try {
    return (
      window.sessionStorage.getItem(
        LOGO_TRANSITION_OVERLAY_PLAYED_STORAGE_KEY,
      ) === '1'
    );
  } catch {
    return false;
  }
};

const markPlayedThisSession = (): void => {
  if (typeof window === 'undefined') return;
  try {
    window.sessionStorage.setItem(
      LOGO_TRANSITION_OVERLAY_PLAYED_STORAGE_KEY,
      '1',
    );
  } catch {
    // sessionStorage unavailable; the next mount will play the animation
    // again. Acceptable.
  }
};

/**
 * Logo Transition Overlay.
 *
 * Plays a one-shot logo-transition video over the full viewport, then fades
 * out and hands off to an existing on-page SVG element via a FLIP-style
 * animation. The SVG is layered behind the video from the moment of mount,
 * sized and positioned to match the video's final frame, so the video→SVG
 * hand-off is pixel-seamless across viewports.
 *
 * Honors `prefers-reduced-motion` (renders null). ESC and the close button
 * dismiss the overlay. The overlay enforces a singleton at the module scope.
 *
 * Marked `'use client'`: depends on matchMedia, the DOM, and timers.
 */
const LogoTransitionOverlay: React.FunctionComponent<
  LogoTransitionOverlayProps
> = ({
  videoSrc,
  svgSrc,
  videoAspectRatio,
  destinationSelector,
  videoEndFrameLogoNormalizedRect,
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
    // prior playthrough in this tab session all bypass the overlay;
    // otherwise we claim the singleton and start the play pipeline by
    // flipping shouldRender to true.
    if (prefersReducedMotion()) {
      onDismiss?.();
      return;
    }
    if (isSingletonMounted) {
      reportFailure('multiple-instances');
      onDismiss?.();
      return;
    }
    if (hasPlayedThisSession()) {
      // The visitor has already seen the logo-transition animation in
      // this browser tab. Show the page normally with the real header
      // logo and skip the overlay entirely.
      onDismiss?.();
      return;
    }
    isSingletonMounted = true;
    claimedSingleton.current = true;
    setShouldRender(true);

    return () => {
      if (claimedSingleton.current) {
        isSingletonMounted = false;
        claimedSingleton.current = false;
      }
    };
    // Effect deliberately runs once on mount; onDismiss is captured at that
    // point and any later identity change is ignored.
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

  const dialogRef = useRef<HTMLDivElement>(null);
  const videoWrapperRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const svgRef = useRef<HTMLImageElement>(null);

  // Body scroll lock is active until we begin the hand-off (so the page
  // doesn't scroll while the modal is the focus of attention).
  useBodyScrollLock(
    shouldRender && phase !== 'handoff' && phase !== 'done',
  );

  useFocusTrap(dialogRef as React.RefObject<HTMLElement>);

  // Auto-fade trigger: kicks off the modal/video fade and the eventual FLIP
  // to the header. Used only by the post-play hold timeout below -- user-
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

  // Schedule the fade-out after postPlayHoldMs once the video has finished
  // playing and we're holding on its final frame.
  useEffect(() => {
    if (phase !== 'holding') return;
    const id = window.setTimeout(beginFadeOut, postPlayHoldMs);
    return () => window.clearTimeout(id);
  }, [phase, postPlayHoldMs, beginFadeOut]);

  // Note: markPlayedThisSession() is called synchronously inside the
  // video's onPlaying handler (see JSX below) rather than in a phase-driven
  // useEffect. React batches state updates inside fake-timer-driven test
  // runs (and in real-world rapid sequences), so a useEffect keyed on phase
  // can skip intermediate states like 'playing' entirely. Calling mark
  // inline at onPlaying guarantees the mark fires on every successful play.

  // Bounded load/autoplay timeout: if the video has not begun playing
  // within loadTimeoutMs, give up and let the page render with the standard
  // header logo (no overlay). Covers both slow downloads and silent
  // autoplay rejections.
  useEffect(() => {
    if (phase !== 'loading') return;
    const id = window.setTimeout(() => {
      reportFailure('video-load-timeout');
      setPhase('failed');
    }, loadTimeoutMs);
    return () => window.clearTimeout(id);
  }, [phase, loadTimeoutMs]);

  // When 'fading' phase is entered, the video and the white modal box fade
  // out together while the SVG fades in (all DEFAULT_FADE_OUT_MS). The
  // dark backdrop stays full through this phase so the transparent SVG
  // reads cleanly against it. After the fade completes we enter 'handoff'
  // where the SVG flies to the header and the backdrop fades to nothing
  // in parallel.
  useEffect(() => {
    if (phase !== 'fading') return;
    const id = window.setTimeout(
      () => setPhase('handoff'),
      DEFAULT_FADE_OUT_MS,
    );
    return () => window.clearTimeout(id);
  }, [phase]);

  // When the 'handoff' phase begins, measure the destination element and
  // animate the SVG to it. If no destination is found, skip the FLIP and
  // unmount.
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
    // Set the transform to translate+scale from the SVG's current absolute
    // position (videoEndFrameLogo) to the destination's rect.
    setHandoffStyle(prev => {
      // We compute target absolute position; CSS uses left/top/width/height
      // for the destination rect rather than transform to keep the math simple
      // and the result pixel-accurate.
      return {
        ...prev,
        left: destinationRect.left,
        top: destinationRect.top,
        width: destinationRect.width,
        height: destinationRect.height,
      };
    });
    setHandoffRunning(true);
    const id = window.setTimeout(() => setPhase('done'), DEFAULT_HANDOFF_MS);
    return () => window.clearTimeout(id);
  }, [phase, destinationSelector]);

  // Unmount on terminal phases. Also notify onActiveChange immediately so
  // the header logo can reveal at the moment the FLIP completes (rather
  // than waiting for the parent to actually unmount this component).
  useEffect(() => {
    if (phase === 'done' || phase === 'failed' || phase === 'skipped') {
      onActiveChange?.(false);
      onDismiss?.();
    }
  }, [phase, onActiveChange, onDismiss]);

  // Singleton flag is released in the cleanup of the mount-decision effect
  // above; no extra cleanup needed here.

  // The wrapper is intrinsic-sized to (video + padding). The video itself
  // has an explicit width baked into the SCSS, so no inline sizing is
  // needed here. We keep aspect-ratio + min-width as defensive defaults so
  // the wrapper doesn't collapse before the video metadata loads.
  const videoWrapperStyle = useMemo<React.CSSProperties>(() => {
    return {
      // Pre-load placeholder. After metadata loads, the video's intrinsic
      // dimensions drive the wrapper's content size.
      aspectRatio: `${videoAspectRatio}`,
    };
  }, [videoAspectRatio]);

  // Compute the SVG's initial absolute position.
  //   left:   aligned to the video's logo content area (rect.left +
  //           normalizedRect.x * rect.width). This preserves the
  //           seamless visual match between the video's final-frame logo
  //           and the SVG.
  //   top:    centered in the viewport. The video's logo is not necessarily
  //           vertically centered within its frame, so deriving y from the
  //           normalized rect produces a misalignment; viewport center
  //           matches the user's stated intent.
  //   width / height: from the normalized rect's width/height fractions
  //                   of the video's measured dimensions.
  const computeSvgInitialStyle = useCallback((): React.CSSProperties | null => {
    const video = videoRef.current;
    if (!video) return null;
    if (typeof window === 'undefined') return null;
    const rect = video.getBoundingClientRect();
    const svgWidth = videoEndFrameLogoNormalizedRect.width * rect.width;
    const svgHeight = videoEndFrameLogoNormalizedRect.height * rect.height;
    return {
      left: rect.left + videoEndFrameLogoNormalizedRect.x * rect.width,
      top: (window.innerHeight - svgHeight) / 2,
      width: svgWidth,
      height: svgHeight,
    };
  }, [videoEndFrameLogoNormalizedRect]);

  // On entering 'playing' phase, set the SVG's initial style. The SVG remains
  // at this position through the fade-out; the handoff effect above mutates
  // it to the destination's rect.
  useEffect(() => {
    if (phase !== 'playing' && phase !== 'holding') return;
    const initialStyle = computeSvgInitialStyle();
    if (initialStyle) setHandoffStyle(initialStyle);
  }, [phase, computeSvgInitialStyle]);

  // Re-measure on viewport resize while the SVG is sitting at the modal-
  // center position so it stays aligned to the video if the viewport
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

  if (phase === 'done' || phase === 'failed' || phase === 'skipped') {
    return null;
  }

  return (
    <div
      ref={dialogRef}
      role="dialog"
      aria-modal="true"
      aria-label={dialogAriaLabel}
      id={dialogId}
      className={classnames(
        moduleStyles.overlayRoot,
        phase === 'fading' && moduleStyles['overlayRoot--fading'],
        // The backdrop fades during 'handoff' (in parallel with the SVG
        // moving to the header), so the transparent SVG is always over
        // a backdrop (full during fading, fading-to-zero during handoff)
        // and never over fully-revealed page content.
        phase === 'handoff' &&
          moduleStyles['overlayRoot--backdropFading'],
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
        ref={videoWrapperRef}
        className={classnames(
          moduleStyles.videoWrapper,
          // Modal box fades during 'fading' (alongside the video) and
          // stays gone during 'handoff'.
          (phase === 'fading' || phase === 'handoff') &&
            moduleStyles['videoWrapper--fading'],
        )}
        style={videoWrapperStyle}
      >
        <video
          ref={videoRef}
          src={videoSrc}
          autoPlay
          muted
          playsInline
          preload="auto"
          // Disable native PiP / right-click / download affordances so the
          // overlay reads as a chromeless animation, not a media player.
          disablePictureInPicture
          disableRemotePlayback
          controlsList="nodownload nofullscreen noremoteplayback"
          className={classnames(
            moduleStyles.videoElement,
            phase === 'fading' && moduleStyles['videoElement--fading'],
          )}
          onPlaying={() => {
            // The video has actually begun rendering frames -- this is
            // the canonical "played" moment. Stamp the session flag
            // synchronously so subsequent mounts in the same tab short-
            // circuit. Calling mark here rather than in a phase-driven
            // useEffect avoids a race where React batches phase
            // transitions across fake-timer advances (or rapid real-world
            // sequences) and the 'playing' state is never observed by an
            // effect.
            markPlayedThisSession();
            setPhase(currentPhase => {
              if (currentPhase === 'loading') return 'playing';
              return currentPhase;
            });
          }}
          onEnded={() => {
            setPhase(currentPhase => {
              if (
                currentPhase === 'loading' ||
                currentPhase === 'playing'
              ) {
                return 'holding';
              }
              return currentPhase;
            });
          }}
          onError={() => {
            reportFailure('video-load-failed');
            setPhase('failed');
          }}
        />
      </div>
      {handoffStyle && (
        // SVG is a sibling of videoWrapper (not a child) so the modal
        // box's opacity fade during 'fading' does NOT cascade to the SVG
        // via CSS opacity inheritance. The SVG fades in while the modal
        // box fades out, then stays put against the dark backdrop until
        // the FLIP-to-header begins.
        <img
          ref={svgRef}
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
