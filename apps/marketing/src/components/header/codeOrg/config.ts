import {HeaderContent, PromoBackground} from './types';

export const HEADER_HEIGHT = 50; // px

// Two-stage collapse: below this width the secondary menu moves into the
// hamburger; below the theme's md breakpoint (900) the main menu follows.
export const HAMBURGER_BREAKPOINT = 1000; // px

export const PROMO_BACKGROUNDS: Record<PromoBackground, string> = {
  lightPurple: 'var(--codeai-purple-light, #e4e2f8)',
  lightBlue: 'var(--codeai-blue-light, #d5efff)',
  lightGreen: 'var(--codeai-green-light, #ccf1d0)',
  lightOrange: 'var(--codeai-orange-light, #ffe3ce)',
  lightPink: 'var(--codeai-pink-light, #fbdae8)',
};

// Fallback nav, rendered when the `siteHeader` Contentful entry is
// unavailable: plain links only, no dropdown content. Targets mirror the
// footer fallback in footer/codeOrg/config.tsx.
export const DEFAULT_HEADER_CONTENT: HeaderContent = {
  mainMenu: [
    {label: 'Teachers', href: '/teach'},
    {label: 'Districts', href: '/administrators'},
    {label: 'Students', href: '/students'},
    {label: 'About', href: '/about'},
  ],
  secondaryMenu: [{label: 'Donate', href: '/donate'}],
};
