/* eslint-disable @typescript-eslint/no-explicit-any */

import {Meta, StoryObj} from '@storybook/react';

import PeopleCollection, {PeopleCollectionProps} from '../PeopleCollection';

const meta: Meta<PeopleCollectionProps> = {
  title: 'Marketing/Collection/People',
  component: PeopleCollection,
  tags: ['autodocs'],
};
export default meta;

type Story = StoryObj<PeopleCollectionProps>;

export const SortedAlphabetically: Story = {
  args: {
    className: '',
    people: [
      {
        metadata: {
          tags: [],
          concepts: [
            {
              sys: {
                type: 'Link',
                linkType: 'TaxonomyConcept',
                id: 'engTestPerson',
              },
            },
          ],
        },
        sys: {
          space: {
            sys: {
              type: 'Link',
              linkType: 'Space',
              id: '90t6bu6vlf76',
            },
          },
          id: 'SYQfb1i0V1CoFQM21LvaZ',
          type: 'Entry',
          createdAt: '2025-07-02T22:44:22.231Z',
          updatedAt: '2025-07-23T18:10:14.074Z',
          environment: {
            sys: {
              id: 'master',
              type: 'Link',
              linkType: 'Environment',
            },
          },
          publishedVersion: 23,
          revision: 11,
          contentType: {
            sys: {
              type: 'Link',
              linkType: 'ContentType',
              id: 'person',
            },
          },
          locale: 'en-US',
        },
        fields: {
          name: '❌ [ENG] A Person',
          image: {
            sys: {
              type: 'Link',
              linkType: 'Asset',
              id: '6fdNRFZbNXpiXQd6v7fHen',
            },
          },
          title: 'A Person Title',
          bio: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Praesent eget risus vitae massa semper aliquam quis mattis quam.',
        },
      },
      {
        metadata: {
          tags: [],
          concepts: [
            {
              sys: {
                type: 'Link',
                linkType: 'TaxonomyConcept',
                id: 'engTestPerson',
              },
            },
          ],
        },
        sys: {
          space: {
            sys: {
              type: 'Link',
              linkType: 'Space',
              id: '90t6bu6vlf76',
            },
          },
          id: '1VxqQFPWjGyFtmlUsxBt1y',
          type: 'Entry',
          createdAt: '2025-07-02T22:44:27.135Z',
          updatedAt: '2025-07-23T18:10:14.013Z',
          environment: {
            sys: {
              id: 'master',
              type: 'Link',
              linkType: 'Environment',
            },
          },
          publishedVersion: 23,
          revision: 11,
          contentType: {
            sys: {
              type: 'Link',
              linkType: 'ContentType',
              id: 'person',
            },
          },
          locale: 'en-US',
        },
        fields: {
          name: '❌ [ENG] C Person',
          image: {
            sys: {
              type: 'Link',
              linkType: 'Asset',
              id: '6fdNRFZbNXpiXQd6v7fHen',
            },
          },
          title: 'C Person Title',
          bio: 'Praesent eget risus vitae massa semper aliquam quis mattis quam. Morbi vitae tortor tempus, placerat leo et, suscipit lectus.',
        },
      },
      {
        metadata: {
          tags: [],
          concepts: [
            {
              sys: {
                type: 'Link',
                linkType: 'TaxonomyConcept',
                id: 'engTestPerson',
              },
            },
          ],
        },
        sys: {
          space: {
            sys: {
              type: 'Link',
              linkType: 'Space',
              id: '90t6bu6vlf76',
            },
          },
          id: '65RoCDb4zedagMJ4GowP0L',
          type: 'Entry',
          createdAt: '2025-07-02T22:44:33.467Z',
          updatedAt: '2025-07-23T18:10:13.961Z',
          environment: {
            sys: {
              id: 'master',
              type: 'Link',
              linkType: 'Environment',
            },
          },
          publishedVersion: 23,
          revision: 11,
          contentType: {
            sys: {
              type: 'Link',
              linkType: 'ContentType',
              id: 'person',
            },
          },
          locale: 'en-US',
        },
        fields: {
          name: '❌ [ENG] E Person',
          image: {
            sys: {
              type: 'Link',
              linkType: 'Asset',
              id: '6fdNRFZbNXpiXQd6v7fHen',
            },
          },
          title: 'E Person Title',
        },
      },
      {
        metadata: {
          tags: [],
          concepts: [
            {
              sys: {
                type: 'Link',
                linkType: 'TaxonomyConcept',
                id: 'engTestPerson',
              },
            },
          ],
        },
        sys: {
          space: {
            sys: {
              type: 'Link',
              linkType: 'Space',
              id: '90t6bu6vlf76',
            },
          },
          id: '2JLo5rz0ZXkscFjP0VOzJh',
          type: 'Entry',
          createdAt: '2025-07-02T22:44:02.778Z',
          updatedAt: '2025-07-23T18:10:13.906Z',
          environment: {
            sys: {
              id: 'master',
              type: 'Link',
              linkType: 'Environment',
            },
          },
          publishedVersion: 23,
          revision: 11,
          contentType: {
            sys: {
              type: 'Link',
              linkType: 'ContentType',
              id: 'person',
            },
          },
          locale: 'en-US',
        },
        fields: {
          name: '❌ [ENG] F Person',
          image: {
            sys: {
              type: 'Link',
              linkType: 'Asset',
              id: '6fdNRFZbNXpiXQd6v7fHen',
            },
          },
          title: 'F Person Title',
          personalLink: {
            sys: {
              type: 'Link',
              linkType: 'Entry',
              id: '5CznPyR4ZsbIkhpwSaUxoe',
            },
          },
        },
      },
      {
        metadata: {
          tags: [],
          concepts: [
            {
              sys: {
                type: 'Link',
                linkType: 'TaxonomyConcept',
                id: 'engTestPerson',
              },
            },
          ],
        },
        sys: {
          space: {
            sys: {
              type: 'Link',
              linkType: 'Space',
              id: '90t6bu6vlf76',
            },
          },
          id: 'pkTMkG4WCErv8JdPfJhar',
          type: 'Entry',
          createdAt: '2025-07-02T22:43:46.182Z',
          updatedAt: '2025-07-23T18:10:13.851Z',
          environment: {
            sys: {
              id: 'master',
              type: 'Link',
              linkType: 'Environment',
            },
          },
          publishedVersion: 23,
          revision: 11,
          contentType: {
            sys: {
              type: 'Link',
              linkType: 'ContentType',
              id: 'person',
            },
          },
          locale: 'en-US',
        },
        fields: {
          name: '❌ [ENG] B Person',
          image: {
            sys: {
              type: 'Link',
              linkType: 'Asset',
              id: '6fdNRFZbNXpiXQd6v7fHen',
            },
          },
          title: 'B Person Title',
          bio: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Praesent eget risus vitae massa semper aliquam quis mattis quam. Morbi vitae tortor tempus, placerat leo et, suscipit lectus.',
          personalLink: {
            sys: {
              type: 'Link',
              linkType: 'Entry',
              id: '5CznPyR4ZsbIkhpwSaUxoe',
            },
          },
        },
      },
      {
        metadata: {
          tags: [],
          concepts: [
            {
              sys: {
                type: 'Link',
                linkType: 'TaxonomyConcept',
                id: 'engTestPerson',
              },
            },
          ],
        },
        sys: {
          space: {
            sys: {
              type: 'Link',
              linkType: 'Space',
              id: '90t6bu6vlf76',
            },
          },
          id: '2jh7UpvUMH5dYNR7dDZJdw',
          type: 'Entry',
          createdAt: '2025-07-02T22:43:26.693Z',
          updatedAt: '2025-07-23T18:10:13.762Z',
          environment: {
            sys: {
              id: 'master',
              type: 'Link',
              linkType: 'Environment',
            },
          },
          publishedVersion: 23,
          revision: 11,
          contentType: {
            sys: {
              type: 'Link',
              linkType: 'ContentType',
              id: 'person',
            },
          },
          locale: 'en-US',
        },
        fields: {
          name: '❌ [ENG] D Person',
          title: 'D Person Title',
          bio: 'Phasellus ut euismod massa, eu eleifend ipsum. Nulla eu neque commodo, dapibus dolor eget, dictum arcu. In nec purus eu tellus consequat ultricies. Donec feugiat tempor turpis, rutrum sagittis mi.',
        },
      },
    ] as any,
    sortOrder: 'alphabetical',
    hideImages: false,
  },
};

