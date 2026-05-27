'use client';

import LogoTransitionOverlay from '@code-dot-org/component-library/logoTransitionOverlay';

import {getAssetPublicPath} from '@/config/assets';
// Must match the logo HeaderCorporateSite.tsx renders, so the animation -> SVG
// hand-off lands on that asset.
import headerLogo from '@public/images/codeai-logo-inverse.svg';

import {useLogoTransition} from './logoTransitionState';

// Animated AVIF (alpha) bundled in the app and served as a raw static asset
// from public/assets via getAssetPublicPath() (public/ -> /_next/static/public
// in prod; /assets is exempt from the dev locale rewrite). NOT a @public import
// like the logo: Next's build-time image-size can't read AVIF image sequences.
const LOGO_TRANSITION_ANIMATION_SRC = `${getAssetPublicPath()}/assets/animated-logo-transition.avif`;

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

const LogoTransitionModal: React.FC = () => {
  const {setActive} = useLogoTransition();
  return (
    <LogoTransitionOverlay
      mediaSrc={LOGO_TRANSITION_ANIMATION_SRC}
      svgSrc={headerLogo.src}
      mediaAspectRatio={MEDIA_ASPECT_RATIO}
      mediaEndFrameLogoNormalizedRect={MEDIA_END_FRAME_LOGO_NORMALIZED_RECT}
      animationDurationMs={ANIMATION_DURATION_MS}
      destinationSelector="[data-logo-transition-target]"
      postPlayHoldMs={POST_PLAY_HOLD_MS}
      onActiveChange={setActive}
    />
  );
};

export default LogoTransitionModal;
