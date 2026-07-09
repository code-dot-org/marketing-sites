/* eslint-disable @typescript-eslint/no-explicit-any */

import UnitCard, {UnitCardProps} from '@/components/contentful/unitCard';
import {Meta, StoryObj} from '@storybook/react';
import {within} from '@testing-library/dom';
import {expect} from 'storybook/test';

import UnitCardMock from './__mocks__/UnitCard.json';

const meta: Meta<UnitCardProps> = {
  title: 'Marketing/UnitCard',
  component: UnitCard,
  tags: ['autodocs'],
  argTypes: {
    topicBadgeColor: {
      control: 'select',
      options: ['black', 'purple', 'blue', 'green', 'orange', 'pink'],
    },
    showTopics: {control: 'boolean'},
  },
};
export default meta;

type Story = StoryObj<UnitCardProps>;

const mockArgs = UnitCardMock as any as UnitCardProps;

export const Playground: Story = {
  args: {...mockArgs},
  render: args => <UnitCard {...args} />,
};

export const Default: Story = {
  render: () => <UnitCard {...mockArgs} />,
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);
    const heading = canvas.getByRole('heading', {level: 3});
    await expect(heading.textContent).toBe('Problem Solving with AI');
    const link = canvas.getByRole('link', {name: 'Explore'});
    await expect(link).toHaveAttribute('href', '/curriculum-test');
  },
};

export const Grid: Story = {
  render: () => (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr 1fr',
        gap: '16px',
      }}
    >
      {(['purple', 'blue', 'green'] as const).map((color, idx) => (
        <UnitCard
          key={color}
          {...mockArgs}
          title={`Unit Card ${idx + 1}`}
          topicBadgeColor={color}
          topics={['Special Topic', 'AI']}
          // Varying description lengths exercise the equal-height layout:
          // the flexible gap opens between description and grade band.
          shortDescription={
            idx === 1
              ? 'A short description.'
              : mockArgs.shortDescription?.repeat(idx === 2 ? 2 : 1)
          }
        />
      ))}
    </div>
  ),
};

export const WithoutTopics: Story = {
  render: () => <UnitCard {...mockArgs} showTopics={false} />,
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);
    await expect(canvas.queryByText('Special Topic')).toBeNull();
  },
};

export const MergedGradeBands: Story = {
  render: () => <UnitCard {...mockArgs} gradeBands={['K-5', '6-8']} />,
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('Grades K-8')).toBeVisible();
  },
};

export const Placeholder: Story = {
  render: () => <UnitCard />,
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText(/Unit Card placeholder/)).toBeVisible();
  },
};
