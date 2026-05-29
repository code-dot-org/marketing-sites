'use client';

import LogoTransitionOverlay from '@code-dot-org/component-library/logoTransitionOverlay';

// Must match the logo HeaderCorporateSite.tsx renders, so the animation -> SVG
// hand-off lands on that asset.
import headerLogo from '@public/images/codeai-logo-inverse.svg';

import LogoAnimationStage from './LogoAnimationStage';
import {useLogoTransition} from './logoTransitionState';

// On-screen position+size of the animation's final-frame logo, as fractions of
// the 1053x396 stage. Measured from the frozen final frame: the "CODE + Ai"
// mark is flush-left and vertically centred, spanning x[0,1021] y[109,287].
//   x: 0, y: 109/396 ~0.275
//   width: 1021/1053 ~0.970, height: 178/396 ~0.449
// Its ~5.75:1 aspect matches the header logo, so the FLIP lands cleanly.
const END_FRAME_LOGO_NORMALIZED_RECT = {
  x: 0,
  y: 0.275,
  width: 0.97,
  height: 0.449,
};

// Safety fallback only: the overlay normally hands off when the animation
// reports finished (Web Animations API) -- ~3.6s, when the logo settles. This
// caps the wait if no such signal arrives (e.g. a browser without the API);
// it's set past the settle point but well short of the keyframes' 9.03s tail.
const ANIMATION_FALLBACK_MS = 4500;

// Brief hold on the final frame before the crossfade + FLIP fire, just enough
// to mask the animation's abrupt tail.
const POST_PLAY_HOLD_MS = 200;

const LogoTransitionModal: React.FC = () => {
  const {setActive} = useLogoTransition();
  return (
    <LogoTransitionOverlay
      svgSrc={headerLogo.src}
      endFrameLogoNormalizedRect={END_FRAME_LOGO_NORMALIZED_RECT}
      animationDurationMs={ANIMATION_FALLBACK_MS}
      destinationSelector="[data-logo-transition-target]"
      postPlayHoldMs={POST_PLAY_HOLD_MS}
      onActiveChange={setActive}
    >
      <LogoAnimationStage />
    </LogoTransitionOverlay>
  );
};

export default LogoTransitionModal;
