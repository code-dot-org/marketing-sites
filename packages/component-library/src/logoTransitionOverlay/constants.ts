export const LOGO_TRANSITION_MODAL_FEATURE_TAG = 'logo-transition-modal';

export type LogoTransitionOverlayFailureReason =
  | 'video-load-failed'
  | 'video-load-timeout'
  | 'multiple-instances'
  | 'destination-not-found';

export const DEFAULT_LOAD_TIMEOUT_MS = 2000;
// Milliseconds the video's final frame is held on screen after `ended`
// fires, before the crossfade to the SVG begins. Lets the visitor
// register the destination logo before the modal starts dissolving.
export const DEFAULT_POST_PLAY_HOLD_MS = 3000;
// Duration of the combined video + modal-box fade out / SVG fade-in.
// During this phase the backdrop stays at full opacity so the SVG is
// revealed against a solid dark background -- its transparent regions
// read cleanly without exposing page content underneath. Must stay in
// sync with the .videoElement transition, .videoWrapper transition, and
// .handoffSvg opacity transition durations in logoTransitionOverlay.
// module.scss.
export const DEFAULT_FADE_OUT_MS = 1200;
// Duration of the SVG's FLIP translate+scale to the header destination,
// which is also the duration of the backdrop's background-color fade
// to transparent. The two run simultaneously so the SVG is sliding
// under a backdrop that is itself disappearing. Must stay in sync with
// the .handoffSvg--running and .overlayRoot CSS transitions.
export const DEFAULT_HANDOFF_MS = 1500;
export const DEFAULT_DIALOG_ARIA_LABEL =
  'Code.org logo logo-transition animation';
export const DEFAULT_CLOSE_ARIA_LABEL = 'Close';

// Session-scoped sessionStorage key that records "the visitor has seen the
// logo-transition animation in this browser tab". Set as soon as the GIF
// successfully starts playing; read at mount to short-circuit the overlay
// (so a re-mount within the same session does nothing). Functional, non-
// tracking marker -- no PII, scoped to one tab.
export const LOGO_TRANSITION_OVERLAY_PLAYED_STORAGE_KEY =
  'logo-transition-overlay:played';
