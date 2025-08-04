import SimpleListContentful, {
  SimpleListContentfulProps,
} from '@/components/contentful/simpleList';
import {Meta, StoryObj} from '@storybook/react';

const meta: Meta<SimpleListContentfulProps> = {
  title: 'Marketing/SimpleList',
  component: SimpleListContentful,
  parameters: {
    layout: 'centered',
  },
};
export default meta;

// Playground story (first)
export const Playground: StoryObj<SimpleListContentfulProps> = {
  args: {
    items: [
      {
        sys: {
          id: '1',
          type: 'Entry',
          createdAt: '2025-01-01T00:00:00.000Z',
          updatedAt: '2025-01-01T00:00:00.000Z',
          environment: {
            sys: {id: 'env', type: 'Link', linkType: 'Environment'},
          },
          revision: 1,
          space: {sys: {id: 'space', type: 'Link', linkType: 'Space'}},
          contentType: {
            sys: {id: 'listItem', type: 'Link', linkType: 'ContentType'},
          },
          locale: 'en-US',
          publishedVersion: 1,
        },
        metadata: {tags: []},
        fields: {shortText: 'Item 1'},
      },
      {
        sys: {
          id: '2',
          type: 'Entry',
          createdAt: '2025-01-01T00:00:00.000Z',
          updatedAt: '2025-01-01T00:00:00.000Z',
          environment: {
            sys: {id: 'env', type: 'Link', linkType: 'Environment'},
          },
          revision: 1,
          space: {sys: {id: 'space', type: 'Link', linkType: 'Space'}},
          contentType: {
            sys: {id: 'listItem', type: 'Link', linkType: 'ContentType'},
          },
          locale: 'en-US',
          publishedVersion: 1,
        },
        metadata: {tags: []},
        fields: {shortText: 'Item 2'},
      },
    ],
    iconName: 'folder',
  },
  argTypes: {
    items: {control: 'object'},
    iconName: {control: 'text'},
  },
};

export const Basic: StoryObj<SimpleListContentfulProps> = {
  args: {
    className: '',
    items: [
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
          id: '3CKippL3oudp1CS3chX4e4',
          type: 'Entry',
          createdAt: '2025-07-14T20:03:17.560Z',
          updatedAt: '2025-07-23T18:10:12.113Z',
          environment: {
            sys: {
              id: 'master',
              type: 'Link',
              linkType: 'Environment',
            },
          },
          publishedVersion: 28,
          revision: 9,
          contentType: {
            sys: {
              type: 'Link',
              linkType: 'ContentType',
              id: 'listItem',
            },
          },
          locale: 'en-US',
        },
        fields: {
          name: '❌ [ENG] List Item 1',
          shortText: 'List Item 1',
          longText: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
          ctas: [
            {
              sys: {
                type: 'Link',
                linkType: 'Entry',
                id: '3IqvCruY4yXUCkvfArArsD',
              },
            },
          ],
          singleCta: {
            sys: {
              type: 'Link',
              linkType: 'Entry',
              id: '3IqvCruY4yXUCkvfArArsD',
            },
          },
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
          id: '4ydXKk9tJkyS3IOlfHSYco',
          type: 'Entry',
          createdAt: '2025-07-14T20:03:19.094Z',
          updatedAt: '2025-07-23T18:10:14.316Z',
          environment: {
            sys: {
              id: 'master',
              type: 'Link',
              linkType: 'Environment',
            },
          },
          publishedVersion: 18,
          revision: 9,
          contentType: {
            sys: {
              type: 'Link',
              linkType: 'ContentType',
              id: 'listItem',
            },
          },
          locale: 'en-US',
        },
        fields: {
          name: '❌ [ENG] List Item 2',
          shortText: 'List Item 2',
          longText: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
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
          id: '70ISdflgSNLgfLOAq6JcVf',
          type: 'Entry',
          createdAt: '2025-07-14T20:03:19.080Z',
          updatedAt: '2025-07-23T18:10:14.301Z',
          environment: {
            sys: {
              id: 'master',
              type: 'Link',
              linkType: 'Environment',
            },
          },
          publishedVersion: 18,
          revision: 9,
          contentType: {
            sys: {
              type: 'Link',
              linkType: 'ContentType',
              id: 'listItem',
            },
          },
          locale: 'en-US',
        },
        fields: {
          name: '❌ [ENG] List Item 3',
          shortText: 'List Item 3',
          longText: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
        },
      },
    ],
    size: 'm',
    weight: 'normal',
    iconName: 'circle-small',
    type: 'primary',
    children: null,
  },
};

export const Smile: StoryObj<SimpleListContentfulProps> = {
  args: {
    className: '',
    items: [
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
          id: '3CKippL3oudp1CS3chX4e4',
          type: 'Entry',
          createdAt: '2025-07-14T20:03:17.560Z',
          updatedAt: '2025-07-23T18:10:12.113Z',
          environment: {
            sys: {
              id: 'master',
              type: 'Link',
              linkType: 'Environment',
            },
          },
          publishedVersion: 28,
          revision: 9,
          contentType: {
            sys: {
              type: 'Link',
              linkType: 'ContentType',
              id: 'listItem',
            },
          },
          locale: 'en-US',
        },
        fields: {
          name: '❌ [ENG] List Item 1',
          shortText: 'List Item 1',
          longText: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
          ctas: [
            {
              sys: {
                type: 'Link',
                linkType: 'Entry',
                id: '3IqvCruY4yXUCkvfArArsD',
              },
            },
          ],
          singleCta: {
            sys: {
              type: 'Link',
              linkType: 'Entry',
              id: '3IqvCruY4yXUCkvfArArsD',
            },
          },
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
          id: '4ydXKk9tJkyS3IOlfHSYco',
          type: 'Entry',
          createdAt: '2025-07-14T20:03:19.094Z',
          updatedAt: '2025-07-23T18:10:14.316Z',
          environment: {
            sys: {
              id: 'master',
              type: 'Link',
              linkType: 'Environment',
            },
          },
          publishedVersion: 18,
          revision: 9,
          contentType: {
            sys: {
              type: 'Link',
              linkType: 'ContentType',
              id: 'listItem',
            },
          },
          locale: 'en-US',
        },
        fields: {
          name: '❌ [ENG] List Item 2',
          shortText: 'List Item 2',
          longText: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
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
          id: '70ISdflgSNLgfLOAq6JcVf',
          type: 'Entry',
          createdAt: '2025-07-14T20:03:19.080Z',
          updatedAt: '2025-07-23T18:10:14.301Z',
          environment: {
            sys: {
              id: 'master',
              type: 'Link',
              linkType: 'Environment',
            },
          },
          publishedVersion: 18,
          revision: 9,
          contentType: {
            sys: {
              type: 'Link',
              linkType: 'ContentType',
              id: 'listItem',
            },
          },
          locale: 'en-US',
        },
        fields: {
          name: '❌ [ENG] List Item 3',
          shortText: 'List Item 3',
          longText: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
        },
      },
    ],
    size: 'm',
    weight: 'normal',
    iconName: 'smile',
    type: 'primary',
    children: null,
  },
};
