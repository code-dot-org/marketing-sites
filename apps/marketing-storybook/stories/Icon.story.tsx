import {BRAND_COLORS} from '@/components/common/colors';
import Icon from '@/components/contentful/icon/Icon';
import Section from '@/components/contentful/section';
import type {Meta, StoryObj} from '@storybook/nextjs-vite';

const meta: Meta<typeof Icon> = {
  title: 'Marketing/Icon',
  component: Icon,
  tags: ['autodocs', 'marketing'],
};
export default meta;
type Story = StoryObj<typeof Icon>;

export const Playground: Story = {
  args: {
    iconName: 'lightbulb',
    color: 'purplePrimary',
    backgroundFill: 'none',
    backgroundShape: 'circle',
    backgroundColor: 'gray1',
    iconSize: 24,
  },
  argTypes: {
    iconName: {control: 'text'},
    iconSize: {control: {type: 'number', min: 8, max: 128, step: 4}},
    color: {
      control: {type: 'select'},
      options: BRAND_COLORS.map(c => c.value),
    },
    backgroundFill: {
      control: {type: 'select'},
      options: ['none', 'filled', 'outline'],
    },
    backgroundShape: {
      control: {type: 'select'},
      options: ['circle', 'square'],
    },
    backgroundColor: {
      control: {type: 'select'},
      options: BRAND_COLORS.map(c => c.value),
    },
  },
};

// FR-020(a): bare icon, default values
export const Default: Story = {args: {iconName: 'lightbulb'}};

// FR-020(b): brand-family icon
export const BrandFamily: Story = {args: {iconName: 'github'}};

// FR-020(c): custom icon size
export const CustomSize: Story = {args: {iconName: 'lightbulb', iconSize: 64}};

// FR-020(d): custom color
export const CustomColor: Story = {
  args: {iconName: 'lightbulb', color: 'bluePrimary'},
};

// FR-020(e): filled circle, default light-grey background
export const FilledCircleDefault: Story = {
  args: {iconName: 'lightbulb', backgroundFill: 'filled'},
};

// FR-020(f): filled rounded square, brand backgroundColor
export const FilledSquareBrand: Story = {
  args: {
    iconName: 'lightbulb',
    backgroundFill: 'filled',
    backgroundShape: 'square',
    backgroundColor: 'bluePrimary',
    color: 'white',
  },
};

// FR-020(g): outline circle
export const OutlineCircle: Story = {
  args: {
    iconName: 'lightbulb',
    backgroundFill: 'outline',
    backgroundColor: 'purplePrimary',
  },
};

// FR-020(h): outline rounded square
export const OutlineSquare: Story = {
  args: {
    iconName: 'lightbulb',
    backgroundFill: 'outline',
    backgroundShape: 'square',
    backgroundColor: 'purplePrimary',
  },
};

// Contrast switch: bare icon inside a purplePrimary Section flips to white.
export const ContrastSwitchOnDarkSection: Story = {
  render: () => (
    <Section background="purplePrimary">
      <Icon iconName="lightbulb" color="purplePrimary" />
    </Section>
  ),
};

// Contrast switch suppressed: purplePrimary icon on a light fill inside a
// purplePrimary Section stays purplePrimary (FR-007, US2 #5 / US3 #5–6).
export const ContrastSwitchSuppressedByFill: Story = {
  render: () => (
    <Section background="purplePrimary">
      <Icon
        iconName="lightbulb"
        color="purplePrimary"
        backgroundFill="filled"
      />
    </Section>
  ),
};

// Side-by-side: bare, filled, and outline icons inside the same dark Section.
// Bare and outline glyphs contrast-switch to white (the Section background
// shows behind both); only the filled icon keeps the authored color.
export const ContrastSwitchSideBySide: Story = {
  render: () => (
    <Section background="purplePrimary">
      <div style={{display: 'inline-flex', gap: 24, alignItems: 'center'}}>
        <Icon iconName="lightbulb" color="purplePrimary" />
        <Icon
          iconName="lightbulb"
          color="purplePrimary"
          backgroundFill="filled"
        />
        <Icon
          iconName="lightbulb"
          color="purplePrimary"
          backgroundFill="outline"
        />
      </div>
    </Section>
  ),
};
