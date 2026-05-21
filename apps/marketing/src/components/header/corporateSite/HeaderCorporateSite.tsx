'use client';

import {getCookie} from 'cookies-next/client';
import {useEffect} from 'react';

import DSCOHeader, {
  getDefaultHeaderProps,
} from '@code-dot-org/component-library/cms/header';

import {
  getLogoTransitionActive,
  subscribeToLogoTransitionActive,
} from '@/components/contentful/logoTransitionModal/logoTransitionState';
import {getStage} from '@/config/stage';
import {getStudioBaseUrl} from '@/config/studio';
import {getCookieNameByStage} from '@/cookies/getCookie';
import logoImage from '@public/images/codeai-logo-inverse.svg';
import allProjectsImage from '@public/images/header-all-projects-icon.webp';
import appLabImage from '@public/images/header-app-lab-icon.webp';
import artistImage from '@public/images/header-artist-icon.webp';
import dancePartyImage from '@public/images/header-dance-party-icon.webp';
import gameLabImage from '@public/images/header-game-lab-icon.webp';
import musicLabImage from '@public/images/header-music-lab-icon.webp';
import pythonLabImage from '@public/images/header-python-lab-icon.webp';
import spriteLabImage from '@public/images/header-sprite-lab-icon.webp';

const defaultProps = getDefaultHeaderProps({
  logoImage: logoImage.src,
  spriteLabImage: spriteLabImage.src,
  artistImage: artistImage.src,
  appLabImage: appLabImage.src,
  gameLabImage: gameLabImage.src,
  musicLabImage: musicLabImage.src,
  dancePartyImage: dancePartyImage.src,
  pythonLabImage: pythonLabImage.src,
  allProjectsImage: allProjectsImage.src,
  studioUrl: getStudioBaseUrl(),
});

const Header: React.FC = () => {
  const isSignedIn = async (): Promise<boolean> => {
    return !!getCookie(getCookieNameByStage('_shortName', getStage()));
  };

  // Tag the rendered header-logo image with a stable data-attribute so the
  // logo-transition overlay can locate it as the FLIP hand-off destination,
  // and subscribe to the logo-transition-active flag so the static header
  // logo stays hidden while the logo-transition overlay is running. The
  // header logo is revealed at the moment the FLIP-to-header animation
  // completes (overlay phase becomes 'done'), seamlessly taking over from
  // the in-transit SVG as it lands.
  useEffect(() => {
    const headerLogo = document.querySelector(
      'header img',
    ) as HTMLElement | null;
    if (!headerLogo) return;
    headerLogo.setAttribute('data-logo-transition-target', '');

    const applyVisibility = (active: boolean) => {
      headerLogo.style.opacity = active ? '0' : '';
    };

    applyVisibility(getLogoTransitionActive());
    const unsubscribe = subscribeToLogoTransitionActive(applyVisibility);
    return () => {
      unsubscribe();
      // Restore default visibility on unmount so a future re-render doesn't
      // inherit a stale opacity.
      headerLogo.style.opacity = '';
    };
  }, []);

  return <DSCOHeader {...defaultProps} isSignedIn={isSignedIn} />;
};

export default Header;
