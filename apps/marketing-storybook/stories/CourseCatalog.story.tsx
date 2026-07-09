/* eslint-disable @typescript-eslint/no-explicit-any */

import CatalogInterstitial from '@/components/contentful/catalogInterstitial';
import CourseCatalog, {
  CourseCatalogProps,
} from '@/components/contentful/courseCatalog';
import {useInMemoryEntities} from '@contentful/experiences-sdk-react';
import {Meta, StoryObj} from '@storybook/react';
import {within} from '@testing-library/dom';
import {expect, userEvent} from 'storybook/test';

import CourseCatalogMock from './__mocks__/CourseCatalogCourses.json';

// Seed the unit/link entries so the catalog can resolve each course's
// courseUnits chain (units reference assets/links seeded in preview.ts).
useInMemoryEntities().addEntities(CourseCatalogMock.seedEntities as any);

const meta: Meta<CourseCatalogProps> = {
  title: 'Marketing/CourseCatalog',
  component: CourseCatalog,
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

type Story = StoryObj<CourseCatalogProps>;

const courses =
  CourseCatalogMock.courses as any as CourseCatalogProps['courses'];

export const Playground: Story = {
  args: {courses},
};

export const Default: Story = {
  render: () => <CourseCatalog courses={courses} />,
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);
    for (const label of [
      'All Grades',
      'Grades K-5',
      'Grades 6-8',
      'Grades 9-12',
    ]) {
      await expect(canvas.getByRole('button', {name: label})).toBeVisible();
    }
    for (const title of [
      'CS Fundamentals',
      'CS Discoveries',
      'AI Foundations',
      'CS Connections',
    ]) {
      await expect(
        canvas.getByRole('heading', {level: 2, name: title}),
      ).toBeVisible();
    }

    await userEvent.click(canvas.getByRole('button', {name: 'Grades 9-12'}));
    await expect(canvas.queryByText('CS Fundamentals')).toBeNull();
    await expect(canvas.queryByText('CS Connections')).toBeNull();
    await expect(canvas.getByText('AI Foundations')).toBeVisible();

    await userEvent.click(canvas.getByRole('button', {name: 'Grades 6-8'}));
    await expect(canvas.getByText('CS Connections')).toBeVisible();
    await expect(canvas.getByText('CS Discoveries')).toBeVisible();
    await expect(canvas.queryByText('AI Foundations')).toBeNull();

    await userEvent.click(canvas.getByRole('button', {name: 'All Grades'}));
    await expect(canvas.getByText('AI Foundations')).toBeVisible();
    await expect(canvas.getByText('CS Fundamentals')).toBeVisible();
  },
};

export const HiddenPills: Story = {
  render: () => <CourseCatalog courses={courses!.slice(2, 3)} />,
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);
    await expect(
      canvas.getByRole('button', {name: 'All Grades'}),
    ).toBeVisible();
    await expect(
      canvas.getByRole('button', {name: 'Grades 9-12'}),
    ).toBeVisible();
    await expect(canvas.queryByRole('button', {name: 'Grades K-5'})).toBeNull();
    await expect(canvas.queryByRole('button', {name: 'Grades 6-8'})).toBeNull();
  },
};

export const WithInterstitials: Story = {
  render: () => (
    <CourseCatalog courses={courses}>
      <CatalogInterstitial position={1}>
        <div
          style={{background: '#292f36', color: '#fff', padding: '24px'}}
          data-testid="interstitial-1"
        >
          Teaching AI for the first time? Check out the Quick Start Guide.
        </div>
      </CatalogInterstitial>
      <CatalogInterstitial position={3}>
        <div
          style={{background: '#f2f2f2', padding: '24px'}}
          data-testid="interstitial-3"
        >
          Hour of AI Promo Content
        </div>
      </CatalogInterstitial>
    </CourseCatalog>
  ),
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);
    const first = canvas.getByTestId('interstitial-1')
      .parentElement as HTMLElement;
    const third = canvas.getByTestId('interstitial-3')
      .parentElement as HTMLElement;
    await expect(first.style.order).toBe('15');
    await expect(third.style.order).toBe('35');
  },
};

export const EditorMode: Story = {
  render: () => (
    <CourseCatalog courses={courses} isEditorMode>
      <CatalogInterstitial position={1} isEditorMode>
        <div style={{background: '#292f36', color: '#fff', padding: '24px'}}>
          Teaching AI for the first time?
        </div>
      </CatalogInterstitial>
    </CourseCatalog>
  ),
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);
    await expect(
      canvas.getByText('Filtering is disabled in the editor'),
    ).toBeVisible();
    await expect(
      canvas.getByRole('button', {name: 'Grades 9-12'}),
    ).toHaveAttribute('aria-disabled', 'true');
    await expect(
      canvas.getByText('Interstitial — after section 1'),
    ).toBeVisible();
    // All four courses render despite editor mode.
    await expect(canvas.getAllByRole('heading', {level: 2})).toHaveLength(4);
  },
};

export const Placeholder: Story = {
  render: () => <CourseCatalog />,
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText(/Course Catalog placeholder/)).toBeVisible();
  },
};
