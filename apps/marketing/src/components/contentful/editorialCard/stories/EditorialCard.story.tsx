/* eslint-disable @typescript-eslint/no-explicit-any */

import {Meta, StoryObj} from '@storybook/react';

import EditorialCardContentful, {
  EditorialCardContentfulProps,
  EDITORIAL_CARD_CONTENTFUL_LAYOUTS,
} from '../EditorialCard';

const meta: Meta<EditorialCardContentfulProps> = {
  title: 'Marketing/EditorialCard',
  component: EditorialCardContentful,
  tags: ['autodocs'],
};
export default meta;

type Story = StoryObj<EditorialCardContentfulProps>;

function mockEditorialCard(
  layout: EDITORIAL_CARD_CONTENTFUL_LAYOUTS,
  index: number,
) {
  const contentfulDefinition = {
    className: '',
    heading: `Editorial Card ${index + 1}`,
    text: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Praesent eget risus vitae massa semper aliquam quis mattis quam.',
    image:
      '//contentful-images.code.org/90t6bu6vlf76/6fdNRFZbNXpiXQd6v7fHen/d6328a3a965b3daca5fb0375caf72064/image-component.png',
    linkEntry: {
      contentTypeId: 'link',
      metadata: {
        tags: [],
        concepts: [],
      },
      sys: {
        space: {
          sys: {
            type: 'Link',
            linkType: 'Space',
            id: '90t6bu6vlf76',
          },
        },
        id: '3IqvCruY4yXUCkvfArArsD',
        type: 'Entry',
        createdAt: '2025-05-22T21:12:49.939Z',
        updatedAt: '2025-07-23T18:10:13.642Z',
        environment: {
          sys: {
            id: 'master',
            type: 'Link',
            linkType: 'Environment',
          },
        },
        publishedVersion: 58,
        revision: 14,
        contentType: {
          sys: {
            type: 'Link',
            linkType: 'ContentType',
            id: 'link',
          },
        },
        locale: 'en-US',
      } as any,
      fields: {
        linkName: '❌ [ENG] Editorial Card Link',
        label: 'Editorial Card Link',
        primaryTarget: '/editorial-card-test',
        isThisAnExternalLink: true,
      },
    },
    layoutOpt: layout,
    iconName: 'smile',
    children: null,
  };
  return <EditorialCardContentful {...contentfulDefinition} />;
}

function mockEditorialCardWithIcon(
  layout: EDITORIAL_CARD_CONTENTFUL_LAYOUTS,
  index: number,
) {
  const contentfulDefinition = {
    className: '',
    heading: 'Editorial Card 1',
    text: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Praesent eget risus vitae massa semper aliquam quis mattis quam.',
    image:
      '//contentful-images.code.org/90t6bu6vlf76/6fdNRFZbNXpiXQd6v7fHen/d6328a3a965b3daca5fb0375caf72064/image-component.png',
    linkEntry: {
      metadata: {
        tags: [],
        concepts: [],
      },
      sys: {
        space: {
          sys: {
            type: 'Link',
            linkType: 'Space',
            id: '90t6bu6vlf76',
          },
        },
        id: '3IqvCruY4yXUCkvfArArsD',
        type: 'Entry',
        createdAt: '2025-05-22T21:12:49.939Z',
        updatedAt: '2025-07-23T18:10:13.642Z',
        environment: {
          sys: {
            id: 'master',
            type: 'Link',
            linkType: 'Environment',
          },
        },
        publishedVersion: 58,
        revision: 14,
        contentType: {
          sys: {
            type: 'Link',
            linkType: 'ContentType',
            id: 'link',
          },
        },
        locale: 'en-US',
      },
      fields: {
        linkName: '❌ [ENG] Editorial Card Link',
        label: 'Editorial Card Link',
        primaryTarget: '/editorial-card-test',
        isThisAnExternalLink: true,
      },
    } as any,
    layoutOpt: layout,
    iconName: `circle-${index + 1}`,
    children: null,
  };
  return <EditorialCardContentful {...contentfulDefinition} />;
}

export const HorizontalWithImage: Story = {
  render: () => (
    <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px'}}>
      {Array.from({length: 4}).map((_, idx) => (
        <div key={idx}>
          {mockEditorialCard(
            EDITORIAL_CARD_CONTENTFUL_LAYOUTS.HORIZONTAL_WITH_IMAGE,
            idx,
          )}
        </div>
      ))}
    </div>
  ),
};

export const VerticalWithImage: Story = {
  render: () => (
    <div
      style={{display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px'}}
    >
      {Array.from({length: 3}).map((_, idx) => (
        <div key={idx}>
          {mockEditorialCard(
            EDITORIAL_CARD_CONTENTFUL_LAYOUTS.VERTICAL_WITH_IMAGE,
            idx,
          )}
        </div>
      ))}
    </div>
  ),
};

export const VerticalWithIcon: Story = {
  render: () => (
    <div
      style={{display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px'}}
    >
      {Array.from({length: 3}).map((_, idx) => (
        <div key={idx}>
          {mockEditorialCardWithIcon(
            EDITORIAL_CARD_CONTENTFUL_LAYOUTS.VERTICAL_WITH_ICON,
            idx,
          )}
        </div>
      ))}
    </div>
  ),
};
