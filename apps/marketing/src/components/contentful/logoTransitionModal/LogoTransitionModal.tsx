'use client';

import LogoTransitionOverlay from '@code-dot-org/component-library/logoTransitionOverlay';

// Destination SVG must match whichever logo the header renders
// (HeaderCorporateSite.tsx), so the seamless animation -> SVG hand-off
// lands on that asset.
import headerLogo from '@public/images/codeai-logo-inverse.svg';

// Animated AVIF with alpha, served as a Contentful IMAGE asset (rendered in an
// <img>, so the image decoder handles the transparency -- this is not the
// AV1-in-<video> alpha path). The bare delivery URL carries NO Contentful
// Images API transform params (?fm=/?w= would re-encode and can break the
// animation/alpha). The transparent background lets the grey overlay show
// through behind the animation. ~73KB, 271 frames @30fps (9.03s); plays once
// and freezes on the final Code AI logo for the SVG hand-off.
const LOGO_TRANSITION_ANIMATION_SRC =
  'https://contentful-images.code.org/90t6bu6vlf76/640TmEw2Qdh6XFdjWJsQOc/607785e2e101d759c585b75b0614b20a/animated-logo-transition.avif';

import {setLogoTransitionActive} from './logoTransitionState';

// Authored to match the rendered 834x313 animation frame. The destination
// SVG is ~591.15:100 aspect; at 809px wide its height is ~137px. The
// SVG is rendered viewport-centered (see computeSvgInitialStyle in
// LogoTransitionOverlay.tsx) so only the width/height fractions of
// this rect are consumed -- x and y are kept at 0 for clarity but do
// not affect positioning.
//   width: 809/834 ~0.970
//   height: 137/313 ~0.438
const MEDIA_END_FRAME_LOGO_NORMALIZED_RECT = {
  x: 0,
  y: 0,
  width: 0.97,
  height: 0.438,
};

// The logo-transition animation is 834x313 (~2.6645:1).
const MEDIA_ASPECT_RATIO = 834 / 313;

// The animated AVIF's playback duration. An animated <img> fires no `ended`
// event, so the overlay holds on the final frame after this elapses. MUST match
// the encoded asset: the current master is 8.0s (240 frames @ 30fps, including a
// ~0.9s held final frame). Verify the final AVIF with
// `ffprobe -show_entries format=duration animated-logo-transition.avif`.
const ANIMATION_DURATION_MS = 8000;

// Brief hold on the animation's final frame before the crossfade + FLIP fire
// simultaneously. Just enough to mask the v3 animation's abrupt tail without
// letting the logo sit static at viewport center.
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
