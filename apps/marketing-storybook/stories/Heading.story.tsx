import {BRAND_COLORS} from '@/components/common/colors';
import Heading from '@/components/contentful/heading';
import Section from '@/components/contentful/section';
import type {Meta, StoryObj} from '@storybook/nextjs-vite';
import {expect} from 'storybook/test';

const meta: Meta<typeof Heading> = {
  title: 'Marketing/Heading',
  component: Heading,
  tags: ['autodocs', 'marketing'],
};
export default meta;
type Story = StoryObj<typeof Heading>;

const LEVELS = [
  'heading-xxl',
  'heading-xl',
  'heading-lg',
  'heading-md',
  'heading-sm',
  'heading-xs',
] as const;

export const Playground: Story = {
  args: {
    children: 'Playground Heading',
    visualAppearance: 'heading-xl',
    color: 'primary',
    className: '',
    removeMarginBottom: false,
  },
  argTypes: {
    children: {control: 'text'},
    visualAppearance: {
      control: {type: 'select'},
      options: LEVELS,
    },
    color: {
      control: {type: 'select'},
      options: BRAND_COLORS.map(c => c.value),
    },
    className: {control: 'text'},
    removeMarginBottom: {control: 'boolean'},
    fontSize: {control: {type: 'number', min: 0.5, max: 12, step: 0.125}},
    lineHeight: {control: {type: 'number', min: 0.5, max: 3, step: 0.05}},
    fontWeight: {
      control: {type: 'select'},
      options: [undefined, '500', '700'],
    },
    colorOverride: {control: 'color'},
    fontKerning: {
      control: {type: 'select'},
      options: [undefined, 'normal', 'auto', 'none'],
    },
    textTransform: {
      control: {type: 'select'},
      options: ['none', 'uppercase', 'lowercase', 'capitalize'],
    },
  },
};

const PRIMARY_AND_WHITE = ['primary', 'white'] as const;

const levelStory = (level: (typeof LEVELS)[number]): Story => ({
  render: () => (
    <div style={{display: 'flex', flexDirection: 'column', gap: 16}}>
      {PRIMARY_AND_WHITE.map(color =>
        ([false, true] as const).map(removeMarginBottom => (
          <div
            key={`${level}-${color}-${removeMarginBottom}`}
            style={color === 'white' ? {background: '#333', padding: 8} : {}}
          >
            <Heading
              visualAppearance={level}
              color={color}
              removeMarginBottom={removeMarginBottom}
            >
              {`${level} | ${color} | removeMarginBottom: ${removeMarginBottom}`}
            </Heading>
          </div>
        )),
      ).flat()}
    </div>
  ),
  play: async ({canvas}) => {
    for (const color of PRIMARY_AND_WHITE) {
      for (const removeMarginBottom of [false, true] as const) {
        const headingText = `${level} | ${color} | removeMarginBottom: ${removeMarginBottom}`;
        const heading = canvas.getByRole('heading', {name: headingText});
        expect(heading).toBeInTheDocument();
      }
    }
  },
});

export const HeadingXXL = levelStory('heading-xxl');
export const HeadingXL = levelStory('heading-xl');
export const HeadingLG = levelStory('heading-lg');
export const HeadingMD = levelStory('heading-md');
export const HeadingSM = levelStory('heading-sm');
export const HeadingXS = levelStory('heading-xs');

export const Colors: Story = {
  render: () => (
    <div style={{display: 'flex', flexDirection: 'column', gap: 16}}>
      {BRAND_COLORS.map(({value}) => (
        <div
          key={`color-${value}`}
          style={value === 'white' ? {background: '#333', padding: 8} : {}}
        >
          <Heading
            visualAppearance="heading-xl"
            color={value}
            removeMarginBottom={false}
          >
            {`heading-xl | ${value}`}
          </Heading>
        </div>
      ))}
    </div>
  ),
};

