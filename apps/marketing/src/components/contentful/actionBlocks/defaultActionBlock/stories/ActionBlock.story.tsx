/* eslint-disable @typescript-eslint/no-explicit-any */
import {Meta, StoryObj} from '@storybook/react';

import ActionBlock, {ActionBlockContentfulProps} from '../ActionBlock';

const meta: Meta<typeof ActionBlock> = {
  title: 'Marketing/ActionBlock',
  component: ActionBlock,
};
export default meta;

type Story = StoryObj<typeof ActionBlock>;

function mockActionBlock(overrides: Partial<ActionBlockContentfulProps> = {}) {
  const contentfulDefinition: ActionBlockContentfulProps = {
    className: '',
    overline: 'K-12 Teachers',
    title: '❌ [ENG] Self-Paced PL 1',
    description:
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Praesent eget risus vitae massa semper aliquam quis mattis quam.',
    image:
      '//contentful-images.code.org/90t6bu6vlf76/6fdNRFZbNXpiXQd6v7fHen/d6328a3a965b3daca5fb0375caf72064/image-component.png' as any,
    primaryButton: {
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
        id: '79dI2fR2dzbb0IN3dFQJ3t',
        type: 'Entry',
        createdAt: '2025-04-08T15:57:33.257Z',
        updatedAt: '2025-07-23T18:10:13.079Z',
        environment: {
          sys: {
            id: 'master',
            type: 'Link',
            linkType: 'Environment',
          },
        },
        publishedVersion: 430,
        revision: 20,
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
        linkName: '❌ [ENG] Primary button test',
        label: 'Primary button test',
        primaryTarget: '/ping',
        isThisAnExternalLink: false,
      },
    },
    secondaryButton: {
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
        id: '49SifjEqSHArcx1iEiSw4o',
        type: 'Entry',
        createdAt: '2025-04-08T15:57:56.936Z',
        updatedAt: '2025-07-23T18:10:12.974Z',
        environment: {
          sys: {
            id: 'master',
            type: 'Link',
            linkType: 'Environment',
          },
        },
        publishedVersion: 390,
        revision: 23,
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
        linkName: '❌ [ENG] Secondary button test',
        label: 'Secondary button test',
        primaryTarget: '/ping',
        isThisAnExternalLink: true,
        ariaLabel: 'Secondary button test',
      },
    },
    videoShowCaption: false,
    background: 'primary',
    ...overrides,
  };

  return <ActionBlock {...contentfulDefinition} />;
}

export const WithAllContent: Story = {
  render: () => (
    <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px'}}>
      {mockActionBlock()}
      {mockActionBlock({background: 'primary'})}
    </div>
  ),
};

export const WithSecondaryBackground: Story = {
  render: () => (
    <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px'}}>
      {mockActionBlock()}
      {mockActionBlock({background: 'secondary'})}
    </div>
  ),
};

export const ThreeAcross: Story = {
  render: () => (
    <div
      style={{display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px'}}
    >
      {Array.from({length: 3}).map((_, idx) => (
        <div key={idx}>{mockActionBlock()}</div>
      ))}
    </div>
  ),
};
