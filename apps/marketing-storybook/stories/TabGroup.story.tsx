/* eslint-disable @typescript-eslint/no-explicit-any */
import TabGroup from '@/components/contentful/tabGroup';
import {Meta, StoryObj} from '@storybook/react';

const meta: Meta<typeof TabGroup> = {
  title: 'Marketing/TabGroup',
  component: TabGroup,
  parameters: {
    layout: 'centered',
  },
};
export default meta;

export const FilledOut: StoryObj<typeof TabGroup> = {
  args: {
    tabs: [
      {
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
          id: '3xJ2LiZNhVnIlKKDbMQdFa',
          type: 'Entry',
          createdAt: '2025-07-14T20:03:19.153Z',
          updatedAt: '2025-07-23T18:10:13.705Z',
          environment: {
            sys: {
              id: 'master',
              type: 'Link',
              linkType: 'Environment',
            },
          },
          publishedVersion: 12,
          revision: 6,
          contentType: {
            sys: {
              type: 'Link',
              linkType: 'ContentType',
              id: 'tabGroupItem',
            },
          },
          locale: 'en-US',
        },
        fields: {
          internalName: '❌ [ENG] Tab Group Test Item - Image and button',
          tabLabel: 'Test Item Image and Button',
          title: 'Image and Button',
          description: 'With image and button',
          ctaLink: {
            sys: {
              type: 'Link',
              linkType: 'Entry',
              id: '5CznPyR4ZsbIkhpwSaUxoe',
            },
          } as any,
          image: {
            sys: {
              type: 'Link',
              linkType: 'Asset',
              id: '6fdNRFZbNXpiXQd6v7fHen',
            },
          } as any,
        },
      },
      {
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
          id: '12iuTUu5MlPvPWLus9Hvrf',
          type: 'Entry',
          createdAt: '2025-07-14T20:03:19.139Z',
          updatedAt: '2025-07-23T18:10:13.692Z',
          environment: {
            sys: {
              id: 'master',
              type: 'Link',
              linkType: 'Environment',
            },
          },
          publishedVersion: 12,
          revision: 6,
          contentType: {
            sys: {
              type: 'Link',
              linkType: 'ContentType',
              id: 'tabGroupItem',
            },
          },
          locale: 'en-US',
        },
        fields: {
          internalName: '❌ [ENG] Tab Group Test Item - Text only',
          tabLabel: 'Test Item Text Only',
          title: 'Text Only',
          description: 'Without image, without button',
        },
      },
      {
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
          id: '46NCc7SIHw7515NHSQqNU7',
          type: 'Entry',
          createdAt: '2025-07-14T20:03:19.123Z',
          updatedAt: '2025-07-23T18:10:13.676Z',
          environment: {
            sys: {
              id: 'master',
              type: 'Link',
              linkType: 'Environment',
            },
          },
          publishedVersion: 12,
          revision: 6,
          contentType: {
            sys: {
              type: 'Link',
              linkType: 'ContentType',
              id: 'tabGroupItem',
            },
          },
          locale: 'en-US',
        },
        fields: {
          internalName: '❌ [ENG] Tab Group Test Item - Button',
          tabLabel: 'Test Item Button',
          title: 'With Button',
          description: 'Without image, with button',
          ctaLink: {
            sys: {
              type: 'Link',
              linkType: 'Entry',
              id: '5CznPyR4ZsbIkhpwSaUxoe',
            },
          } as any,
        },
      },
      {
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
          id: '4ZWA1QCB7lTf2qZE0NWtoW',
          type: 'Entry',
          createdAt: '2025-07-14T20:03:19.109Z',
          updatedAt: '2025-07-23T18:10:13.659Z',
          environment: {
            sys: {
              id: 'master',
              type: 'Link',
              linkType: 'Environment',
            },
          },
          publishedVersion: 12,
          revision: 6,
          contentType: {
            sys: {
              type: 'Link',
              linkType: 'ContentType',
              id: 'tabGroupItem',
            },
          },
          locale: 'en-US',
        },
        fields: {
          internalName: '❌ [ENG] Tab Group Test Item - Image',
          tabLabel: 'Test Item Image',
          title: 'With Image',
          description: 'With image, without button',
          image: {
            sys: {
              type: 'Link',
              linkType: 'Asset',
              id: '6fdNRFZbNXpiXQd6v7fHen',
            },
          } as any,
        },
      },
    ],
  },
};
