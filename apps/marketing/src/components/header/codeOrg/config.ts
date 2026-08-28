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
// unavailable. Mirrors the authored menu minus everything that depends on
// Contentful or on a fragile target: no image columns (their asset URLs live
// on contentful-images.code.org, which is exactly what may be down), no promo
// banners, no `#anchor` targets, no studio/districts subdomain links.
export const DEFAULT_HEADER_CONTENT: HeaderContent = {
  mainMenu: [
    {
      label: 'Teachers',
      href: '/teachers',
      submenu: {
        subtitle: 'Inspire your students’ futures with digital fluency.',
        columns: [
          {
            heading: 'Teach with CodeAI',
            type: 'Text List',
            items: [
              {title: 'Start Teaching', href: '/teachers'},
              {title: 'AI Curriculum', href: '/artificial-intelligence'},
              {title: 'Professional Learning', href: '/professional-learning'},
              {
                title: 'Teacher Community Forum',
                href: 'https://forum.code.org/',
              },
            ],
          },
          {
            heading: 'Curriculum & Tools',
            type: 'Text List',
            items: [
              {title: 'All Courses', href: '/curriculum'},
              {
                title: 'AI Teaching Assistant',
                href: '/artificial-intelligence/teaching-assistant',
              },
              {title: 'AI Tutor', href: '/tools/ai-tutor'},
              {title: 'CodeAI Labs', href: '/tools'},
              {title: 'Hour of AI', href: '/hour-of-ai'},
            ],
          },
        ],
      },
    },
    {
      label: 'Districts',
      href: '/districts',
      submenu: {
        subtitle:
          'Bring computer science, AI science, and data science to every school in your district.',
        columns: [
          {
            heading: 'District Implementation',
            type: 'Text List',
            items: [
              {title: 'CodeAI District Program', href: '/districts'},
              {
                title: 'LMS Integration & Support',
                href: '/learning-management-systems',
              },
            ],
          },
          {
            heading: 'Resources',
            type: 'Text List',
            items: [
              {title: 'State Standards Alignment', href: '/correlations'},
              {title: 'CS Access Report', href: '/your-school'},
            ],
          },
        ],
      },
    },
    {
      label: 'Advocacy',
      href: '/advocacy',
      submenu: {
        subtitle: 'Make digital fluency the standard, not the exception.',
        columns: [
          {
            heading: 'Movement Networks',
            type: 'Text List',
            items: [
              {title: 'Policy & Advocacy', href: '/advocacy'},
              {title: 'TeachAI', href: 'https://www.teachai.org/'},
              {title: 'CSforALL', href: 'https://csforall.org/'},
              {
                title: 'AI Literacy Framework',
                href: 'https://ailiteracyframework.org/',
              },
            ],
          },
          {
            heading: 'Resources',
            type: 'Text List',
            items: [{title: '10 Policies', href: '/10policies'}],
          },
        ],
      },
    },
    {label: 'Hour of AI', href: '/hour-of-ai'},
    {label: 'Parents', href: '/parents'},
    {label: 'Students', href: '/students'},
  ],
  secondaryMenu: [
    {label: 'About', href: '/about'},
    {label: 'Donate', href: '/donate'},
  ],
};
