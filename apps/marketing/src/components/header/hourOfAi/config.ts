import {HeaderContent} from '../codeOrg/types';

export const CALL_TO_ACTION = {text: 'Start building', href: '/activities'};

// Fallback nav, rendered when the `siteHeader` Contentful entry is
// unavailable. Mirrors the published Hour of AI header.
export const DEFAULT_HEADER_CONTENT: HeaderContent = {
  mainMenu: [
    {label: 'Activities', href: '/activities'},
    {label: 'Resources', href: '/resources'},
    {label: 'Beyond an Hour', href: '/beyond-an-hour'},
    {label: 'Partners', href: '/partners'},
  ],
  secondaryMenu: [],
};
