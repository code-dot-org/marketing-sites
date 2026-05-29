import Heading from '@/components/contentful/heading';
import type {Meta, StoryObj} from '@storybook/nextjs-vite';
import {expect} from 'storybook/test';

const meta: Meta<typeof Heading> = {
  title: 'Marketing/Heading',
  component: Heading,
  tags: ['autodocs', 'marketing'],
};
export default meta;
type Story = StoryObj<typeof Heading>;

export const Playground: Story = {
  args: {
    children: 'Playground Heading',
    visualAppearance: 'heading-xl',
    color: 'primary',
    className: '',
    removeMarginBottom: false,
    useAltFont: false,
  },
  argTypes: {
    children: {control: 'text'},
    visualAppearance: {
      control: {type: 'select'},
      options: [
        'heading-xxl',
        'heading-xl',
        'heading-lg',
        'heading-md',
        'heading-sm',
        'heading-xs',
      ],
    },
    color: {
      control: {type: 'select'},
      options: ['primary', 'white'],
    },
    className: {control: 'text'},
    removeMarginBottom: {control: 'boolean'},
    useAltFont: {control: 'boolean'},
    fontSize: {control: {type: 'number', min: 0.5, max: 12, step: 0.125}},
    lineHeight: {control: {type: 'number', min: 0.5, max: 3, step: 0.05}},
    fontWeight: {
      control: {type: 'select'},
      options: [undefined, '500', '700'],
    },
    colorOverride: {control: 'color'},
    fontKerning: {
      control: {type: 'select'},
      options: [undefined, 'auto', 'normal', 'none'],
    },
  },
};

export const HeadingXXL: Story = {
  render: () => (
    <div style={{display: 'flex', flexDirection: 'column', gap: 16}}>
      {(['primary', 'white'] as const)
        .map(color =>
          ([false, true] as const).map(removeMarginBottom => (
            <div
              key={`heading-xxl-${color}-${removeMarginBottom}`}
              style={color === 'white' ? {background: '#333', padding: 8} : {}}
            >
              <Heading
                visualAppearance="heading-xxl"
                color={color as 'primary' | 'white'}
                removeMarginBottom={removeMarginBottom}
              >
                {`heading-xxl | ${color} | removeMarginBottom: ${removeMarginBottom}`}
              </Heading>
            </div>
          )),
        )
        .flat()}
    </div>
  ),
  play: async ({canvas}) => {
    for (const color of ['primary', 'white'] as const) {
      for (const removeMarginBottom of [false, true] as const) {
        const headingText = `heading-xxl | ${color} | removeMarginBottom: ${removeMarginBottom}`;
        const heading = canvas.getByRole('heading', {name: headingText});
        expect(heading).toBeInTheDocument();
      }
    }
  },
};

export const HeadingXL: Story = {
  render: () => (
    <div style={{display: 'flex', flexDirection: 'column', gap: 16}}>
      {(['primary', 'white'] as const)
        .map(color =>
          ([false, true] as const).map(removeMarginBottom => (
            <div
              key={`heading-xl-${color}-${removeMarginBottom}`}
              style={color === 'white' ? {background: '#333', padding: 8} : {}}
            >
              <Heading
                visualAppearance="heading-xl"
                color={color as 'primary' | 'white'}
                removeMarginBottom={removeMarginBottom}
              >
                {`heading-xl | ${color} | removeMarginBottom: ${removeMarginBottom}`}
              </Heading>
            </div>
          )),
        )
        .flat()}
    </div>
  ),
  play: async ({canvas}) => {
    for (const color of ['primary', 'white'] as const) {
      for (const removeMarginBottom of [false, true] as const) {
        const headingText = `heading-xl | ${color} | removeMarginBottom: ${removeMarginBottom}`;
        const heading = canvas.getByRole('heading', {name: headingText});
        expect(heading).toBeInTheDocument();
      }
    }
  },
};

export const HeadingLG: Story = {
  render: () => (
    <div style={{display: 'flex', flexDirection: 'column', gap: 16}}>
      {(['primary', 'white'] as const)
        .map(color =>
          ([false, true] as const).map(removeMarginBottom => (
            <div
              key={`heading-lg-${color}-${removeMarginBottom}`}
              style={color === 'white' ? {background: '#333', padding: 8} : {}}
            >
              <Heading
                visualAppearance="heading-lg"
                color={color as 'primary' | 'white'}
                removeMarginBottom={removeMarginBottom}
              >
                {`heading-lg | ${color} | removeMarginBottom: ${removeMarginBottom}`}
              </Heading>
            </div>
          )),
        )
        .flat()}
    </div>
  ),
  play: async ({canvas}) => {
    for (const color of ['primary', 'white'] as const) {
      for (const removeMarginBottom of [false, true] as const) {
        const headingText = `heading-lg | ${color} | removeMarginBottom: ${removeMarginBottom}`;
        const heading = canvas.getByRole('heading', {name: headingText});
        expect(heading).toBeInTheDocument();
      }
    }
  },
};