export const SortedManually: Story = {
  args: {
    className: '',
    people: [
      {
        metadata: {
          tags: [],
          concepts: [
            {
              sys: {
                type: 'Link',
                linkType: 'TaxonomyConcept',
                id: 'engTestPerson',
              },
            },
          ],
        },
        sys: {
          space: {
            sys: {
              type: 'Link',
              linkType: 'Space',
              id: '90t6bu6vlf76',
            },
          },
          id: 'SYQfb1i0V1CoFQM21LvaZ',
          type: 'Entry',
          createdAt: '2025-07-02T22:44:22.231Z',
          updatedAt: '2025-07-23T18:10:14.074Z',
          environment: {
            sys: {
              id: 'master',
              type: 'Link',
              linkType: 'Environment',
            },
          },
          publishedVersion: 23,
          revision: 11,
          contentType: {
            sys: {
              type: 'Link',
              linkType: 'ContentType',
              id: 'person',
            },
          },
          locale: 'en-US',
        },
        fields: {
          name: '❌ [ENG] A Person',
          image: {
            sys: {
              type: 'Link',
              linkType: 'Asset',
              id: '6fdNRFZbNXpiXQd6v7fHen',
            },
          },
          title: 'A Person Title',
          bio: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Praesent eget risus vitae massa semper aliquam quis mattis quam.',
        },
      },
      {
        metadata: {
          tags: [],
          concepts: [
            {
              sys: {
                type: 'Link',
                linkType: 'TaxonomyConcept',
                id: 'engTestPerson',
              },
            },
          ],
        },
        sys: {
          space: {
            sys: {
              type: 'Link',
              linkType: 'Space',
              id: '90t6bu6vlf76',
            },
          },
          id: '1VxqQFPWjGyFtmlUsxBt1y',
          type: 'Entry',
          createdAt: '2025-07-02T22:44:27.135Z',
          updatedAt: '2025-07-23T18:10:14.013Z',
          environment: {
            sys: {
              id: 'master',
              type: 'Link',
              linkType: 'Environment',
            },
          },
          publishedVersion: 23,
          revision: 11,
          contentType: {
            sys: {
              type: 'Link',
              linkType: 'ContentType',
              id: 'person',
            },
          },
          locale: 'en-US',
        },
        fields: {
          name: '❌ [ENG] C Person',
          image: {
            sys: {
              type: 'Link',
              linkType: 'Asset',
              id: '6fdNRFZbNXpiXQd6v7fHen',
            },
          },
          title: 'C Person Title',
          bio: 'Praesent eget risus vitae massa semper aliquam quis mattis quam. Morbi vitae tortor tempus, placerat leo et, suscipit lectus.',
        },
      },
      {
        metadata: {
          tags: [],
          concepts: [
            {
              sys: {
                type: 'Link',
                linkType: 'TaxonomyConcept',
                id: 'engTestPerson',
              },
            },
          ],
        },
        sys: {
          space: {
            sys: {
              type: 'Link',
              linkType: 'Space',
              id: '90t6bu6vlf76',
            },
          },
          id: '65RoCDb4zedagMJ4GowP0L',
          type: 'Entry',
          createdAt: '2025-07-02T22:44:33.467Z',
          updatedAt: '2025-07-23T18:10:13.961Z',
          environment: {
            sys: {
              id: 'master',
              type: 'Link',
              linkType: 'Environment',
            },
          },
          publishedVersion: 23,
          revision: 11,
          contentType: {
            sys: {
              type: 'Link',
              linkType: 'ContentType',
              id: 'person',
            },
          },
          locale: 'en-US',
        },
        fields: {
          name: '❌ [ENG] E Person',
          image: {
            sys: {
              type: 'Link',
              linkType: 'Asset',
              id: '6fdNRFZbNXpiXQd6v7fHen',
            },
          },
          title: 'E Person Title',
        },
      },
      {
        metadata: {
          tags: [],
          concepts: [
            {
              sys: {
                type: 'Link',
                linkType: 'TaxonomyConcept',
                id: 'engTestPerson',
              },
            },
          ],
        },
        sys: {
          space: {
            sys: {
              type: 'Link',
              linkType: 'Space',
              id: '90t6bu6vlf76',
            },
          },
          id: '2JLo5rz0ZXkscFjP0VOzJh',
          type: 'Entry',
          createdAt: '2025-07-02T22:44:02.778Z',
          updatedAt: '2025-07-23T18:10:13.906Z',
          environment: {
            sys: {
              id: 'master',
              type: 'Link',
              linkType: 'Environment',
            },
          },
          publishedVersion: 23,
          revision: 11,
          contentType: {
            sys: {
              type: 'Link',
              linkType: 'ContentType',
              id: 'person',
            },
          },
          locale: 'en-US',
        },
        fields: {
          name: '❌ [ENG] F Person',
          image: {
            sys: {
              type: 'Link',
              linkType: 'Asset',
              id: '6fdNRFZbNXpiXQd6v7fHen',
            },
          },
          title: 'F Person Title',
          personalLink: {
            sys: {
              type: 'Link',
              linkType: 'Entry',
              id: '5CznPyR4ZsbIkhpwSaUxoe',
            },
          },
        },
      },
      {
        metadata: {
          tags: [],
          concepts: [
            {
              sys: {
                type: 'Link',
                linkType: 'TaxonomyConcept',
                id: 'engTestPerson',
              },
            },
          ],
        },
        sys: {
          space: {
            sys: {
              type: 'Link',
              linkType: 'Space',
              id: '90t6bu6vlf76',
            },
          },
          id: 'pkTMkG4WCErv8JdPfJhar',
          type: 'Entry',
          createdAt: '2025-07-02T22:43:46.182Z',
          updatedAt: '2025-07-23T18:10:13.851Z',
          environment: {
            sys: {
              id: 'master',
              type: 'Link',
              linkType: 'Environment',
            },
          },
          publishedVersion: 23,
          revision: 11,
          contentType: {
            sys: {
              type: 'Link',
              linkType: 'ContentType',
              id: 'person',
            },
          },
          locale: 'en-US',
        },
        fields: {
          name: '❌ [ENG] B Person',
          image: {
            sys: {
              type: 'Link',
              linkType: 'Asset',
              id: '6fdNRFZbNXpiXQd6v7fHen',
            },
          },
          title: 'B Person Title',
          bio: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Praesent eget risus vitae massa semper aliquam quis mattis quam. Morbi vitae tortor tempus, placerat leo et, suscipit lectus.',
          personalLink: {
            sys: {
              type: 'Link',
              linkType: 'Entry',
              id: '5CznPyR4ZsbIkhpwSaUxoe',
            },
          },
        },
      },
      {
        metadata: {
          tags: [],
          concepts: [
            {
              sys: {
                type: 'Link',
                linkType: 'TaxonomyConcept',
                id: 'engTestPerson',
              },
            },
          ],
        },
        sys: {
          space: {
            sys: {
              type: 'Link',
              linkType: 'Space',
              id: '90t6bu6vlf76',
            },
          },
          id: '2jh7UpvUMH5dYNR7dDZJdw',
          type: 'Entry',
          createdAt: '2025-07-02T22:43:26.693Z',
          updatedAt: '2025-07-23T18:10:13.762Z',
          environment: {
            sys: {
              id: 'master',
              type: 'Link',
              linkType: 'Environment',
            },
          },
          publishedVersion: 23,
          revision: 11,
          contentType: {
            sys: {
              type: 'Link',
              linkType: 'ContentType',
              id: 'person',
            },
          },
          locale: 'en-US',
        },
        fields: {
          name: '❌ [ENG] D Person',
          title: 'D Person Title',
          bio: 'Phasellus ut euismod massa, eu eleifend ipsum. Nulla eu neque commodo, dapibus dolor eget, dictum arcu. In nec purus eu tellus consequat ultricies. Donec feugiat tempor turpis, rutrum sagittis mi.',
        },
      },
    ] as any,
    sortOrder: 'manual',
    hideImages: false,
  },
};

