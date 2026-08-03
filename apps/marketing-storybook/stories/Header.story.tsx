import {DEFAULT_HEADER_CONTENT} from '@/components/header/codeOrg/config';
import HeaderCodeOrgView from '@/components/header/codeOrg/HeaderCodeOrgView';
import {HeaderContent} from '@/components/header/codeOrg/types';
import {Meta, StoryObj} from '@storybook/react';
import {userEvent, within} from 'storybook/test';

const meta: Meta = {
  title: 'Marketing/Header',
  tags: ['marketing'],
  parameters: {
    disableSectionDecorator: true,
    nextjs: {
      appDirectory: true,
      navigation: {
        pathname: '/',
        query: {},
      },
    },
  },
};

export default meta;

const placeholderImage = `data:image/svg+xml,${encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" width="96" height="64"><rect width="96" height="64" fill="#e4e2f8"/></svg>',
)}`;

const fullContent: HeaderContent = {
  mainMenu: [
    {
      label: 'Teachers',
      href: '/teach',
      submenu: {
        subtitle: 'Inspire your students’ futures with digital fluency.',
        columns: [
          {
            heading: 'Curriculum & Tools',
            type: 'Text List',
            items: [
              {title: 'All Courses', href: '/curriculum'},
              {title: 'Teacher Dashboard', href: '/dashboard'},
              {title: 'AI Tutor', href: '/ai-tutor'},
              {title: 'Hour of AI', href: '/hour-of-ai'},
            ],
          },
          {
            heading: 'Professional Learning',
            type: 'Icon List',
            items: [
              {
                title: 'Self-paced',
                href: '/pl/self-paced',
                subtitle: 'Learn on your own schedule with guided modules.',
                iconName: 'person-chalkboard',
              },
              {
                title: 'Facilitator-led',
                href: '/pl/facilitated',
                subtitle: 'Join a workshop led by an experienced facilitator.',
                iconName: 'users',
              },
            ],
          },
          {
            heading: 'Featured Courses',
            type: 'Image List Vertical',
            items: [
              {
                title: 'Artificial Intelligence Foundations',
                href: '/courses/ai-foundations',
                subtitle: 'A semester-long introduction to AI concepts.',
                imageUrl: placeholderImage,
              },
              {
                title: 'Professional Learning Course',
                href: '/courses/pl',
                subtitle: 'Deepen your teaching practice.',
                imageUrl: placeholderImage,
              },
            ],
          },
        ],
        promo: {
          background: 'lightBlue',
          content: {
            title: 'Explore all Hour of AI activities',
            href: '/hour-of-ai',
            subtitle: 'Bring the Hour of AI to your classroom this year.',
            iconName: 'sparkles',
          },
        },
      },
    },
    {
      label: 'Research',
      href: '/research',
      submenu: {
        subtitle: 'Evidence behind AI and CS education.',
        columns: [
          {
            heading: 'Featured Research',
            type: 'Image List Horizontal',
            items: [
              {
                title: 'National CS Access Tracker',
                href: '/research/tracker',
                subtitle: 'Who has access to CS education?',
                imageUrl: placeholderImage,
              },
              {
                title: 'State of CS + AI Report',
                href: '/research/report',
                subtitle: 'Our flagship annual report.',
                imageUrl: placeholderImage,
              },
            ],
          },
        ],
      },
    },
    {label: 'Parents', href: '/parents'},
    {label: 'Students', href: '/students'},
  ],
  secondaryMenu: [
    {label: 'About', href: '/about'},
    {label: 'Donate', href: '/donate'},
  ],
};

export const Default: StoryObj<typeof HeaderCodeOrgView> = {
  render: () => <HeaderCodeOrgView content={DEFAULT_HEADER_CONTENT} />,
  parameters: {
    eyes: {
      themes: ['code.org'],
    },
  },
};

export const FullContentWithOpenSubmenu: StoryObj<typeof HeaderCodeOrgView> = {
  render: () => <HeaderCodeOrgView content={fullContent} />,
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', {name: 'Teachers'}));
  },
  parameters: {
    eyes: {
      themes: ['code.org'],
    },
  },
};
