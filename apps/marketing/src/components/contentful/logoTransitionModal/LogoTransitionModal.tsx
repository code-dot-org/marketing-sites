'use client';

import LogoTransitionOverlay from '@code-dot-org/component-library/logoTransitionOverlay';

// Must match the logo HeaderCorporateSite.tsx renders, so the animation -> SVG
// hand-off lands on that asset.
import headerLogo from '@public/images/codeai-logo-inverse.svg';

// Animated AVIF with alpha, served as a Contentful image asset via <img> (the
// image decoder handles transparency; not the AV1-in-<video> alpha path). Use
// the bare delivery URL: Images API transform params (?fm=/?w=) re-encode and
// can break the animation/alpha. Plays once, freezes on the final Code AI logo.
const LOGO_TRANSITION_ANIMATION_SRC =
  'https://contentful-images.code.org/90t6bu6vlf76/640TmEw2Qdh6XFdjWJsQOc/607785e2e101d759c585b75b0614b20a/animated-logo-transition.avif';

import {setLogoTransitionActive} from './logoTransitionState';

// Logo bounds within the 834x313 animation frame. The SVG renders
// viewport-centered (see computeSvgInitialStyle in LogoTransitionOverlay.tsx),
// so only width/height matter; x/y are unused.
//   width: 809/834 ~0.970, height: 137/313 ~0.438
const MEDIA_END_FRAME_LOGO_NORMALIZED_RECT = {
  x: 0,
  y: 0,
  width: 0.97,
  height: 0.438,
};

// The logo-transition animation is 834x313 (~2.6645:1).
const MEDIA_ASPECT_RATIO = 834 / 313;

// Playback duration. An animated <img> fires no `ended` event, so the overlay
// holds on the final frame once this elapses. MUST match the encoded asset
// (currently 8.0s). Verify via `ffprobe -show_entries format=duration <file>`.
const ANIMATION_DURATION_MS = 8000;

// Brief hold on the final frame before the crossfade + FLIP fire, just enough
// to mask the animation's abrupt tail.
const POST_PLAY_HOLD_MS = 200;

const LogoTransitionModal: React.FC = () => (
  <LogoTransitionOverlay
    mediaSrc={LOGO_TRANSITION_ANIMATION_SRC}
    svgSrc={headerLogo.src}
    mediaAspectRatio={MEDIA_ASPECT_RATIO}
    mediaEndFrameLogoNormalizedRect={MEDIA_END_FRAME_LOGO_NORMALIZED_RECT}
    animationDurationMs={ANIMATION_DURATION_MS}
    destinationSelector="[data-logo-transition-target]"
    postPlayHoldMs={POST_PLAY_HOLD_MS}
    onActiveChange={setLogoTransitionActive}
  />
);

export default LogoTransitionModal;
