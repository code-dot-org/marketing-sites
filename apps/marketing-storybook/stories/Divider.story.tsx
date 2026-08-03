import Divider from '@/components/contentful/divider';
import type {Meta, StoryObj} from '@storybook/nextjs-vite';
import {expect} from 'storybook/test';

const meta: Meta<typeof Divider> = {
  title: 'Marketing/Divider',
  component: Divider,
  tags: ['autodocs', 'marketing'],
};
export default meta;
type Story = StoryObj<typeof Divider>;

export const Playground: Story = {
  args: {
    color: 'primary',
    margin: 'm',
    direction: 'horizontal',
    width: 'small',
    className: '',
  },
  argTypes: {
    color: {
      control: {type: 'select'},
      options: ['primary', 'strong', 'white', 'gray5', 'purplePrimary'],
    },
    margin: {control: 'text'},
    direction: {
      control: {type: 'select'},
      options: ['horizontal', 'vertical'],
    },
    width: {
      control: {type: 'select'},
      options: ['small', 'medium'],
    },
    className: {control: 'text'},
  },
};

export const Primary: Story = {
  args: {
    color: 'primary',
    margin: 'm',
  },
  play: async ({canvas}) => {
    const separator = canvas.getByRole('separator');
    await expect(separator).toBeInTheDocument();
  },
};

export const Strong: Story = {
  args: {
    color: 'strong',
    margin: 'l',
  },
  play: async ({canvas}) => {
    const separator = canvas.getByRole('separator');
    await expect(separator).toBeInTheDocument();
  },
};

// Vertical dividers stretch via flexItem, so they only show inside a
// row-direction flex container with some height (in Studio: e.g. between
// columns).
export const Vertical: Story = {
  args: {
    color: 'gray5',
    margin: 'm',
    direction: 'vertical',
  },
  decorators: [
    StoryComponent => (
      <div style={{display: 'flex', flexDirection: 'row', height: '120px'}}>
        <p>Left content</p>
        <StoryComponent />
        <p>Right content</p>
      </div>
    ),
  ],
  play: async ({canvas}) => {
    const separator = canvas.getByRole('separator');
    await expect(separator).toHaveAttribute('aria-orientation', 'vertical');
  },
};

export const VerticalMedium: Story = {
  ...Vertical,
  args: {
    ...Vertical.args,
    width: 'medium',
  },
};

export const White: Story = {
  globals: {
    sectionBackground: 'dark',
  },
  args: {
    color: 'white',
    margin: 's',
  },
  play: async ({canvas}) => {
    const separator = canvas.getByRole('separator');
    await expect(separator).toBeInTheDocument();
  },
};
