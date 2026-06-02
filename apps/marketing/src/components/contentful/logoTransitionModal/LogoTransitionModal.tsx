'use client';

import LogoTransitionOverlay from '@code-dot-org/component-library/logoTransitionOverlay';

import {getAssetPublicPath} from '@/config/assets';
// Must match the logo HeaderCorporateSite.tsx renders, so the animation -> SVG
// hand-off lands on that asset.
import headerLogo from '@public/images/codeai-logo-inverse.svg';

import {useLogoTransition} from './logoTransitionState';

// Animated WebP (alpha) bundled in the app and served as a raw static asset
// from public/assets via getAssetPublicPath() (public/ -> /_next/static/public
// in prod; /assets is exempt from the dev locale rewrite). NOT a @public import
// like the logo: Next's build-time image-size can't read animated image
// sequences.
const LOGO_TRANSITION_ANIMATION_SRC = `${getAssetPublicPath()}/assets/animated-logo-transition.webp`;

// Logo bounds within the animation frame, as fractions of displayed
// dimensions. Measured from the composited final frame: the 811x141 logo
// sits centered at offset (135, 86) within the 1080x313 canvas. x is the
// logo's left edge fraction (used for the SVG's horizontal placement and
// the FLIP handoff); y is the top edge (handoff only — the SVG renders
// viewport-centered vertically during play).
//   x: 135/1080 ~0.125, y: 86/313 ~0.275
//   width: 811/1080 ~0.751, height: 141/313 ~0.451
const MEDIA_END_FRAME_LOGO_NORMALIZED_RECT = {
  x: 0.125,
  y: 0.275,
  width: 0.751,
  height: 0.451,
};

// The logo-transition WebP is 1080x313 (~3.45:1). Different from the AVIF's
// 834x313 (~2.66:1) -- adjust if the asset is replaced.
const MEDIA_ASPECT_RATIO = 1080 / 313;

// Playback duration. An animated <img> fires no `ended` event, so the overlay
// holds on the final frame once this elapses. MUST match the encoded asset
// (currently 9.11s, from sum of per-frame WebP delays).
const ANIMATION_DURATION_MS = 9112;

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
