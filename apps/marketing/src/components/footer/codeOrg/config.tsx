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
// unavailable. Mirrors the authored siteFooter entry; every target here was
// checked against the live site, so keep them in step when the entry changes.
// `satisfies` keeps tagline/mission non-optional on the constant even though
// FooterContent allows them to be absent.
export const DEFAULT_FOOTER_CONTENT = {
  tagline: FOOTER_TAGLINE,
  mission: FOOTER_MISSION,
  copyright: COPYRIGHT_TEXT,
  linkColumns: [
    {
      heading: 'Who We Serve',
      lists: [
        [
          {label: 'Teachers', href: '/teachers'},
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
          {label: 'Our History', href: '/about#history'},
          {label: 'Our Approach', href: '/about#approach'},
          {label: 'Our People', href: '/about/team'},
          {label: 'Insights', href: '/promote-computer-science'},
          {label: 'News & Events', href: '/about/news'},
          {label: 'Press & Media', href: '/codeai#toolkit'},
          {label: 'Careers', href: '/about/careers'},
        ],
      ],
    },
    {
      heading: 'Ways To Support',
      lists: [
        [
          {label: 'One-time Donation', href: '/donate'},
          {
            label: 'Monthly Giving',
            href: 'https://donate.code.org/campaign/778430/donate?c_src=code-website',
          },
          {label: 'Corporate Partnership', href: '/about/partners'},
          {
            label: 'Fundraise For CodeAI',
            href: 'https://donate.code.org/campaign/codeai/c142257',
          },
          {label: 'Advocate For CodeAI', href: '/advocacy'},
          {label: 'Get CodeAI In Your School', href: '/districts'},
        ],
      ],
    },
    {
      heading: 'Privacy & Safety',
      lists: [
        [
          {label: 'Privacy Policy', href: '/privacy'},
          {label: 'Accessibility', href: '/about/accessibility'},
          {label: 'IT Requirements', href: '/about/it-requirements'},
          {label: 'Security', href: '/security'},
          {label: 'Terms Of Service', href: '/terms-of-service'},
          {label: 'Manage Cookies', href: '/cookies'},
        ],
      ],
    },
  ],
} satisfies FooterContent;

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
