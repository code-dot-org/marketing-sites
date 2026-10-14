/* eslint-disable @typescript-eslint/no-explicit-any */

import UnitCarousel, {
  UnitCarouselProps,
} from '@/components/contentful/unitCarousel';
import {useInMemoryEntities} from '@contentful/experiences-sdk-react';
import {Meta, StoryObj} from '@storybook/react';
import {within} from '@testing-library/dom';
import {expect} from 'storybook/test';

import CourseCatalogMock from './__mocks__/CourseCatalogCourses.json';
import UnitCarouselCourseMock from './__mocks__/UnitCarouselCourse.json';

// Seeds the course mocks' Marketing Link entry for the Courses story.
useInMemoryEntities().addEntities(CourseCatalogMock.seedEntities as any);

const meta: Meta<UnitCarouselProps> = {
  title: 'Marketing/UnitCarousel',
  component: UnitCarousel,
  tags: ['autodocs'],
  parameters: {eyes: {include: false}},
  argTypes: {
    showTopics: {control: 'boolean'},
    showUnitCount: {control: 'boolean'},
    cardType: {control: 'select', options: ['unit', 'course']},
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
    const heading = canvas.getByRole('heading', {level: 3});
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
    await expect(canvas.queryByText(/Topics:/)).toBeNull();
  },
};

// Course entries borrow the unit mock's image, topics and description; the
// first course has no Marketing Link, so it falls back to the Curriculum
// Link.
const unitFields = (mockArgs.units![0] as any).fields;
const courseEntries = CourseCatalogMock.courses.map((course, idx) => ({
  ...course,
  fields: {
    ...course.fields,
    courseDescription: unitFields.shortDescription,
    image: unitFields.image,
    topics: unitFields.topics,
    duration: ['School Year'],
    primaryLinkRef: unitFields.primaryLinkRef,
    secondaryLinkRef: idx === 0 ? undefined : course.fields.secondaryLinkRef,
  },
})) as any as UnitCarouselProps['units'];

export const Courses: Story = {
  render: () => (
    <UnitCarousel
      cardType="course"
      title="Explore our courses"
      units={courseEntries}
    />
  ),
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('4 Courses')).toBeVisible();
    await expect(canvas.queryByText(/Pathway/)).toBeNull();
    await expect(
      canvasElement.querySelector('button[aria-label="Next courses"]'),
    ).not.toBeNull();
  },
};

export const Placeholder: Story = {
  render: () => <UnitCarousel title="AI Foundations" />,
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);
    await expect(
      canvas.getByText(/Curriculum Carousel placeholder/),
    ).toBeVisible();
  },
};