export const HiddenImages: Story = {
  args: {
    className: '',
    people: [
      {
        metadata: {
          tags: [],
          concepts: [
            {
              sys: {
                type: 'Link',
                linkType: 'TaxonomyConcept',
                id: 'engTestPerson',
              },
            },
          ],
        },
        sys: {
          space: {
            sys: {
              type: 'Link',
              linkType: 'Space',
              id: '90t6bu6vlf76',
            },
          },
          id: 'SYQfb1i0V1CoFQM21LvaZ',
          type: 'Entry',
          createdAt: '2025-07-02T22:44:22.231Z',
          updatedAt: '2025-07-23T18:10:14.074Z',
          environment: {
            sys: {
              id: 'master',
              type: 'Link',
              linkType: 'Environment',
            },
          },
          publishedVersion: 23,
          revision: 11,
          contentType: {
            sys: {
              type: 'Link',
              linkType: 'ContentType',
              id: 'person',
            },
          },
          locale: 'en-US',
        },
        fields: {
          name: '❌ [ENG] A Person',
          image: {
            sys: {
              type: 'Link',
              linkType: 'Asset',
              id: '6fdNRFZbNXpiXQd6v7fHen',
            },
          },
          title: 'A Person Title',
          bio: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Praesent eget risus vitae massa semper aliquam quis mattis quam.',
        },
      },
      {
        metadata: {
          tags: [],
          concepts: [
            {
              sys: {
                type: 'Link',
                linkType: 'TaxonomyConcept',
                id: 'engTestPerson',
              },
            },
          ],
        },
        sys: {
          space: {
            sys: {
              type: 'Link',
              linkType: 'Space',
              id: '90t6bu6vlf76',
            },
          },
          id: '1VxqQFPWjGyFtmlUsxBt1y',
          type: 'Entry',
          createdAt: '2025-07-02T22:44:27.135Z',
          updatedAt: '2025-07-23T18:10:14.013Z',
          environment: {
            sys: {
              id: 'master',
              type: 'Link',
              linkType: 'Environment',
            },
          },
          publishedVersion: 23,
          revision: 11,
          contentType: {
            sys: {
              type: 'Link',
              linkType: 'ContentType',
              id: 'person',
            },
          },
          locale: 'en-US',
        },
        fields: {
          name: '❌ [ENG] C Person',
          image: {
            sys: {
              type: 'Link',
              linkType: 'Asset',
              id: '6fdNRFZbNXpiXQd6v7fHen',
            },
          },
          title: 'C Person Title',
          bio: 'Praesent eget risus vitae massa semper aliquam quis mattis quam. Morbi vitae tortor tempus, placerat leo et, suscipit lectus.',
        },
      },
      {
        metadata: {
          tags: [],
          concepts: [
            {
              sys: {
                type: 'Link',
                linkType: 'TaxonomyConcept',
                id: 'engTestPerson',
              },
            },
          ],
        },
        sys: {
          space: {
            sys: {
              type: 'Link',
              linkType: 'Space',
              id: '90t6bu6vlf76',
            },
          },
          id: '65RoCDb4zedagMJ4GowP0L',
          type: 'Entry',
          createdAt: '2025-07-02T22:44:33.467Z',
          updatedAt: '2025-07-23T18:10:13.961Z',
          environment: {
            sys: {
              id: 'master',
              type: 'Link',
              linkType: 'Environment',
            },
          },
          publishedVersion: 23,
          revision: 11,
          contentType: {
            sys: {
              type: 'Link',
              linkType: 'ContentType',
              id: 'person',
            },
          },
          locale: 'en-US',
        },
        fields: {
          name: '❌ [ENG] E Person',
          image: {
            sys: {
              type: 'Link',
              linkType: 'Asset',
              id: '6fdNRFZbNXpiXQd6v7fHen',
            },
          },
          title: 'E Person Title',
        },
      },
      {
        metadata: {
          tags: [],
          concepts: [
            {
              sys: {
                type: 'Link',
                linkType: 'TaxonomyConcept',
                id: 'engTestPerson',
              },
            },
          ],
        },
        sys: {
          space: {
            sys: {
              type: 'Link',
              linkType: 'Space',
              id: '90t6bu6vlf76',
            },
          },
          id: '2JLo5rz0ZXkscFjP0VOzJh',
          type: 'Entry',
          createdAt: '2025-07-02T22:44:02.778Z',
          updatedAt: '2025-07-23T18:10:13.906Z',
          environment: {
            sys: {
              id: 'master',
              type: 'Link',
              linkType: 'Environment',
            },
          },
          publishedVersion: 23,
          revision: 11,
          contentType: {
            sys: {
              type: 'Link',
              linkType: 'ContentType',
              id: 'person',
            },
          },
          locale: 'en-US',
        },
        fields: {
          name: '❌ [ENG] F Person',
          image: {
            sys: {
              type: 'Link',
              linkType: 'Asset',
              id: '6fdNRFZbNXpiXQd6v7fHen',
            },
          },
          title: 'F Person Title',
          personalLink: {
            sys: {
              type: 'Link',
              linkType: 'Entry',
              id: '5CznPyR4ZsbIkhpwSaUxoe',
            },
          },
        },
      },
      {
        metadata: {
          tags: [],
          concepts: [
            {
              sys: {
                type: 'Link',
                linkType: 'TaxonomyConcept',
                id: 'engTestPerson',
              },
            },
          ],
        },
        sys: {
          space: {
            sys: {
              type: 'Link',
              linkType: 'Space',
              id: '90t6bu6vlf76',
            },
          },
          id: 'pkTMkG4WCErv8JdPfJhar',
          type: 'Entry',
          createdAt: '2025-07-02T22:43:46.182Z',
          updatedAt: '2025-07-23T18:10:13.851Z',
          environment: {
            sys: {
              id: 'master',
              type: 'Link',
              linkType: 'Environment',
            },
          },
          publishedVersion: 23,
          revision: 11,
          contentType: {
            sys: {
              type: 'Link',
              linkType: 'ContentType',
              id: 'person',
            },
          },
          locale: 'en-US',
        },
        fields: {
          name: '❌ [ENG] B Person',
          image: {
            sys: {
              type: 'Link',
              linkType: 'Asset',
              id: '6fdNRFZbNXpiXQd6v7fHen',
            },
          },
          title: 'B Person Title',
          bio: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Praesent eget risus vitae massa semper aliquam quis mattis quam. Morbi vitae tortor tempus, placerat leo et, suscipit lectus.',
          personalLink: {
            sys: {
              type: 'Link',
              linkType: 'Entry',
              id: '5CznPyR4ZsbIkhpwSaUxoe',
            },
          },
        },
      },
      {
        metadata: {
          tags: [],
          concepts: [
            {
              sys: {
                type: 'Link',
                linkType: 'TaxonomyConcept',
                id: 'engTestPerson',
              },
            },
          ],
        },
        sys: {
          space: {
            sys: {
              type: 'Link',
              linkType: 'Space',
              id: '90t6bu6vlf76',
            },
          },
          id: '2jh7UpvUMH5dYNR7dDZJdw',
          type: 'Entry',
          createdAt: '2025-07-02T22:43:26.693Z',
          updatedAt: '2025-07-23T18:10:13.762Z',
          environment: {
            sys: {
              id: 'master',
              type: 'Link',
              linkType: 'Environment',
            },
          },
          publishedVersion: 23,
          revision: 11,
          contentType: {
            sys: {
              type: 'Link',
              linkType: 'ContentType',
              id: 'person',
            },
          },
          locale: 'en-US',
        },
        fields: {
          name: '❌ [ENG] D Person',
          title: 'D Person Title',
          bio: 'Phasellus ut euismod massa, eu eleifend ipsum. Nulla eu neque commodo, dapibus dolor eget, dictum arcu. In nec purus eu tellus consequat ultricies. Donec feugiat tempor turpis, rutrum sagittis mi.',
        },
      },
    ] as any,
    sortOrder: 'alphabetical',
    hideImages: true,
  },
};
