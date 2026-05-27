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
import logoImage from '@public/images/cdo-logo-inverse.svg';
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

  // Tag the header logo so the overlay can find it as the FLIP destination, and
  // hide it while the transition runs. It's revealed when the overlay completes,
  // taking over from the SVG as it lands.
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
      // Restore default opacity so a re-render doesn't inherit a stale value.
      headerLogo.style.opacity = '';
    };
  }, []);

  return <DSCOHeader {...defaultProps} isSignedIn={isSignedIn} />;
};

export default Header;
