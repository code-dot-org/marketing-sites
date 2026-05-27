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
// hand-off travel. Set to half the travel so the animation hits 0% opacity at
// the 50% travel mark -- it carries the motion through the first half, then is
// gone (no trailing past the midpoint), and the SVG (which fades in over the
// same window) is fully opaque to finish the trip. Emitted as
// `--lto-crossfade-ms`; consumed by .mediaWrapper--running (animation fade-out,
// ease-in) and .handoffSvg--running (SVG fade-in, ease-in-out).
export const DEFAULT_CROSSFADE_MS = DEFAULT_HANDOFF_MS / 2;
export const DEFAULT_DIALOG_ARIA_LABEL =
  'Code.org logo logo-transition animation';
export const DEFAULT_CLOSE_ARIA_LABEL = 'Close';

// localStorage key that records "the visitor has seen the logo-transition
// animation in this browser". Set as soon as the animation successfully loads
// and starts playing; read at mount to short-circuit the overlay (so later mounts or
// return visits in this browser do nothing). Persists across tabs and browser
// restarts, but not across browsers or devices. Functional, non-tracking
// marker -- no PII.
export const LOGO_TRANSITION_OVERLAY_PLAYED_STORAGE_KEY =
  'logo-transition-overlay:played';
