/* eslint-disable @typescript-eslint/no-explicit-any */

import ActivityCard, {
  ActivityCardProps,
} from '@/components/contentful/activityCard';
import {Meta, StoryObj} from '@storybook/react';
import {within} from '@testing-library/dom';
import {expect, userEvent} from 'storybook/test';

import ActivityCardMock from './__mocks__/ActivityCard.json';

const meta: Meta<ActivityCardProps> = {
  title: 'Marketing/ActivityCard',
  component: ActivityCard,
  tags: ['autodocs'],
  // Hour of AI only.
  globals: {theme: 'hourofai'},
  parameters: {
    // Layout match: Geist is a variable font and Applitools render nodes
    // rasterize its interpolated weights slightly differently per run.
    eyes: {matchLevel: 'Layout'},
  },
  argTypes: {
    organizationBadgeColor: {
      control: 'select',
      options: [
        'purple',
        'pink',
        'blue',
        'black',
        'pinkLight',
        'blueLight',
        'blackLight',
      ],
    },
  },
};
export default meta;

type Story = StoryObj<ActivityCardProps>;

const mockArgs = ActivityCardMock as any as ActivityCardProps;

export const Playground: Story = {
  args: {...mockArgs},
  render: args => <ActivityCard {...args} />,
};

export const Default: Story = {
  args: {...mockArgs},
  render: args => <ActivityCard {...args} />,
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);
    const heading = canvas.getByRole('heading', {level: 4});
    await expect(heading.textContent).toBe('Train a Picture Sorter');
    await expect(canvas.getByRole('link', {name: /Start/})).toHaveAttribute(
      'href',
      'https://example.org/start',
    );
    await expect(
      canvas.getByRole('link', {name: /Teacher notes/}),
    ).toHaveAttribute('href', 'https://example.org/teacher-notes');
  },
};

export const Grid: Story = {
  args: {...mockArgs, width: '100%'},
  render: args => (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr 1fr',
        gap: '16px',
      }}
    >
      {[0, 1, 2].map(idx => (
        <ActivityCard
          key={idx}
          {...args}
          title={`Activity Card ${idx + 1}`}
          // Varying lengths exercise the equal-height layout.
          shortDescription={
            idx === 1
              ? 'A short description.'
              : args.shortDescription?.repeat(idx === 2 ? 2 : 1)
          }
          teacherLink={idx === 2 ? undefined : args.teacherLink}
        />
      ))}
    </div>
  ),
};

export const FieldsHidden: Story = {
  args: {
    ...mockArgs,
    showOrganization: false,
    showAges: false,
    showActivityType: false,
    showTeacherLink: false,
  },
  render: args => <ActivityCard {...args} />,
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);
    await expect(canvas.queryByText('Example Learning Lab')).toBeNull();
    await expect(
      canvas.queryByRole('link', {name: /Teacher notes/}),
    ).toBeNull();
  },
};

// Descriptions over four lines clamp, with a Read more toggle.
export const LongDescription: Story = {
  args: {
    ...mockArgs,
    shortDescription:
      'Train a model to sort pictures into groups, then test where it gets things wrong and talk with classmates about why that happens. Finish by designing a fairer data set and comparing the results with another team.',
  },
  render: args => <ActivityCard {...args} />,
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);
    // Appears once the overflow is measured after mount.
    const toggle = await canvas.findByRole('button', {name: /Read more/});
    await expect(toggle).toHaveAttribute('aria-expanded', 'false');
    await userEvent.click(toggle);
    const less = canvas.getByRole('button', {name: /Read less/});
    await expect(less).toHaveAttribute('aria-expanded', 'true');
  },
};

export const Placeholder: Story = {
  render: () => <ActivityCard />,
};