export const HeadingMD: Story = {
  render: () => (
    <div style={{display: 'flex', flexDirection: 'column', gap: 16}}>
      {(['primary', 'white'] as const)
        .map(color =>
          ([false, true] as const).map(removeMarginBottom => (
            <div
              key={`heading-md-${color}-${removeMarginBottom}`}
              style={color === 'white' ? {background: '#333', padding: 8} : {}}
            >
              <Heading
                visualAppearance="heading-md"
                color={color as 'primary' | 'white'}
                removeMarginBottom={removeMarginBottom}
              >
                {`heading-md | ${color} | removeMarginBottom: ${removeMarginBottom}`}
              </Heading>
            </div>
          )),
        )
        .flat()}
    </div>
  ),
  play: async ({canvas}) => {
    for (const color of ['primary', 'white'] as const) {
      for (const removeMarginBottom of [false, true] as const) {
        const headingText = `heading-md | ${color} | removeMarginBottom: ${removeMarginBottom}`;
        const heading = canvas.getByRole('heading', {name: headingText});
        expect(heading).toBeInTheDocument();
      }
    }
  },
};

export const HeadingSM: Story = {
  render: () => (
    <div style={{display: 'flex', flexDirection: 'column', gap: 16}}>
      {(['primary', 'white'] as const)
        .map(color =>
          ([false, true] as const).map(removeMarginBottom => (
            <div
              key={`heading-sm-${color}-${removeMarginBottom}`}
              style={color === 'white' ? {background: '#333', padding: 8} : {}}
            >
              <Heading
                visualAppearance="heading-sm"
                color={color as 'primary' | 'white'}
                removeMarginBottom={removeMarginBottom}
              >
                {`heading-sm | ${color} | removeMarginBottom: ${removeMarginBottom}`}
              </Heading>
            </div>
          )),
        )
        .flat()}
    </div>
  ),
  play: async ({canvas}) => {
    for (const color of ['primary', 'white'] as const) {
      for (const removeMarginBottom of [false, true] as const) {
        const headingText = `heading-sm | ${color} | removeMarginBottom: ${removeMarginBottom}`;
        const heading = canvas.getByRole('heading', {name: headingText});
        expect(heading).toBeInTheDocument();
      }
    }
  },
};

export const HeadingXS: Story = {
  render: () => (
    <div style={{display: 'flex', flexDirection: 'column', gap: 16}}>
      {(['primary', 'white'] as const)
        .map(color =>
          ([false, true] as const).map(removeMarginBottom => (
            <div
              key={`heading-xs-${color}-${removeMarginBottom}`}
              style={color === 'white' ? {background: '#333', padding: 8} : {}}
            >
              <Heading
                visualAppearance="heading-xs"
                color={color as 'primary' | 'white'}
                removeMarginBottom={removeMarginBottom}
              >
                {`heading-xs | ${color} | removeMarginBottom: ${removeMarginBottom}`}
              </Heading>
            </div>
          )),
        )
        .flat()}
    </div>
  ),
  play: async ({canvas}) => {
    for (const color of ['primary', 'white'] as const) {
      for (const removeMarginBottom of [false, true] as const) {
        const headingText = `heading-xs | ${color} | removeMarginBottom: ${removeMarginBottom}`;
        const heading = canvas.getByRole('heading', {name: headingText});
        expect(heading).toBeInTheDocument();
      }
    }
  },
};

const ALT_LEVELS = [
  'heading-xxl',
  'heading-xl',
  'heading-lg',
  'heading-md',
  'heading-sm',
  'heading-xs',
] as const;

export const AltFontDefaults: Story = {
  render: () => (
    <div style={{display: 'flex', flexDirection: 'column', gap: 16}}>
      {ALT_LEVELS.map(level => (
        <Heading
          key={`alt-default-${level}`}
          visualAppearance={level}
          removeMarginBottom={false}
          useAltFont
        >
          {`${level} | alt font default`}
        </Heading>
      ))}
    </div>
  ),
};

export const AltFontOverrides: Story = {
  render: () => (
    <div style={{display: 'flex', flexDirection: 'column', gap: 16}}>
      <Heading
        visualAppearance="heading-xl"
        removeMarginBottom={false}
        useAltFont
        fontSize={5}
      >
        heading-xl | fontSize 5rem
      </Heading>
      <Heading
        visualAppearance="heading-xl"
        removeMarginBottom={false}
        useAltFont
        lineHeight={1.4}
      >
        heading-xl | lineHeight 1.4
      </Heading>
      <Heading
        visualAppearance="heading-xl"
        removeMarginBottom={false}
        useAltFont
        fontWeight="500"
      >
        heading-xl | fontWeight 500 (Medium)
      </Heading>
      <Heading
        visualAppearance="heading-xl"
        removeMarginBottom={false}
        useAltFont
        colorOverride="#C03A2B"
      >
        heading-xl | colorOverride #C03A2B
      </Heading>
      <Heading
        visualAppearance="heading-xl"
        removeMarginBottom={false}
        useAltFont
        fontKerning="none"
      >
        heading-xl | fontKerning none (AVA WAVE WeKa)
      </Heading>
      <Heading
        visualAppearance="heading-xl"
        removeMarginBottom={false}
        useAltFont
        fontSize={3.5}
        lineHeight={1.1}
        fontWeight="500"
        colorOverride="#0B6E4F"
        fontKerning="normal"
      >
        heading-xl | all five overrides
      </Heading>
    </div>
  ),
};
