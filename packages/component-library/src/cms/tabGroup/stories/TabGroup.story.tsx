import {Meta, StoryObj} from '@storybook/react';
import {within, expect} from '@storybook/test';

import {LinkButtonProps} from '@/button';
import {ImageProps} from '@/cms/image';

import TabGroup, {TabGroupTabModel} from './../TabGroup';

export default {
  title: 'CMS/TabGroup',
  component: TabGroup,
  parameters: {
    componentSubtitle: 'Renders a group of tabs with optional content',
  },
} as Meta<typeof TabGroup>;

type Story = StoryObj<typeof TabGroup>;

const defaultButton: LinkButtonProps = {
  children: 'Click Me',
  href: 'https://code.org',
  text: 'Click me',
};

const defaultImage: ImageProps = {
  src: 'https://code.org/images/teach-page-top.png',
  alt: 'Teach computer science & ignite possibilities',
};

const defaultImage2: ImageProps = {
  src: 'https://code.org/images/admins-page-top.png',
  alt: 'Expand computer science in your district',
};

export const Playground: Story = {
  args: {
    tabs: [
      {
        value: 'tab1',
        text: 'Tab 1',
        tabContent: {
          image: defaultImage,
          button: defaultButton,
          title: 'Track Your Progress',
          description: 'Monitor student work with real-time insights.',
        },
      },
      {
        value: 'tab2',
        text: 'Tab 2',
        tabContent: {
          image: defaultImage2,
          button: defaultButton,
          title: 'Engage Students',
          description: 'Make learning more interactive and fun!',
        },
      },
    ] as TabGroupTabModel[],
    defaultSelectedTabValue: 'tab1',
    onChange: value => console.log(`Selected Tab: ${value}`),
    name: 'custom-content-tabs',
  },
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);

    const tab = await canvas.findByText('Tab 1');
    await expect(tab).toBeVisible();

    // Test the content rendering inside the tab
    const title = await canvas.findByText('Track Your Progress');
    const description = await canvas.findByText(
      'Monitor student work with real-time insights.',
    );
    await expect(title).toBeVisible();
    await expect(description).toBeVisible();

    // Test if the button works
    const button = await canvas.findByText('Click Me');
    await expect(button).toBeVisible();

    await button.click();
  },
};

export const WithCustomContent: Story = {
  args: {
    tabs: [
      {value: 'tab1', text: 'Tab 1', tabContent: <div>Content for Tab 1</div>},
      {value: 'tab2', text: 'Tab 2', tabContent: <div>Content for Tab 2</div>},
    ],
    defaultSelectedTabValue: 'tab1',
    onChange: value => console.log(`Selected Tab: ${value}`),
    name: 'basic-tabs',
  },
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);
    const tab = await canvas.findByText('Tab 1');

    // Check if tab is visible
    await expect(tab).toBeVisible();

    // Click on the tab and check if it's selected
    await tab.click();
    await expect(tab).toHaveClass('active');
  },
};
