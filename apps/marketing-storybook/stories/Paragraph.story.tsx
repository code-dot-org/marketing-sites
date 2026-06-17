import {BRAND_COLORS} from '@/components/common/colors';
import Paragraph from '@/components/contentful/paragraph';
import Section from '@/components/contentful/section';
import type {Meta, StoryObj} from '@storybook/nextjs-vite';
import {expect} from 'storybook/test';

const meta: Meta<typeof Paragraph> = {
  title: 'Marketing/Paragraph',
  component: Paragraph,
  tags: ['autodocs', 'marketing'],
};
export default meta;
type Story = StoryObj<typeof Paragraph>;

export const Playground: Story = {
  args: {
    children:
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed euismod, urna eu tincidunt consectetur, nisi nisl aliquam enim, vitae facilisis sapien enim nec urna. Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia curae; Integer ac sem nec urna cursus dictum. Etiam euismod, velit eu facilisis cursus, enim erat dictum urna, nec dictum massa erat nec enim. Mauris ac sapien vitae erat cursus dictum.',
    visualAppearance: 'body-one',
    isStrong: false,
    isItalic: false,
    color: 'primary',
    colorOverride: '',
    textTransform: 'none',
    removeMarginBottom: false,
    className: '',
  },
  argTypes: {
    children: {control: 'text'},
    visualAppearance: {
      control: {type: 'select'},
      options: ['body-one', 'body-two', 'body-three', 'body-four'],
    },
    isStrong: {control: 'boolean'},
    isItalic: {control: 'boolean'},
    color: {
      control: {type: 'select'},
      options: [...BRAND_COLORS.map(c => c.value), 'secondary'],
    },
    colorOverride: {control: 'text'},
    textTransform: {
      control: {type: 'select'},
      options: ['none', 'uppercase', 'lowercase', 'capitalize'],
    },
    removeMarginBottom: {control: 'boolean'},
    className: {control: 'text'},
  },
};

// US2 contrast-switch coverage. Same pattern as Heading.ContrastSwitch.
const PARAGRAPH_CONTRAST_MATRIX = [
  {bg: 'purpleDark' as const, color: 'black' as const, expected: 'white'},
  {
    bg: 'purpleDark' as const,
    color: 'white' as const,
    expected: 'white (passthrough)',
  },
  {
    bg: 'purpleLight' as const,
    color: 'purpleMid' as const,
    expected: 'purpleDark',
  },
  {
    bg: 'purpleLight' as const,
    color: 'greenLight' as const,
    expected: 'greenDark (cross-family)',
  },
  {
    bg: 'purpleMid' as const,
    color: 'purpleMid' as const,
    expected: 'purplePrimary',
  },
  {
    bg: 'white' as const,
    color: 'purpleMid' as const,
    expected: 'purplePrimary',
  },
  {bg: 'purpleLight' as const, color: 'white' as const, expected: 'black'},
  {
    bg: 'purpleLight' as const,
    color: 'purpleDark' as const,
    expected: 'purpleDark (passthrough)',
  },
];

export const ContrastSwitch: Story = {
  render: () => (
    <div style={{display: 'flex', flexDirection: 'column', gap: 12}}>
      {PARAGRAPH_CONTRAST_MATRIX.map(({bg, color, expected}) => (
        <Section key={`${bg}-${color}`} background={bg} padding="m">
          <Paragraph
            visualAppearance="body-two"
            color={color}
            removeMarginBottom={true}
          >
            {`bg=${bg} | color=${color} → expected=${expected}`}
          </Paragraph>
        </Section>
      ))}
    </div>
  ),
};

export const BodyOne: Story = {
  render: () => (
    <Paragraph
      visualAppearance="body-one"
      isStrong={false}
      color="primary"
      removeMarginBottom={false}
    >
      Body One Paragraph
    </Paragraph>
  ),
  play: async ({canvas}) => {
    const bodyOne = canvas.getByText('Body One Paragraph');
    expect(bodyOne).toBeInTheDocument();
  },
};

export const BodyTwo: Story = {
  render: () => (
    <Paragraph
      visualAppearance="body-two"
      isStrong={false}
      color="secondary"
      removeMarginBottom={false}
    >
      Body Two Paragraph
    </Paragraph>
  ),
  play: async ({canvas}) => {
    const bodyTwo = canvas.getByText('Body Two Paragraph');
    expect(bodyTwo).toBeInTheDocument();
  },
};

export const BodyThree: Story = {
  render: () => (
    <Paragraph
      visualAppearance="body-three"
      isStrong={false}
      color="primary"
      removeMarginBottom={false}
    >
      Body Three Paragraph
    </Paragraph>
  ),
  play: async ({canvas}) => {
    const bodyThree = canvas.getByText('Body Three Paragraph');
    expect(bodyThree).toBeInTheDocument();
  },
};

export const BodyFour: Story = {
  render: () => (
    <Paragraph
      visualAppearance="body-four"
      isStrong={false}
      color="secondary"
      removeMarginBottom={false}
    >
      Body Four Paragraph
    </Paragraph>
  ),
  play: async ({canvas}) => {
    const bodyFour = canvas.getByText('Body Four Paragraph');
    expect(bodyFour).toBeInTheDocument();
  },
};

export const StrongBodyOne: Story = {
  render: () => (
    <Paragraph
      visualAppearance="body-one"
      isStrong={true}
      color="primary"
      removeMarginBottom={false}
    >
      Strong Body One Paragraph
    </Paragraph>
  ),
  play: async ({canvas}) => {
    const strongBodyOne = canvas.getByText('Strong Body One Paragraph');
    expect(strongBodyOne).toBeInTheDocument();
  },
};

export const ItalicBodyOne: Story = {
  render: () => (
    <Paragraph
      visualAppearance="body-one"
      isItalic={true}
      color="primary"
      removeMarginBottom={false}
    >
      Italic Body One Paragraph
    </Paragraph>
  ),
  play: async ({canvas}) => {
    const italicBodyOne = canvas.getByText('Italic Body One Paragraph');
    expect(italicBodyOne).toBeInTheDocument();
  },
};

export const PurplePrimaryBodyTwo: Story = {
  render: () => (
    <Paragraph
      visualAppearance="body-two"
      color="purplePrimary"
      removeMarginBottom={false}
    >
      Purple Primary Body Two Paragraph
    </Paragraph>
  ),
  play: async ({canvas}) => {
    const purpleBodyTwo = canvas.getByText('Purple Primary Body Two Paragraph');
    expect(purpleBodyTwo).toBeInTheDocument();
  },
};
