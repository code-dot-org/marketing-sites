/* eslint-disable @typescript-eslint/no-explicit-any */

import UnitCarousel, {
  UnitCarouselProps,
} from '@/components/contentful/unitCarousel';
import {Meta, StoryObj} from '@storybook/react';
import {within} from '@testing-library/dom';
import {expect} from 'storybook/test';

import UnitCarouselCourseMock from './__mocks__/UnitCarouselCourse.json';

const meta: Meta<UnitCarouselProps> = {
  title: 'Marketing/UnitCarousel',
  component: UnitCarousel,
  tags: ['autodocs'],
  parameters: {eyes: {include: false}},
  argTypes: {
    topicBadgeColor: {
      control: 'select',
      options: ['black', 'purple', 'blue', 'green', 'orange', 'pink'],
    },
    showTopics: {control: 'boolean'},
    showUnitCount: {control: 'boolean'},
  },
};
export default meta;

type Story = StoryObj<UnitCarouselProps>;

const mockArgs = UnitCarouselCourseMock as any as UnitCarouselProps;

export const Playground: Story = {
  args: {...mockArgs},
};

export const Default: Story = {
  render: () => <UnitCarousel {...mockArgs} />,
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);
    const heading = canvas.getByRole('heading', {level: 2});
    await expect(heading.textContent).toBe('AI Foundations');
    const detailsLink = canvas.getByRole('link', {name: 'View course details'});
    await expect(detailsLink).toHaveAttribute('href', '/ai-foundations');
    await expect(
      canvas.getByText('4 Units • Grades 9-12 Pathway'),
    ).toBeVisible();
    for (const unit of mockArgs.units!) {
      await expect(
        canvas.getByText((unit as any).fields.title),
      ).toBeInTheDocument();
    }
    // Locked (display:none) arrows leave the a11y tree, so query the DOM
    // directly — at the start the previous arrow is disabled unless the
    // viewport fits every card and Swiper locks both arrows away.
    const prev = canvasElement.querySelector<HTMLButtonElement>(
      'button[aria-label="Previous units"]',
    );
    await expect(prev).not.toBeNull();
    await expect(
      prev!.disabled || prev!.classList.contains('swiper-button-lock'),
    ).toBe(true);
  },
};

export const SingleUnit: Story = {
  render: () => (
    <UnitCarousel {...mockArgs} units={mockArgs.units!.slice(0, 1)} />
  ),
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);
    await expect(
      canvas.getByText('1 Unit • Grades 9-12 Pathway'),
    ).toBeVisible();
    // One 300px card always fits, so Swiper locks (hides) both arrows.
    const next = canvasElement.querySelector('button[aria-label="Next units"]');
    await expect(next).toHaveClass('swiper-button-lock');
  },
};

export const NoGradeBands: Story = {
  render: () => <UnitCarousel {...mockArgs} gradeBands={undefined} />,
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('4 Units')).toBeVisible();
    await expect(canvas.queryByText(/Pathway/)).toBeNull();
  },
};

export const WithoutUnitCount: Story = {
  render: () => <UnitCarousel {...mockArgs} showUnitCount={false} />,
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('Grades 9-12 Pathway')).toBeVisible();
    await expect(canvas.queryByText(/Units/)).toBeNull();
  },
};

export const WithoutTopics: Story = {
  render: () => <UnitCarousel {...mockArgs} showTopics={false} />,
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);
    await expect(canvas.queryByText('Special Topic')).toBeNull();
  },
};

export const Placeholder: Story = {
  render: () => <UnitCarousel title="AI Foundations" />,
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText(/Unit Carousel placeholder/)).toBeVisible();
  },
};
