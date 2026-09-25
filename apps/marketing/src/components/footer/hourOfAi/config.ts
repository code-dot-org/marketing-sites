import {FooterContent} from '../codeOrg/types';

// Fallback content, rendered when the `siteFooter` Contentful entry is
// unavailable. Mirrors the published Hour of AI footer.
export const DEFAULT_FOOTER_CONTENT: FooterContent = {
  copyright: '© All rights reserved',
  linkColumns: [
    {
      lists: [
        [
          {label: 'Hour of AI Activities', href: '/activities'},
          {label: 'Partners', href: '/partners'},
        ],
      ],
    },
  ],
};
