/* eslint-disable @typescript-eslint/no-explicit-any */

import CardCarousel, {
  CardCarouselProps,
  CARD_CAROUSEL_CARDS_PER_VIEW,
  CARD_CAROUSEL_NAV_POSITIONS,
} from '@/components/contentful/cardCarousel';
import {
  CONTENT_CARD_COLORS,
  CONTENT_CARD_STYLES,
  CONTENT_CARD_TITLE_APPEARANCES,
  CONTENT_CARD_TITLE_CASES,
} from '@/components/contentful/contentCard';
import {Meta, StoryObj} from '@storybook/react';
import {within} from '@testing-library/dom';
import {expect} from 'storybook/test';

import CardCarouselCardsMock from './__mocks__/CardCarouselCards.json';

const meta: Meta<CardCarouselProps> = {
  title: 'Marketing/CardCarousel',
  component: CardCarousel,
  tags: ['autodocs'],
  parameters: {eyes: {include: false}},
  argTypes: {
    cardsPerView: {
      control: 'select',
      options: [...CARD_CAROUSEL_CARDS_PER_VIEW],
    },
    navPosition: {
      control: 'select',
      options: [...CARD_CAROUSEL_NAV_POSITIONS],
    },
    cardStyle: {
      control: 'select',
      options: [...CONTENT_CARD_STYLES],
    },
    badgeColor: {
      control: 'select',
      options: [...CONTENT_CARD_COLORS],
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
    titleFields: {control: 'text'},
    descriptionFields: {control: 'text'},
    imageFields: {control: 'text'},
    linkFields: {control: 'text'},
    badgeFields: {control: 'text'},
    maxDescriptionLength: {control: 'number'},
  },
};
export default meta;

type Story = StoryObj<CardCarouselProps>;

const mockArgs = CardCarouselCardsMock as any as CardCarouselProps;

export const Playground: Story = {
  args: {...mockArgs},
};

export const Default: Story = {
  render: () => <CardCarousel {...mockArgs} />,
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);
    // Mixed content types map through the default field lists — including
    // the person entry's name/bio/personalLink.
    await expect(canvas.getByText('Problem Solving with AI')).toBeVisible();
    await expect(canvas.getByText('Karim Meghji')).toBeVisible();
    // The resourcesAndTools entries contribute overline badges.
    await expect(canvas.getAllByText('Tools')).toHaveLength(2);
    // Locked (display:none) arrows leave the a11y tree, so query the DOM
    // directly — at the start the previous arrow is disabled unless the
    // viewport fits every card and Swiper locks both arrows away.
    const prev = canvasElement.querySelector<HTMLButtonElement>(
      'button[aria-label="Previous cards"]',
    );
    await expect(prev).not.toBeNull();
    await expect(
      prev!.disabled || prev!.classList.contains('swiper-button-lock'),
    ).toBe(true);
  },
};

export const FourUp: Story = {
  render: () => <CardCarousel {...mockArgs} cardsPerView="4" />,
};

export const NavBottom: Story = {
  render: () => <CardCarousel {...mockArgs} navPosition="bottom" />,
};

export const OverlayStyle: Story = {
  render: () => <CardCarousel {...mockArgs} cardStyle="overlay" />,
};

export const FlatWithTitleOverlay: Story = {
  render: () => <CardCarousel {...mockArgs} cardStyle="flat" titleOverlay />,
};

export const Placeholder: Story = {
  render: () => <CardCarousel />,
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText(/Card Carousel placeholder/)).toBeVisible();
  },
};
