'use client';

import LogoTransitionOverlay from '@code-dot-org/component-library/logoTransitionOverlay';

// Destination SVG must match whichever logo the header renders
// (HeaderCorporateSite.tsx), so the seamless video -> SVG hand-off
// lands on that asset.
import headerLogo from '@public/images/codeai-logo-inverse.svg';

// MP4 hosted on Contentful's CDN. Matches how the rest of the site serves
// video assets (e.g. videos.code.org/...) and avoids the locale-routing
// middleware that would intercept a /public/... URL.
const LOGO_TRANSITION_VIDEO_SRC =
  'https://contentful-videos.code.org/90t6bu6vlf76/6yQPTnY5EJwsIoRRGWxKCk/2cdeafb64bb3e90678f28eea27360d60/test-animated-logo-transition-2-compressed.mp4';

import {setLogoTransitionActive} from './logoTransitionState';

// Authored to match the rendered 834x313 video frame. The destination
// SVG is ~591.15:100 aspect; at 809px wide its height is ~137px. The
// SVG is rendered viewport-centered (see computeSvgInitialStyle in
// LogoTransitionOverlay.tsx) so only the width/height fractions of
// this rect are consumed -- x and y are kept at 0 for clarity but do
// not affect positioning.
//   width: 809/834 ~0.970
//   height: 137/313 ~0.438
const VIDEO_END_FRAME_LOGO_NORMALIZED_RECT = {
  x: 0,
  y: 0,
  width: 0.97,
  height: 0.438,
};

// The logo-transition video is 834x313 (~2.6645:1).
const VIDEO_ASPECT_RATIO = 834 / 313;

// Milliseconds to hold on the video's final frame before crossfading to
// the SVG. Short by design -- just long enough to register the final
// frame -- so the user reaches the page quickly.
const POST_PLAY_HOLD_MS = 500;

const LogoTransitionModal: React.FC = () => (
  <LogoTransitionOverlay
    videoSrc={LOGO_TRANSITION_VIDEO_SRC}
    svgSrc={headerLogo.src}
    videoAspectRatio={VIDEO_ASPECT_RATIO}
    videoEndFrameLogoNormalizedRect={VIDEO_END_FRAME_LOGO_NORMALIZED_RECT}
    destinationSelector="[data-logo-transition-target]"
    postPlayHoldMs={POST_PLAY_HOLD_MS}
    onActiveChange={setLogoTransitionActive}
  />
);

export default LogoTransitionModal;
