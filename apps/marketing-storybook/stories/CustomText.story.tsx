import {BRAND_COLORS} from '@/components/common/colors';
import CustomText from '@/components/contentful/customText';
import Section from '@/components/contentful/section';
import type {Meta, StoryObj} from '@storybook/nextjs-vite';
import {expect} from 'storybook/test';

const meta: Meta<typeof CustomText> = {
  title: 'Marketing/CustomText',
  component: CustomText,
  tags: ['autodocs', 'marketing'],
};
export default meta;
type Story = StoryObj<typeof CustomText>;

const TYPES = ['custom', 'subtitle', 'overline', 'statistic'] as const;

const SIZES = ['xs', 'sm', 'md', 'lg', 'xl', '2xl', '3xl', '4xl'] as const;

export const Playground: Story = {
  args: {
    children: 'Custom text',
    type: 'custom',
  },
  argTypes: {
    children: {control: 'text'},
    type: {control: {type: 'select'}, options: TYPES},
    htmlTag: {
      control: {type: 'select'},
      options: ['default', 'span', 'p'],
    },
    color: {control: {type: 'select'}, options: BRAND_COLORS.map(c => c.value)},
    font: {control: {type: 'select'}, options: ['default', 'text', 'display']},
    textSize: {control: {type: 'select'}, options: ['default', ...SIZES]},
    fontSize: {control: {type: 'number', min: 0.5, max: 8, step: 0.125}},
    lineHeight: {control: {type: 'number', min: 0.8, max: 3, step: 0.05}},
    fontWeight: {
      control: {type: 'select'},
      options: ['default', '400', '500', '600', '700'],
    },
    textTransform: {
      control: {type: 'select'},
      options: ['default', 'none', 'uppercase', 'lowercase', 'capitalize'],
    },
    iconNameLeft: {control: 'text'},
    iconNameRight: {control: 'text'},
  },
};

// US1 — each type renders with its own complete default style set.
export const DefaultsPerType: Story = {
  render: () => (
    <div style={{display: 'flex', flexDirection: 'column', gap: 16}}>
      {TYPES.map(type => (
        <CustomText key={type} type={type}>
          {`${type} default`}
        </CustomText>
      ))}
    </div>
  ),
  play: async ({canvas}) => {
    expect(canvas.getByText('subtitle default').tagName).toBe('P');
    expect(canvas.getByText('custom default').tagName).toBe('SPAN');
  },
};

// US2 — a single override changes only its dimension; the rest stay default.
export const Overrides: Story = {
  render: () => (
    <div style={{display: 'flex', flexDirection: 'column', gap: 16}}>
      <CustomText type="custom" textSize="2xl">
        custom | textSize 2xl
      </CustomText>
      <CustomText type="custom" font="display">
        custom | font Display (Space Grotesk)
      </CustomText>
      <CustomText type="custom" fontWeight="700">
        custom | fontWeight Bold
      </CustomText>
      <CustomText type="custom" color="purplePrimary">
        custom | color purplePrimary
      </CustomText>
      <CustomText type="subtitle" htmlTag="span">
        subtitle | htmlTag span (overrides the default p)
      </CustomText>
      <CustomText type="overline" textTransform="none">
        overline | transform none (overrides the default uppercase)
      </CustomText>
    </div>
  ),
};

// US3 — contrast switching: the same plain text on light vs. dark Sections.
export const ContrastSwitch: Story = {
  render: () => (
    <div style={{display: 'flex', flexDirection: 'column', gap: 16}}>
      <Section background="white" padding="m">
        <CustomText type="custom">black text on white (passthrough)</CustomText>
      </Section>
      <Section background="purpleDark" padding="m">
        <CustomText type="custom">
          black text on purpleDark (switches to white)
        </CustomText>
      </Section>
    </div>
  ),
};

// US4 — single leading or trailing icon, inheriting the text color.
export const Icons: Story = {
  render: () => (
    <div style={{display: 'flex', flexDirection: 'column', gap: 16}}>
      <CustomText type="overline" iconNameLeft="flask">
        Sprite Lab
      </CustomText>
      <CustomText
        type="custom"
        color="purplePrimary"
        iconNameRight="arrow-right"
      >
        Learn more
      </CustomText>
    </div>
  ),
};
