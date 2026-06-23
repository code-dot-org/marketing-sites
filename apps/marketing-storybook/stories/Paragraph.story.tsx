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
    visualAppearance: 'text-md',
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
      // Amendment-4 — Studio dropdown only offers the 8 Text-scale cells.
      // text-md is the default and appears first.
      options: [
        'text-md',
        'text-4xl',
        'text-3xl',
        'text-2xl',
        'text-xl',
        'text-lg',
        'text-sm',
        'text-xs',
      ],
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

// Spec 009 amendment-4 — canonical role-token defaults for every Text
// cell. text-md is the locked body default (1rem / 1.5rem / weight 400
// Regular). Editing ROLE_TOKENS in themes/code.org/typography/tokens.ts
// changes the rendered output of this story without touching this file.
export const DefaultsByVariant: Story = {
  render: () => (
    <div style={{display: 'flex', flexDirection: 'column', gap: 12}}>
      <Paragraph visualAppearance="text-md" removeMarginBottom={false}>
        text-md — Text md Regular (1rem / 1.5rem / weight 400) — LOCKED default
      </Paragraph>
      <Paragraph visualAppearance="text-lg" removeMarginBottom={false}>
        text-lg — Text lg Regular (1.125rem / 1.75rem / weight 400)
      </Paragraph>
      <Paragraph visualAppearance="text-sm" removeMarginBottom={false}>
        text-sm — Text sm Regular (0.875rem / 1.25rem / weight 400)
      </Paragraph>
      <Paragraph visualAppearance="text-xs" removeMarginBottom={false}>
        text-xs — Text xs Regular (0.75rem / 1.125rem / weight 400)
      </Paragraph>
    </div>
  ),
};

// Spec 009 US3 — full widened Text scale.
// 4 legacy values + 8 new text-* values. The naming-equivalent pairs
// (text-md ↔ body-two etc.) produce identical rendered output.
export const FullTextScale: Story = {
  render: () => (
    <div style={{display: 'flex', flexDirection: 'column', gap: 12}}>
      <Paragraph visualAppearance="text-4xl" removeMarginBottom={false}>
        text-4xl (2.25rem / 36px)
      </Paragraph>
      <Paragraph visualAppearance="text-3xl" removeMarginBottom={false}>
        text-3xl (1.875rem / 30px)
      </Paragraph>
      <Paragraph visualAppearance="text-2xl" removeMarginBottom={false}>
        text-2xl (1.5rem / 24px)
      </Paragraph>
      <Paragraph visualAppearance="text-xl" removeMarginBottom={false}>
        text-xl (1.25rem / 20px)
      </Paragraph>
      <Paragraph visualAppearance="text-lg" removeMarginBottom={false}>
        text-lg (1.125rem / 18px) — same cell as body-one
      </Paragraph>
      <Paragraph visualAppearance="text-md" removeMarginBottom={false}>
        text-md (1rem / 16px) — same cell as body-two (LOCKED default)
      </Paragraph>
      <Paragraph visualAppearance="text-sm" removeMarginBottom={false}>
        text-sm (0.875rem / 14px) — same cell as body-three
      </Paragraph>
      <Paragraph visualAppearance="text-xs" removeMarginBottom={false}>
        text-xs (0.75rem / 12px) — same cell as body-four
      </Paragraph>
    </div>
  ),
};

// Spec 009 US4 — individual overrides take top precedence and only override
// their own dimension; everything else flows through the role token chain.
export const Overrides: Story = {
  render: () => (
    <div style={{display: 'flex', flexDirection: 'column', gap: 12}}>
      <Paragraph
        visualAppearance="body-two"
        isStrong
        removeMarginBottom={false}
      >
        body-two + isStrong → Semibold (600)
      </Paragraph>
      <Paragraph visualAppearance="text-lg" isItalic removeMarginBottom={false}>
        text-lg + isItalic → italic
      </Paragraph>
      <Paragraph
        visualAppearance="text-2xl"
        isStrong
        isItalic
        removeMarginBottom={false}
      >
        text-2xl + isStrong + isItalic
      </Paragraph>
      <Paragraph
        visualAppearance="body-two"
        colorOverride="#C03A2B"
        removeMarginBottom={false}
      >
        body-two + colorOverride #C03A2B
      </Paragraph>
    </div>
  ),
};

// Amendment-4 — legacy `body-*` stored values continue to render correctly
// via resolveParagraphStyles's auto-map, even though Studio no longer
// offers them in the dropdown. This story exists as the storybook-eyes
// baseline for the back-compat guarantee.
export const LegacyStoredValuesStillRender: Story = {
  render: () => (
    <div style={{display: 'flex', flexDirection: 'column', gap: 16}}>
      <Paragraph visualAppearance="body-two" removeMarginBottom={false}>
        body-two (legacy) — renders via body2 variant (Text md Regular)
      </Paragraph>
      <Paragraph visualAppearance="body-one" removeMarginBottom={false}>
        body-one (legacy) — renders via body1 variant (Text lg Regular)
      </Paragraph>
      <Paragraph visualAppearance="body-three" removeMarginBottom={false}>
        body-three (legacy) — renders via body3 variant (Text sm Regular)
      </Paragraph>
      <Paragraph visualAppearance="body-four" removeMarginBottom={false}>
        body-four (legacy) — renders via body4 variant (Text xs Regular)
      </Paragraph>
    </div>
  ),
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
