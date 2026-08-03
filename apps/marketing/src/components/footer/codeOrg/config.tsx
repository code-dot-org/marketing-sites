import Icon from '@mui/material/Icon';
import {ReactNode} from 'react';

import {FooterContent} from './types';

const copyrightYear = new Date().getFullYear();

export const COPYRIGHT_TEXT = `© CodeAI, ${copyrightYear}. CodeAI, the CodeAI logo, Hour of AI, and CS Discoveries are trademarks of CodeAI. "Code.org" is a former trademark of CodeAI. Built on GitHub from Microsoft.`;

export const FOOTER_TAGLINE =
  'Empowering Every Student to Thrive in an AI-Powered World';

export const FOOTER_MISSION =
  'CodeAI is an education innovation nonprofit dedicated to the vision that every student in every school has the opportunity to learn about artificial intelligence (AI) and computer science (CS) as part of their core K-12 education.';

// Fallback content, rendered when the `siteFooter` Contentful entry is
// unavailable. Link targets are best guesses until final URLs are confirmed.
export const DEFAULT_FOOTER_CONTENT: FooterContent = {
  tagline: FOOTER_TAGLINE,
  mission: FOOTER_MISSION,
  copyright: COPYRIGHT_TEXT,
  linkColumns: [
    {
      heading: 'Who We Serve',
      lists: [
        [
          {label: 'Teachers', href: '/teach'},
          {label: 'Districts', href: '/administrators'},
          {label: 'Advocates & Policy Makers', href: '/advocacy'},
          {label: 'Donors', href: '/donate'},
          {label: 'Parents', href: '/parents'},
          {label: 'Students', href: '/students'},
        ],
      ],
    },
    {
      heading: 'Organization',
      lists: [
        [
          {label: 'Our History', href: '/about'},
          {label: 'Our Approach', href: '/about/approach'},
          {label: 'Our People', href: '/about/leadership'},
          {label: 'Insights', href: '/insights'},
          {label: 'News & Events', href: '/news'},
          {label: 'Press & Media', href: '/press'},
          {label: 'Careers', href: '/about/careers'},
          {label: 'Contact', href: '/contact'},
        ],
      ],
    },
    {
      heading: 'Ways to Support',
      lists: [
        [
          {label: 'One-time donation', href: '/donate'},
          {label: 'Monthly giving', href: '/donate/monthly'},
          {label: 'Corporate Partnership', href: '/partners'},
          {label: 'Fundraise for CodeAI', href: '/fundraise'},
          {label: 'Advocate for CodeAI', href: '/advocacy'},
          {label: 'Get CodeAI in your school', href: '/yourschool'},
        ],
      ],
    },
    {
      heading: 'Privacy & Safety',
      lists: [
        [
          {label: 'Accessibility', href: '/accessibility'},
          {label: 'IT Requirements', href: '/it-requirements'},
          {label: 'Security', href: '/security'},
          {label: 'DPA Illinois', href: '/dpa/illinois'},
          {label: 'DPA Montana', href: '/dpa/montana'},
          {label: 'DPA New York', href: '/dpa/new-york'},
        ],
      ],
    },
    {
      heading: 'Legal',
      lists: [
        [
          {label: 'Terms', href: '/tos'},
          {label: 'Cookies', href: '/cookies'},
        ],
      ],
    },
  ],
};

export type SocialLink = {
  key: string;
  label: string;
  href: string;
  icon: ReactNode;
};

export const SOCIAL_LINKS: SocialLink[] = [
  {
    key: 'x-twitter',
    label: 'X',
    href: 'https://x.com/codeorg',
    icon: <Icon baseClassName="fa-brands" className="fa-x-twitter" />,
  },
  {
    key: 'linkedin',
    label: 'LinkedIn',
    href: 'https://www.linkedin.com/company/code-org',
    icon: <Icon baseClassName="fa-brands" className="fa-linkedin" />,
  },
  {
    key: 'facebook',
    label: 'Facebook',
    href: 'https://www.facebook.com/Code.org/',
    icon: <Icon baseClassName="fa-brands" className="fa-facebook" />,
  },
  {
    key: 'youtube',
    label: 'YouTube',
    href: 'https://www.youtube.com/codeorg',
    icon: <Icon baseClassName="fa-brands" className="fa-youtube" />,
  },
  {
    key: 'instagram',
    label: 'Instagram',
    href: 'https://www.instagram.com/codeorg/',
    icon: <Icon baseClassName="fa-brands" className="fa-instagram" />,
  },
];
