export const LOGO_TRANSITION_MODAL_FEATURE_TAG = 'logo-transition-modal';

export type LogoTransitionOverlayFailureReason =
  | 'media-load-failed'
  | 'media-load-timeout'
  | 'multiple-instances'
  | 'destination-not-found';

export const DEFAULT_LOAD_TIMEOUT_MS = 2000;
// Playback length before the final-frame hold. An animated <img> has no `ended`
// event, so a timer of this length stands in for it; MUST match the asset (the
// marketing AVIF is 8s, plays once, freezes on its last frame).
export const DEFAULT_ANIMATION_DURATION_MS = 8000;
// Hold on the final frame after playback before the crossfade begins.
export const DEFAULT_POST_PLAY_HOLD_MS = 3000;
// `--lto-fade-out-ms`: the brief 'fading' tick + the close button fade. (The
// hand-off fade-out is DEFAULT_CROSSFADE_MS, below.)
export const DEFAULT_FADE_OUT_MS = 700;
// Delay from 'fading' to 'handoff'. 0 = no static-at-center pause; animation and
// SVG start travelling together as soon as the post-play hold ends.
export const DEFAULT_HANDOFF_TRIGGER_MS = 0;
// Duration of the translate+resize to the header (both SVG and .mediaWrapper)
// and of the backdrop fade. Drives the JS unmount timer and, via
// `--lto-handoff-ms`, the matching CSS transitions.
export const DEFAULT_HANDOFF_MS = 1500;
// Animation->SVG opacity crossfade during the travel. A quarter of the trip and
// front-loaded (ease-out both ways) so it finishes while the two are still
// nearly coincident -- no double-image trail; the rest of the travel is the
// solid SVG alone. `--lto-crossfade-ms`.
export const DEFAULT_CROSSFADE_MS = DEFAULT_HANDOFF_MS / 4;
export const DEFAULT_DIALOG_ARIA_LABEL =
  'Code.org logo logo-transition animation';
export const DEFAULT_CLOSE_ARIA_LABEL = 'Close';

// Throttle state (see shownThisSession / getRecentShows / recordShow). Two
// functional, non-tracking, no-PII markers, written only once a show commits;
// neither crosses browsers/devices, and both degrade toward "let it play" when
// storage is unavailable.

// sessionStorage flag (== '1') once shown in this tab session; skips replays on
// reloads/navigations.
export const LOGO_TRANSITION_OVERLAY_SESSION_STORAGE_KEY =
  'logo-transition-overlay:shown-session';

// localStorage JSON array of show timestamps, pruned to DEFAULT_SHOW_WINDOW_MS;
// its in-window length is the rolling show count.
export const LOGO_TRANSITION_OVERLAY_SHOWS_STORAGE_KEY =
  'logo-transition-overlay:shows';

// Max shows per trailing window; override via the `maxShowsPerWindow` prop.
export const DEFAULT_MAX_SHOWS_PER_WINDOW = 3;

// Rolling window: 30 days (a show ages out this long after it occurred).
// Override via the `showWindowMs` prop.
export const DEFAULT_SHOW_WINDOW_MS = 30 * 24 * 60 * 60 * 1000;
