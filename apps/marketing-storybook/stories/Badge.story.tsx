import Badge from '@/components/contentful/badge';
import type {Meta, StoryObj} from '@storybook/nextjs-vite';
import {expect} from 'storybook/test';

// Stories render outside a Section, so `appearance: 'auto'` resolves to the
// dark variant (color background, white text). Use ForcedLight to preview the
// light variant badges get on dark sections.
const meta: Meta<typeof Badge> = {
  title: 'Marketing/Badge',
  component: Badge,
  tags: ['autodocs', 'marketing'],
  argTypes: {
    color: {
      control: {type: 'select'},
      options: ['black', 'purple', 'blue', 'green', 'orange', 'pink'],
    },
    size: {
      control: {type: 'select'},
      options: ['small', 'medium', 'large'],
    },
    appearance: {
      control: {type: 'select'},
      options: ['auto', 'light', 'dark'],
    },
    iconPosition: {
      control: {type: 'select'},
      options: ['left', 'right'],
    },
    isIconOnly: {control: 'boolean'},
    text: {control: 'text'},
    iconName: {control: 'text'},
    ariaLabel: {control: 'text'},
    className: {control: 'text'},
  },
};
export default meta;
type Story = StoryObj<typeof Badge>;

const COLORS = ['black', 'purple', 'blue', 'green', 'orange', 'pink'] as const;

export const Playground: Story = {
  args: {
    text: 'Badge',
    color: 'purple',
    size: 'medium',
    appearance: 'auto',
    iconPosition: 'left',
    isIconOnly: false,
  },
};

export const AllColors: Story = {
  render: args => (
    <div style={{display: 'flex', gap: '8px', flexWrap: 'wrap'}}>
      {COLORS.map(color => (
        <Badge key={color} {...args} color={color} text={color} />
      ))}
    </div>
  ),
  args: {size: 'medium', appearance: 'dark'},
};

export const AllColorsLight: Story = {
  render: args => (
    <div
      style={{
        display: 'flex',
        gap: '8px',
        flexWrap: 'wrap',
        background: '#292f36',
        padding: '16px',
      }}
    >
      {COLORS.map(color => (
        <Badge key={color} {...args} color={color} text={color} />
      ))}
    </div>
  ),
  args: {size: 'medium', appearance: 'light'},
};

export const Sizes: Story = {
  render: args => (
    <div style={{display: 'flex', gap: '8px', alignItems: 'center'}}>
      <Badge {...args} size="small" text="Small" />
      <Badge {...args} size="medium" text="Medium" />
      <Badge {...args} size="large" text="Large" />
    </div>
  ),
  args: {color: 'purple'},
};

export const WithIconLeft: Story = {
  args: {
    text: 'Trending',
    iconName: 'arrow-up',
    iconPosition: 'left',
    color: 'green',
  },
};

export const WithIconRight: Story = {
  args: {
    text: 'Next',
    iconName: 'arrow-right',
    iconPosition: 'right',
    color: 'blue',
  },
};

export const IconOnly: Story = {
  args: {
    iconName: 'plus',
    isIconOnly: true,
    ariaLabel: 'Add',
    color: 'purple',
  },
  play: async ({canvas}) => {
    const badge = canvas.getByRole('img', {name: 'Add'});
    await expect(badge).toBeInTheDocument();
  },
};
