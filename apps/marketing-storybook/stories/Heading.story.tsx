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
    appearance: {
      control: {type: 'select'},
      options: [
        'default',
        'display-4xl',
        'display-3xl',
        'display-2xl',
        'display-xl',
        'display-lg',
        'display-md',
        'display-sm',
        'display-xs',
      ],
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
      options: [undefined, 'default', '400', '500', '600', '700'],
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

// Spec 009 — canonical role-token defaults for every Heading Level.
// Editing ROLE_TOKENS in themes/code.org/typography/tokens.ts changes the
// rendered output of this story without touching this file.
export const DefaultsPerLevel: Story = {
  render: () => (
    <div style={{display: 'flex', flexDirection: 'column', gap: 8}}>
      <Heading visualAppearance="heading-xxl" removeMarginBottom={false}>
        Heading 1 default — Space Grotesk, Display xl, Semibold (600)
      </Heading>
      <Heading visualAppearance="heading-xl" removeMarginBottom={false}>
        Heading 2 default — Space Grotesk, Display lg, Medium (500)
      </Heading>
      <Heading visualAppearance="heading-lg" removeMarginBottom={false}>
        Heading 3 default — Space Grotesk, Display md, Medium (500)
      </Heading>
      <Heading visualAppearance="heading-md" removeMarginBottom={false}>
        Heading 4 default — Space Grotesk, Display sm, Medium (500)
      </Heading>
      <Heading visualAppearance="heading-sm" removeMarginBottom={false}>
        Heading 5 default — Space Grotesk, Display xs, Medium (500)
      </Heading>
      <Heading visualAppearance="heading-xs" removeMarginBottom={false}>
        Heading 6 default — Space Grotesk, Display xs, Medium (500)
      </Heading>
    </div>
  ),
};

// Spec 009 US3 + amendment-4 — Heading Level ⊥ Visual Appearance.
// The semantic <h*> tag AND weight + font-family come from "Heading Level";
// "Visual Appearance" is a SIZE-only override. To get "h2 looks like H1"
// the author sets BOTH Visual Appearance = Display xl AND the individual
// fontWeight override to '600' (Semibold) — two clicks, not one.
//
// The demo intentionally mixes h1/h2/h4 in one container to show that
// the semantic tag stays tied to Heading Level regardless of size; the
// axe `heading-order` rule is correctly flagging the mixed order, but
// here it's a deliberate demonstration, not a production a11y concern.
export const OrthogonalHeadingLevelVsAppearance: Story = {
  parameters: {
    a11y: {
      config: {
        rules: [{id: 'heading-order', enabled: false}],
      },
    },
  },
  render: () => (
    <div style={{display: 'flex', flexDirection: 'column', gap: 16}}>
      <Heading
        visualAppearance="heading-xl"
        appearance="display-xl"
        fontWeight="600"
        removeMarginBottom={false}
      >
        &lt;h2&gt; that looks like H1 — Level=Heading 2, Appearance=Display xl,
        fontWeight=Semibold
      </Heading>
      <Heading
        visualAppearance="heading-xl"
        appearance="display-xl"
        removeMarginBottom={false}
      >
        &lt;h2&gt; with only Appearance=Display xl (no weight override) —
        renders at H1's size but H2's Medium weight
      </Heading>
      <Heading
        visualAppearance="heading-xxl"
        appearance="display-lg"
        removeMarginBottom={false}
      >
        &lt;h1&gt; visually smaller — Level=Heading 1, Appearance=Display lg
        (size only — keeps H1's Semibold weight)
      </Heading>
      <Heading
        visualAppearance="heading-md"
        appearance="display-4xl"
        removeMarginBottom={false}
      >
        &lt;h4&gt; visually huge — Level=Heading 4, Appearance=Display 4xl (H4's
        Medium weight applied at Display 4xl size)
      </Heading>
      <Heading
        visualAppearance="heading-xxl"
        appearance="default"
        removeMarginBottom={false}
      >
        &lt;h1&gt; canonical default (Appearance=Default)
      </Heading>
    </div>
  ),
};

// Beyond canonical — the 2 extra Display cells (4xl, 3xl) above H1's 2xl.
export const VisualAppearanceBeyondCanonical: Story = {
  render: () => (
    <div style={{display: 'flex', flexDirection: 'column', gap: 16}}>
      <Heading
        visualAppearance="heading-xl"
        appearance="display-4xl"
        removeMarginBottom={false}
      >
        Display 4xl
      </Heading>
      <Heading
        visualAppearance="heading-xl"
        appearance="display-3xl"
        removeMarginBottom={false}
      >
        Display 3xl
      </Heading>
      <Heading
        visualAppearance="heading-xl"
        appearance="display-2xl"
        removeMarginBottom={false}
      >
        Display 2xl (canonical H1)
      </Heading>
    </div>
  ),
};

// Spec 009 US6 — responsive ladder. At every supported viewport width:
// (a) no heading shrinks below the 1rem (16px) body floor;
// (b) the H1→H6→body sequence stays non-increasing.
// Use Storybook's viewport toolbar (or the `parameters.viewport`) to step
// through mobile-sm / mobile / tablet / desktop / desktop-lg widths.
export const ResponsiveLadder: Story = {
  parameters: {
    viewport: {
      defaultViewport: 'mobile1',
    },
  },
  render: () => (
    <div style={{display: 'flex', flexDirection: 'column', gap: 4}}>
      <Heading visualAppearance="heading-xxl" removeMarginBottom={true}>
        Heading 1 (responsive)
      </Heading>
      <Heading visualAppearance="heading-xl" removeMarginBottom={true}>
        Heading 2 (responsive)
      </Heading>
      <Heading visualAppearance="heading-lg" removeMarginBottom={true}>
        Heading 3 (responsive)
      </Heading>
      <Heading visualAppearance="heading-md" removeMarginBottom={true}>
        Heading 4 (responsive)
      </Heading>
      <Heading visualAppearance="heading-sm" removeMarginBottom={true}>
        Heading 5 (responsive)
      </Heading>
      <Heading visualAppearance="heading-xs" removeMarginBottom={true}>
        Heading 6 (responsive)
      </Heading>
      <p style={{margin: 0}}>Body default (1rem floor)</p>
    </div>
  ),
};

// Spec 009 US5 — restored Noto Sans i18n fallback chain.
// When the primary face (Space Grotesk for Heading, Geist for Paragraph)
// lacks a glyph, the browser falls through the 20-variant Noto Sans cascade
// before reaching the generic sans-serif. This story exercises 5 scripts;
// each line should render in a coherent typographic style (not the browser
// default fallback for the missing-glyph script).
export const NotoSansFallbackChain: Story = {
  render: () => (
    <div style={{display: 'flex', flexDirection: 'column', gap: 12}}>
      <Heading visualAppearance="heading-lg" removeMarginBottom={false}>
        Latin — The quick brown fox
      </Heading>
      <Heading visualAppearance="heading-lg" removeMarginBottom={false}>
        Arabic — الثعلب البني السريع
      </Heading>
      <Heading visualAppearance="heading-lg" removeMarginBottom={false}>
        Devanagari — तेज भूरी लोमड़ी
      </Heading>
      <Heading visualAppearance="heading-lg" removeMarginBottom={false}>
        Japanese — 素早い茶色のキツネ
      </Heading>
      <Heading visualAppearance="heading-lg" removeMarginBottom={false}>
        Korean — 빠른 갈색 여우
      </Heading>
    </div>
  ),
};

// All three steps compose: Heading Level seeds, Visual Appearance overrides
// the cell, individual override fields top precedence.
export const ResolutionChain: Story = {
  render: () => (
    <div style={{display: 'flex', flexDirection: 'column', gap: 16}}>
      <Heading
        visualAppearance="heading-lg"
        appearance="display-xl"
        fontWeight="700"
        removeMarginBottom={false}
      >
        h3 → Display xl cell → Bold (3 steps composed)
      </Heading>
      <Heading
        visualAppearance="heading-xl"
        appearance="display-4xl"
        fontSize={5}
        removeMarginBottom={false}
      >
        h2 → Display 4xl cell → fontSize 5rem override
      </Heading>
    </div>
  ),
};

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
