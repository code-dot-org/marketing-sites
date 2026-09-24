/* eslint-disable @typescript-eslint/no-explicit-any */

import ActivityCarousel, {
  ActivityCarouselProps,
  ActivityEntry,
} from '@/components/contentful/activityCarousel';
import {useInMemoryEntities} from '@contentful/experiences-sdk-react';
import {Meta, StoryObj} from '@storybook/react';
import {within} from '@testing-library/dom';
import {expect} from 'storybook/test';

import ActivityCardMock from './__mocks__/ActivityCard.json';

const meta: Meta<ActivityCarouselProps> = {
  title: 'Marketing/ActivityCarousel',
  component: ActivityCarousel,
  tags: ['autodocs'],
  // Hour of AI only.
  globals: {theme: 'hourofai'},
  parameters: {eyes: {include: false}},
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

type Story = StoryObj<ActivityCarouselProps>;

// Seed the in-memory entity store so the carousel resolves the activities'
// image and link stubs, as in Studio.
const linkEntity = (id: string, fields: object) => ({
  sys: {
    id,
    type: 'Entry',
    contentType: {sys: {type: 'Link', linkType: 'ContentType', id: 'link'}},
  },
  fields,
});
useInMemoryEntities().addEntities([
  {
    sys: {id: 'activity-carousel-image', type: 'Asset'},
    fields: {file: {url: ActivityCardMock.image}},
  },
  linkEntity('activity-carousel-start', ActivityCardMock.tutorialLink.fields),
  linkEntity('activity-carousel-notes', ActivityCardMock.teacherLink.fields),
] as any);

const stub = (linkType: 'Asset' | 'Entry', id: string) => ({
  sys: {type: 'Link', linkType, id},
});

const activities = Array.from(
  {length: 6},
  (_, i) =>
    ({
      sys: {id: `activity-${i + 1}`, contentType: {sys: {id: 'activity'}}},
      fields: {
        title: `${ActivityCardMock.title} ${i + 1}`,
        shortDescription: ActivityCardMock.shortDescription,
        organization: ActivityCardMock.organization,
        ages: ActivityCardMock.ages,
        topic: ActivityCardMock.topics,
        activityType: ActivityCardMock.activityType,
        length: ActivityCardMock.length,
        tutorialID: `${ActivityCardMock.tutorialId}-${i + 1}`,
        image: stub('Asset', 'activity-carousel-image'),
        primaryLinkRef: stub('Entry', 'activity-carousel-start'),
        secondaryLinkRef:
          i % 2 ? undefined : stub('Entry', 'activity-carousel-notes'),
      },
    }) as unknown as ActivityEntry,
);

const mockArgs: ActivityCarouselProps = {
  cardWidth: '325px',
  activities,
};

export const Playground: Story = {
  args: {...mockArgs},
  render: args => <ActivityCarousel {...args} />,
};

export const Default: Story = {
  args: {...mockArgs},
  render: args => <ActivityCarousel {...args} />,
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);
    await expect(canvas.getAllByRole('heading', {level: 4})).toHaveLength(6);
  },
};

export const FieldsHidden: Story = {
  args: {
    ...mockArgs,
    showOrganization: false,
    showAges: false,
    showTeacherLink: false,
    tutorialLinkTextOverride: 'Try it',
  },
  render: args => <ActivityCarousel {...args} />,
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);
    await expect(canvas.queryByText('Example Learning Lab')).toBeNull();
    await expect(canvas.getAllByRole('link', {name: /Try it/})).toHaveLength(6);
  },
};

export const Placeholder: Story = {
  render: () => <ActivityCarousel />,
};
