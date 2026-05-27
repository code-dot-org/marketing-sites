export const LOGO_TRANSITION_MODAL_FEATURE_TAG = 'logo-transition-modal';

export type LogoTransitionOverlayFailureReason =
  | 'media-load-failed'
  | 'media-load-timeout'
  | 'multiple-instances'
  | 'destination-not-found';

export const DEFAULT_LOAD_TIMEOUT_MS = 2000;
// How long the animated AVIF plays before we move to the brief final-frame
// hold. An animated <img> exposes no `ended` event (unlike <video>), so the
// overlay arms a timer of this length when the image starts playing and
// treats its expiry as "the animation finished". MUST match the asset's true
// playback duration (the marketing AVIF is 8s); consumers override via the
// `animationDurationMs` prop. The AVIF is authored to play once and freeze on
// its last frame, so when this elapses the held frame is the final logo.
export const DEFAULT_ANIMATION_DURATION_MS = 8000;
// Milliseconds the animation's final frame is held on screen after playback
// finishes, before the crossfade to the SVG begins. Lets the visitor
// register the destination logo before the modal starts dissolving.
export const DEFAULT_POST_PLAY_HOLD_MS = 3000;
// Emitted as `--lto-fade-out-ms`. Drives the brief opacity transitions that are
// in effect during the (now near-instant) 'fading' tick and the close button's
// fade. The animation's fade-OUT during the hand-off itself is governed by
// DEFAULT_CROSSFADE_MS (below), not this.
export const DEFAULT_FADE_OUT_MS = 700;
// Delay between entering 'fading' and triggering 'handoff'. Set to 0: the
// animation and the SVG both begin travelling to the header on the same tick,
// crossfading from animation to SVG as they fly (the animation carries the
// motion early, then dissolves to reveal the SVG). 0 = no static-at-center
// pause -- the travel starts as soon as the post-play hold ends.
export const DEFAULT_HANDOFF_TRIGGER_MS = 0;
// Duration of the translate+resize to the header destination -- applied to BOTH
// the SVG and the animation's .mediaWrapper so they fly together -- and also the
// duration of the backdrop's background-color fade to transparent. Single source
// of truth: drives the JS unmount timer and, emitted as `--lto-handoff-ms`, the
// .handoffSvg--running, .mediaWrapper--running, and .overlayRoot CSS transitions.
export const DEFAULT_HANDOFF_MS = 1500;
// Duration of the animation->SVG opacity crossfade that runs *during* the
// hand-off travel. Set to a QUARTER of the travel and front-loaded (ease-out on
// both fades) so the crossfade completes within the first ~25% of the trip --
// while the AVIF and the SVG are still nearly coincident on the path, before any
// spatial separation that would read as a double-image "trail". The AVIF fades
// 1->0 fast and early; the SVG fades 0->1 just as fast to cover it; the
// remaining ~75% of the travel is the solid SVG flying alone. Emitted as
// `--lto-crossfade-ms`; consumed by .mediaWrapper--running (animation fade-out,
// ease-out) and .handoffSvg--running (SVG fade-in, ease-out).
export const DEFAULT_CROSSFADE_MS = DEFAULT_HANDOFF_MS / 4;
export const DEFAULT_DIALOG_ARIA_LABEL =
  'Code.org logo logo-transition animation';
export const DEFAULT_CLOSE_ARIA_LABEL = 'Close';

// How the overlay is throttled (see shownThisSession / getRecentShows /
// recordShow in LogoTransitionOverlay.tsx). Two functional, non-tracking,
// no-PII markers, both set only once a show actually commits:
//
//   - sessionStorage flag: "shown in this tab session already". Cleared
//     automatically when the tab session ends, so the animation can play again
//     in a future session (but never twice within one).
//   - localStorage list: epoch-ms timestamps of recent shows, pruned to the
//     trailing window. The count of timestamps within the window enforces the
//     per-window cap below.
//
// Neither persists across browsers or devices -- that would need server-side
// state. Both degrade toward "let it play" if storage is unavailable.

// sessionStorage key: present (== '1') once the overlay has been shown in the
// current tab session. Read at mount to skip replaying on reloads/navigations.
export const LOGO_TRANSITION_OVERLAY_SESSION_STORAGE_KEY =
  'logo-transition-overlay:shown-session';

// localStorage key: a JSON array of epoch-ms timestamps, one per committed
// show, pruned to DEFAULT_SHOW_WINDOW_MS. Its length is the rolling-window
// show count used to enforce the cap.
export const LOGO_TRANSITION_OVERLAY_SHOWS_STORAGE_KEY =
  'logo-transition-overlay:shows';

// Maximum number of times the overlay may be shown within any trailing
// SHOW_WINDOW_MS. Consumers override via the `maxShowsPerWindow` prop.
export const DEFAULT_MAX_SHOWS_PER_WINDOW = 3;

// Length of the rolling window over which shows are counted: 30 days. A show
// "ages out" exactly SHOW_WINDOW_MS after it occurred (rolling, not a calendar
// month). Consumers override via the `showWindowMs` prop.
export const DEFAULT_SHOW_WINDOW_MS = 30 * 24 * 60 * 60 * 1000;
