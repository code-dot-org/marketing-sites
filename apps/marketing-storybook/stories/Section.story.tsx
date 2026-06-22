import {BRAND_COLORS} from '@/components/common/colors';
import Heading from '@/components/contentful/heading';
import Paragraph from '@/components/contentful/paragraph';
import Section, {SectionBackground} from '@/components/contentful/section';
import bgPatternImage from '@public/images/bg-pattern-lines.webp';
import type {Meta, StoryObj} from '@storybook/nextjs-vite';
import {expect} from 'storybook/test';

const meta: Meta<typeof Section> = {
  title: 'Marketing/Section',
  component: Section,
  tags: ['autodocs', 'marketing'],
  parameters: {
    disableSectionDecorator: true,
  },
};
export default meta;
type Story = StoryObj<typeof Section>;

// Legacy backgrounds are exercised below as explicit createStory() exports for
// regression coverage. CodeAI brand-palette backgrounds are listed in the
// Playground control via BRAND_COLORS for selection in Storybook.
const legacyBackgrounds = [
  'primary',
  'secondary',
  'dark',
  'brandPrimary',
  'brandLightPrimary',
  'brandSecondary',
  'brandLightSecondary',
  'brandTertiary',
  'brandLightTertiary',
  'patternDark',
  'patternPrimary',
  'transparent',
] as const;
const backgrounds = [
  ...legacyBackgrounds,
  ...BRAND_COLORS.map(c => c.value),
] as readonly SectionBackground[];
const paddings = ['m', 'l', 'none'] as const;
const themes = ['Light', 'Dark'] as const;
const dividers = ['none', 'primary', 'strong'] as const;

const createStory = (background: SectionBackground): Story => ({
  render: () => (
    <div style={{display: 'flex', flexDirection: 'column', gap: 16}}>
      {paddings.flatMap(padding =>
        themes.flatMap(themeOpt =>
          dividers.map(divider => (
            <Section
              key={`${background}-${padding}-${themeOpt}-${divider}`}
              background={background}
              padding={padding}
              theme={themeOpt}
              divider={divider}
              id={`${background}-${padding}-${themeOpt}-${divider}`}
              className="storybook-section"
            >
              {`Section | background: ${background} | padding: ${padding} | theme: ${themeOpt} | divider: ${divider}`}
            </Section>
          )),
        ),
      )}
    </div>
  ),
  play: async ({canvas}) => {
    for (const padding of paddings) {
      for (const themeOpt of themes) {
        for (const divider of dividers) {
          const sectionText = `Section | background: ${background} | padding: ${padding} | theme: ${themeOpt} | divider: ${divider}`;
          const section = canvas.getByText(sectionText);
          await expect(section).toBeInTheDocument();
        }
      }
    }
  },
});

const scalings = ['cover', 'contain', 'auto', 'manual'] as const;
const repeats = ['no-repeat', 'repeat', 'repeat-x', 'repeat-y'] as const;

export const Playground: Story = {
  args: {
    background: 'white',
    padding: 'l',
    theme: 'Light',
    divider: 'none',
    id: 'playground-section',
    className: '',
    children: 'Playground Section',
  },
  argTypes: {
    background: {control: 'select', options: backgrounds},
    padding: {control: 'select', options: paddings},
    gap: {control: 'number'},
    backgroundImage: {control: 'text'},
    backgroundImageScaling: {control: 'select', options: scalings},
    backgroundImageHeight: {control: 'number'},
    backgroundImagePositionX: {control: 'number'},
    backgroundImagePositionY: {control: 'number'},
    backgroundImageRepeat: {control: 'select', options: repeats},
    backgroundImageUnset: {control: 'boolean'},
    theme: {control: 'select', options: themes},
    divider: {control: 'select', options: dividers},
    id: {control: 'text'},
    className: {control: 'text'},
    children: {control: 'text'},
  },
};

// Example usage for each background:
export const Primary = createStory('primary');
export const Secondary = createStory('secondary');
export const Dark = createStory('dark');
export const BrandPrimary = createStory('brandPrimary');
export const BrandLightPrimary = createStory('brandLightPrimary');
export const BrandSecondary = createStory('brandSecondary');
export const BrandLightSecondary = createStory('brandLightSecondary');
export const BrandTertiary = createStory('brandTertiary');
export const BrandLightTertiary = createStory('brandLightTertiary');
export const PatternDark = createStory('patternDark');
export const PatternPrimary = createStory('patternPrimary');