// US2 contrast-switch matrix. Each row places the same Heading inside a
// different brand-background Section so storybook-eyes records the resolved
// rendered color.
const CONTRAST_MATRIX: ReadonlyArray<{
  label: string;
  bg: 'purpleDark' | 'purpleLight' | 'purpleMid' | 'white';
  color: 'black' | 'white' | 'purpleMid' | 'greenLight' | 'purpleDark';
  expected: string;
}> = [
  {
    label: 'dark-text-on-dark-bg-becomes-white',
    bg: 'purpleDark',
    color: 'black',
    expected: 'white',
  },
  {
    label: 'passthrough (white on dark)',
    bg: 'purpleDark',
    color: 'white',
    expected: 'white',
  },
  {
    label: 'low-contrast-on-light-bg-shifts-to-family-dark (same family)',
    bg: 'purpleLight',
    color: 'purpleMid',
    expected: 'purpleDark',
  },
  {
    label: 'low-contrast-on-light-bg-shifts-to-family-dark (cross family)',
    bg: 'purpleLight',
    color: 'greenLight',
    expected: 'greenDark',
  },
  {
    label: 'low-contrast-on-mid-shifts-to-family-primary',
    bg: 'purpleMid',
    color: 'purpleMid',
    expected: 'purplePrimary',
  },
  {
    label: 'low-contrast-on-white-shifts-to-family-primary',
    bg: 'white',
    color: 'purpleMid',
    expected: 'purplePrimary',
  },
  {
    label: 'white-on-light-becomes-black',
    bg: 'purpleLight',
    color: 'white',
    expected: 'black',
  },
  {
    label: 'passthrough (dark text on light bg)',
    bg: 'purpleLight',
    color: 'purpleDark',
    expected: 'purpleDark',
  },
];

export const ContrastSwitch: Story = {
  render: () => (
    <div style={{display: 'flex', flexDirection: 'column', gap: 16}}>
      {CONTRAST_MATRIX.map(({label, bg, color, expected}) => (
        <Section key={`${bg}-${color}`} background={bg} padding="m">
          <Heading
            visualAppearance="heading-md"
            color={color}
            removeMarginBottom={true}
          >
            {`bg=${bg} | color=${color} → expected=${expected}  (${label})`}
          </Heading>
        </Section>
      ))}
    </div>
  ),
};

// US3 — colorOverride wins over the contrast switch (FR-014). Both rows
// would normally switch (white→black on light, black→white on dark) but the
// hex override pins the rendered color.
export const ColorOverrideBypassesContrastSwitch: Story = {
  render: () => (
    <div style={{display: 'flex', flexDirection: 'column', gap: 16}}>
      <Section background="purpleLight" padding="m">
        <Heading
          visualAppearance="heading-md"
          color="white"
          colorOverride="#FFFFFF"
          removeMarginBottom={true}
        >
          color=white + override #FFFFFF on purpleLight → renders white (would
          be black without override)
        </Heading>
      </Section>
      <Section background="purpleDark" padding="m">
        <Heading
          visualAppearance="heading-md"
          color="black"
          colorOverride="#000000"
          removeMarginBottom={true}
        >
          color=black + override #000000 on purpleDark → renders black (would be
          white without override)
        </Heading>
      </Section>
    </div>
  ),
};

export const Overrides: Story = {
  render: () => (
    <div style={{display: 'flex', flexDirection: 'column', gap: 16}}>
      <Heading
        visualAppearance="heading-xl"
        removeMarginBottom={false}
        fontSize={5}
      >
        heading-xl | fontSize 5rem
      </Heading>
      <Heading
        visualAppearance="heading-xl"
        removeMarginBottom={false}
        lineHeight={1.4}
      >
        heading-xl | lineHeight 1.4
      </Heading>
      <Heading
        visualAppearance="heading-xl"
        removeMarginBottom={false}
        fontWeight="700"
      >
        heading-xl | fontWeight 700 (Bold)
      </Heading>
      <Heading
        visualAppearance="heading-xl"
        removeMarginBottom={false}
        colorOverride="#C03A2B"
      >
        heading-xl | colorOverride #C03A2B
      </Heading>
      <Heading
        visualAppearance="heading-xl"
        removeMarginBottom={false}
        fontKerning="none"
      >
        heading-xl | fontKerning none (AVA WAVE WeKa)
      </Heading>
      <Heading
        visualAppearance="heading-xl"
        removeMarginBottom={false}
        fontSize={3.5}
        lineHeight={1.1}
        fontWeight="700"
        colorOverride="#0B6E4F"
        fontKerning="auto"
      >
        heading-xl | all five overrides
      </Heading>
    </div>
  ),
};
