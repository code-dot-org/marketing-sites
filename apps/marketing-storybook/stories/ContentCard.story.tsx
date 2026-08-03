/* eslint-disable @typescript-eslint/no-explicit-any */

import ContentCard, {
  CONTENT_CARD_COLORS,
  CONTENT_CARD_STYLES,
  CONTENT_CARD_TITLE_APPEARANCES,
  CONTENT_CARD_TITLE_CASES,
  ContentCardProps,
} from '@/components/contentful/contentCard';
import {Meta, StoryObj} from '@storybook/react';
import {within} from '@testing-library/dom';
import {expect} from 'storybook/test';

import ContentCardMock from './__mocks__/ContentCard.json';

const meta: Meta<ContentCardProps> = {
  title: 'Marketing/ContentCard',
  component: ContentCard,
  tags: ['autodocs'],
  argTypes: {
    cardStyle: {
      control: 'select',
      options: [...CONTENT_CARD_STYLES],
    },
    badgeColor: {
      control: 'select',
      options: ['black', 'purple', 'blue', 'green', 'orange', 'pink'],
    },
    titleColor: {
      control: 'select',
      options: [...CONTENT_CARD_COLORS],
    },
    titleCase: {
      control: 'select',
      options: [...CONTENT_CARD_TITLE_CASES],
    },
    titleAppearance: {
      control: 'select',
      options: [...CONTENT_CARD_TITLE_APPEARANCES],
    },
    linkColor: {
      control: 'select',
      options: [...CONTENT_CARD_COLORS],
    },
    titleOverlay: {control: 'boolean'},
    linkTextOverride: {control: 'text'},
    linkIconOverride: {control: 'text'},
  },
  decorators: [
    Story => (
      <div style={{maxWidth: '360px'}}>
        <Story />
      </div>
    ),
  ],
};
export default meta;

type Story = StoryObj<ContentCardProps>;

const mockArgs = ContentCardMock as any as ContentCardProps;

export const Playground: Story = {
  args: {...mockArgs},
  render: args => <ContentCard {...args} />,
};

export const Outline: Story = {
  render: () => <ContentCard {...mockArgs} />,
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);
    const heading = canvas.getByRole('heading', {level: 3});
    await expect(heading.textContent).toBe('Meet the CodeAI President & CEO');
    const link = canvas.getByRole('link', {name: 'Read post'});
    await expect(link).toHaveAttribute('href', '/blog-test');
  },
};

export const Flat: Story = {
  render: () => <ContentCard {...mockArgs} cardStyle="flat" />,
};

export const Overlay: Story = {
  render: () => <ContentCard {...mockArgs} cardStyle="overlay" />,
};

export const TitleOverlay: Story = {
  render: () => <ContentCard {...mockArgs} titleOverlay />,
};

export const TitleOverlayFlat: Story = {
  render: () => <ContentCard {...mockArgs} cardStyle="flat" titleOverlay />,
};

export const LinkOverrides: Story = {
  render: () => (
    <ContentCard
      {...mockArgs}
      linkTextOverride="Explore the post"
      linkIconOverride="star"
    />
  ),
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);
    await expect(
      canvas.getByRole('link', {name: 'Explore the post'}),
    ).toBeVisible();
  },
};

export const LargeTitleAppearance: Story = {
  render: () => <ContentCard {...mockArgs} titleAppearance="display-2xl" />,
};

export const ColoredTitleAndLink: Story = {
  render: () => (
    <ContentCard
      {...mockArgs}
      titleColor="purple"
      titleCase="uppercase"
      linkColor="pink"
    />
  ),
};

export const AllStyles: Story = {
  decorators: [],
  render: () => (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr 1fr',
        gap: '16px',
      }}
    >
      {CONTENT_CARD_STYLES.map((cardStyle, idx) => (
        <ContentCard
          key={cardStyle}
          {...mockArgs}
          cardStyle={cardStyle}
          title={`${cardStyle[0].toUpperCase()}${cardStyle.slice(1)} card`}
          // Varying description lengths exercise the equal-height layout:
          // the flexible gap opens between the description and the link.
          description={
            idx === 1
              ? 'A short description.'
              : mockArgs.description?.repeat(idx === 2 ? 2 : 1)
          }
        />
      ))}
    </div>
  ),
};

export const Placeholder: Story = {
  render: () => <ContentCard />,
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText(/Content Card placeholder/)).toBeVisible();
  },
};