// Nested-background story — the inner Section re-runs the
// SectionBackgroundProvider with its own background, so the contrast switch
// resolves against the nearest enclosing brand background (FR-013).
export const NestedBackground: Story = {
  render: () => (
    <Section background="purpleDark" padding="l" id="outer">
      <div style={{padding: '1rem 0', color: 'white'}}>
        Outer Section: background=purpleDark. Plain text below relies on
        inherited color (white).
      </div>
      <Section background="purpleLight" padding="m" id="inner">
        <div style={{color: '#000'}}>
          Inner Section: background=purpleLight. The nearest enclosing
          background is the inner Section, so a Heading with color=purpleMid
          placed here would resolve to purpleDark (light-tone rule), NOT to
          white from the outer dark-tone.
        </div>
      </Section>
    </Section>
  ),
};

// CodeAI brand palette — single composite story rendering one Section per
// brand color so storybook-eyes picks up a baseline for all 22 backgrounds
// without producing 22 separate exports.
export const BrandPalette: Story = {
  render: () => (
    <div style={{display: 'flex', flexDirection: 'column', gap: 16}}>
      {BRAND_COLORS.map(({value, displayName}) => (
        <Section
          key={`brand-${value}`}
          background={value}
          padding="m"
          theme="Light"
          divider="none"
          id={`brand-${value}`}
          className="storybook-section"
        >
          {`Section | background: ${value} (${displayName})`}
        </Section>
      ))}
    </div>
  ),
};
export const Transparent = createStory('transparent');

// Gap + background image: visual baseline for the new props. Renders one
// Section with three children stacked at gap=3rem on top of a tiled pattern
// image positioned at top-right, offset slightly past the right edge.
export const GapAndBackgroundImage: Story = {
  render: () => (
    <Section
      background="white"
      padding="l"
      gap={3}
      backgroundImage={bgPatternImage.src}
      backgroundImageScaling="auto"
      backgroundImagePositionX={105}
      backgroundImagePositionY={0}
      backgroundImageRepeat="no-repeat"
      id="gap-and-bg-image"
    >
      <div>First child</div>
      <div>Second child — 3rem above me, 3rem below me.</div>
      <div>Third child</div>
    </Section>
  ),
};

// Transparent section wrapped in a dark ancestor — descendants see the
// 'transparent' sentinel and skip contrast switching, so the author's
// chosen color renders verbatim. White text reads against the ancestor's
// dark color (the regression PR #136 introduced); Black stays black.
export const TransparentOnDarkAncestor: Story = {
  render: () => (
    <div
      style={{
        backgroundColor: '#1f1976',
      }}
    >
      <Section
        background="transparent"
        padding="l"
        id="transparent-on-dark-ancestor"
      >
        <Heading
          color="white"
          visualAppearance="heading-md"
          removeMarginBottom={false}
        >
          White heading — literal #FFFFFF
        </Heading>
        <Paragraph color="white" removeMarginBottom={false}>
          White paragraph — also literal #FFFFFF; no auto-flip to black under
          a Transparent section.
        </Paragraph>
        <Paragraph color="black" removeMarginBottom={false}>
          Black paragraph — renders black verbatim (author opted in).
        </Paragraph>
      </Section>
    </div>
  ),
};

// Transparent section with a dark background image — same suppression rule.
// The Section emits no data-bg-tone and the context delivers 'transparent',
// so descendants render the author-chosen color.
export const TransparentWithBackgroundImage: Story = {
  render: () => (
    <Section
      background="transparent"
      padding="l"
      backgroundImage={bgPatternImage.src}
      backgroundImageScaling="cover"
      id="transparent-with-bg-image"
    >
      <Heading
        color="white"
        visualAppearance="heading-md"
        removeMarginBottom={false}
      >
        White heading — verbatim against the image
      </Heading>
      <Paragraph color="black" removeMarginBottom={false}>
        Black paragraph — verbatim.
      </Paragraph>
    </Section>
  ),
};

// White text vs. Default (Black) text on brand backgrounds:
//   - White is literal #FFFFFF on every background (passthrough).
//   - Black flips to white on dark backgrounds via the contrast switch.
//   - Black stays black on light/mid backgrounds.
export const WhiteAndDefaultAcrossBrandBackgrounds: Story = {
  render: () => (
    <div style={{display: 'flex', flexDirection: 'column', gap: 0}}>
      {(
        [
          'purpleDark',
          'pinkLight',
          'white',
          'black',
        ] as const satisfies readonly SectionBackground[]
      ).map(bg => (
        <Section
          key={`white-vs-default-${bg}`}
          background={bg}
          padding="m"
          id={`white-vs-default-${bg}`}
        >
          <Heading
            color="white"
            visualAppearance="heading-md"
            removeMarginBottom={false}
          >
            background={bg} — White heading (always #FFFFFF)
          </Heading>
          <Heading
            color="black"
            visualAppearance="heading-md"
            removeMarginBottom={false}
          >
            background={bg} — Default/Black heading (flips on dark)
          </Heading>
        </Section>
      ))}
    </div>
  ),
};
