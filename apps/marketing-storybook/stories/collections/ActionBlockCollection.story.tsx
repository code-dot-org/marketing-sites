/* eslint-disable @typescript-eslint/no-explicit-any */
import ActionBlockCollection, {
  ActionBlockCollectionProps,
} from '@/components/contentful/collections/actionBlockCollection/ActionBlockCollection';
import {Meta, StoryObj} from '@storybook/react';

const meta: Meta<ActionBlockCollectionProps> = {
  title: 'Marketing/Collection/ActionBlock',
  component: ActionBlockCollection,
  tags: ['autodocs'],
};
export default meta;

type Story = StoryObj<ActionBlockCollectionProps>;

export const SortedAlphabetically: Story = {
  args: {
    className: '',
    blocks: [
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
          id: '6Jgr1x1twPWiSMQpCUmrUt',
          type: 'Entry',
          createdAt: '2025-05-16T16:28:52.056Z',
          updatedAt: '2025-07-23T18:10:14.255Z',
          environment: {
            sys: {
              id: 'master',
              type: 'Link',
              linkType: 'Environment',
            },
          },
          publishedVersion: 55,
          revision: 14,
          contentType: {
            sys: {
              type: 'Link',
              linkType: 'ContentType',
              id: 'curriculum',
            },
          },
          locale: 'en-US',
        },
        fields: {
          title: '❌ [ENG] Curriculum 3',
          actionBlockOverline: 'Grades 6-8',
          shortDescription:
            'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Praesent eget risus vitae massa semper aliquam quis mattis quam.',
          primaryLinkRef: {
            sys: {
              type: 'Link',
              linkType: 'Entry',
              id: '79dI2fR2dzbb0IN3dFQJ3t',
            },
          },
          secondaryLinkRef: {
            sys: {
              type: 'Link',
              linkType: 'Entry',
              id: '49SifjEqSHArcx1iEiSw4o',
            },
          },
          image: {
            sys: {
              type: 'Link',
              linkType: 'Asset',
              id: '46WnKBOGVA8e4bFtBSRPuE',
            },
          },
          experienceLevel: ['Beginner'],
          duration: ['School Year'],
          devices: ['Computer'],
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
          id: '7Gumifs6ZTcj2G02BUoqFz',
          type: 'Entry',
          createdAt: '2025-04-08T16:00:54.305Z',
          updatedAt: '2025-07-23T18:10:12.048Z',
          environment: {
            sys: {
              id: 'master',
              type: 'Link',
              linkType: 'Environment',
            },
          },
          publishedVersion: 106,
          revision: 19,
          contentType: {
            sys: {
              type: 'Link',
              linkType: 'ContentType',
              id: 'selfPacedPl',
            },
          },
          locale: 'en-US',
        },
        fields: {
          title: '❌ [ENG] Self-Paced PL 1',
          actionBlockOverline: 'K-12 Teachers',
          shortDescription:
            'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Praesent eget risus vitae massa semper aliquam quis mattis quam.',
          image: {
            sys: {
              type: 'Link',
              linkType: 'Asset',
              id: '6fdNRFZbNXpiXQd6v7fHen',
            },
          },
          primaryLinkRef: {
            sys: {
              type: 'Link',
              linkType: 'Entry',
              id: '79dI2fR2dzbb0IN3dFQJ3t',
            },
          },
          secondaryLinkRef: {
            sys: {
              type: 'Link',
              linkType: 'Entry',
              id: '49SifjEqSHArcx1iEiSw4o',
            },
          },
          marketingLink: {
            sys: {
              type: 'Link',
              linkType: 'Entry',
              id: '5CznPyR4ZsbIkhpwSaUxoe',
            },
          },
          experienceLevel: ['Beginner'],
          duration: 1,
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
          id: '1HWV07i9omvarlmtVr4orB',
          type: 'Entry',
          createdAt: '2025-05-16T16:28:44.850Z',
          updatedAt: '2025-07-23T18:10:14.286Z',
          environment: {
            sys: {
              id: 'master',
              type: 'Link',
              linkType: 'Environment',
            },
          },
          publishedVersion: 55,
          revision: 14,
          contentType: {
            sys: {
              type: 'Link',
              linkType: 'ContentType',
              id: 'curriculum',
            },
          },
          locale: 'en-US',
        },
        fields: {
          title: '❌ [ENG] Curriculum 2',
          actionBlockOverline: 'Grades 6-8',
          shortDescription:
            'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Praesent eget risus vitae massa semper aliquam quis mattis quam.',
          primaryLinkRef: {
            sys: {
              type: 'Link',
              linkType: 'Entry',
              id: '79dI2fR2dzbb0IN3dFQJ3t',
            },
          },
          secondaryLinkRef: {
            sys: {
              type: 'Link',
              linkType: 'Entry',
              id: '49SifjEqSHArcx1iEiSw4o',
            },
          },
          image: {
            sys: {
              type: 'Link',
              linkType: 'Asset',
              id: '46WnKBOGVA8e4bFtBSRPuE',
            },
          },
          experienceLevel: ['Beginner'],
          duration: ['School Year'],
          devices: ['Computer'],
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
          id: 'tQOlCHWsKpGR4hFaI3xqm',
          type: 'Entry',
          createdAt: '2025-07-02T22:44:50.443Z',
          updatedAt: '2025-07-23T18:10:13.280Z',
          environment: {
            sys: {
              id: 'master',
              type: 'Link',
              linkType: 'Environment',
            },
          },
          publishedVersion: 34,
          revision: 11,
          contentType: {
            sys: {
              type: 'Link',
              linkType: 'ContentType',
              id: 'selfPacedPl',
            },
          },
          locale: 'en-US',
        },
        fields: {
          title: '❌ [ENG] Self-Paced PL 3',
          actionBlockOverline: 'K-12 Teachers',
          shortDescription:
            'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Praesent eget risus vitae massa semper aliquam quis mattis quam.',
          image: {
            sys: {
              type: 'Link',
              linkType: 'Asset',
              id: '6fdNRFZbNXpiXQd6v7fHen',
            },
          },
          primaryLinkRef: {
            sys: {
              type: 'Link',
              linkType: 'Entry',
              id: '79dI2fR2dzbb0IN3dFQJ3t',
            },
          },
          secondaryLinkRef: {
            sys: {
              type: 'Link',
              linkType: 'Entry',
              id: '49SifjEqSHArcx1iEiSw4o',
            },
          },
          marketingLink: {
            sys: {
              type: 'Link',
              linkType: 'Entry',
              id: '5CznPyR4ZsbIkhpwSaUxoe',
            },
          },
          experienceLevel: ['Beginner'],
          duration: 1,
          publishedDate: '2025-02-01T09:00-04:00',
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
          id: '3CqSD4orrZzEoAvyXEFS7x',
          type: 'Entry',
          createdAt: '2025-05-16T16:28:37.637Z',
          updatedAt: '2025-07-23T18:10:12.331Z',
          environment: {
            sys: {
              id: 'master',
              type: 'Link',
              linkType: 'Environment',
            },
          },
          publishedVersion: 65,
          revision: 14,
          contentType: {
            sys: {
              type: 'Link',
              linkType: 'ContentType',
              id: 'curriculum',
            },
          },
          locale: 'en-US',
        },
        fields: {
          title: '❌ [ENG] Curriculum 1',
          actionBlockOverline: 'Grades K-5',
          shortDescription:
            'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Praesent eget risus vitae massa semper aliquam quis mattis quam.',
          primaryLinkRef: {
            sys: {
              type: 'Link',
              linkType: 'Entry',
              id: '79dI2fR2dzbb0IN3dFQJ3t',
            },
          },
          secondaryLinkRef: {
            sys: {
              type: 'Link',
              linkType: 'Entry',
              id: '49SifjEqSHArcx1iEiSw4o',
            },
          },
          image: {
            sys: {
              type: 'Link',
              linkType: 'Asset',
              id: '46WnKBOGVA8e4bFtBSRPuE',
            },
          },
          grade: [
            'K',
            '1',
            '2',
            '3',
            '4',
            '5',
            '6',
            '7',
            '8',
            '9',
            '10',
            '11',
            '12',
          ],
          experienceLevel: ['Beginner'],
          duration: ['School Year'],
          devices: ['Computer'],
          topics: [
            'Art and Design',
            'App Design',
            'Artificial Intelligence',
            'Web Design',
          ],
          professionalLearning: [
            'Facilitator-led Workshops',
            'Self-paced Modules',
          ],
          accessibility: [
            'Text to Speech',
            'Closed captioning',
            'Immersive reader',
          ],
          languages: [
            'Arabic',
            'Bahasa Indonesian',
            'Chinese Traditional',
            'English',
            'Farsi',
            'French',
            'German',
            'Hindi',
            'Italian',
            'Japanese',
            'Korean',
            'Polish',
            'Portuguese - Brazil',
            'Slovak',
            'Spanish - Latam',
            'Spanish - Spain',
            'Thai',
            'Turkish',
          ],
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
          id: '6gUm7q1JYZjyE5p9EfANIG',
          type: 'Entry',
          createdAt: '2025-07-02T22:44:50.476Z',
          updatedAt: '2025-07-23T18:10:13.317Z',
          environment: {
            sys: {
              id: 'master',
              type: 'Link',
              linkType: 'Environment',
            },
          },
          publishedVersion: 34,
          revision: 11,
          contentType: {
            sys: {
              type: 'Link',
              linkType: 'ContentType',
              id: 'selfPacedPl',
            },
          },
          locale: 'en-US',
        },
        fields: {
          title: '❌ [ENG] Self-Paced PL 2',
          actionBlockOverline: 'K-12 Teachers',
          shortDescription:
            'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Praesent eget risus vitae massa semper aliquam quis mattis quam.',
          image: {
            sys: {
              type: 'Link',
              linkType: 'Asset',
              id: '6fdNRFZbNXpiXQd6v7fHen',
            },
          },
          primaryLinkRef: {
            sys: {
              type: 'Link',
              linkType: 'Entry',
              id: '79dI2fR2dzbb0IN3dFQJ3t',
            },
          },
          secondaryLinkRef: {
            sys: {
              type: 'Link',
              linkType: 'Entry',
              id: '49SifjEqSHArcx1iEiSw4o',
            },
          },
          marketingLink: {
            sys: {
              type: 'Link',
              linkType: 'Entry',
              id: '5CznPyR4ZsbIkhpwSaUxoe',
            },
          },
          experienceLevel: ['Beginner'],
          duration: 1,
          publishedDate: '2025-02-01',
        },
      },
    ] as any,
    background: 'primary',
    sortOrder: 'alphabetical',
    hideImages: false,
  },
};

export const SortedManually: Story = {
  args: {
    className: '',
    blocks: [
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
          id: '6Jgr1x1twPWiSMQpCUmrUt',
          type: 'Entry',
          createdAt: '2025-05-16T16:28:52.056Z',
          updatedAt: '2025-07-23T18:10:14.255Z',
          environment: {
            sys: {
              id: 'master',
              type: 'Link',
              linkType: 'Environment',
            },
          },
          publishedVersion: 55,
          revision: 14,
          contentType: {
            sys: {
              type: 'Link',
              linkType: 'ContentType',
              id: 'curriculum',
            },
          },
          locale: 'en-US',
        },
        fields: {
          title: '❌ [ENG] Curriculum 3',
          actionBlockOverline: 'Grades 6-8',
          shortDescription:
            'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Praesent eget risus vitae massa semper aliquam quis mattis quam.',
          primaryLinkRef: {
            sys: {
              type: 'Link',
              linkType: 'Entry',
              id: '79dI2fR2dzbb0IN3dFQJ3t',
            },
          },
          secondaryLinkRef: {
            sys: {
              type: 'Link',
              linkType: 'Entry',
              id: '49SifjEqSHArcx1iEiSw4o',
            },
          },
          image: {
            sys: {
              type: 'Link',
              linkType: 'Asset',
              id: '46WnKBOGVA8e4bFtBSRPuE',
            },
          },
          experienceLevel: ['Beginner'],
          duration: ['School Year'],
          devices: ['Computer'],
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
          id: '7Gumifs6ZTcj2G02BUoqFz',
          type: 'Entry',
          createdAt: '2025-04-08T16:00:54.305Z',
          updatedAt: '2025-07-23T18:10:12.048Z',
          environment: {
            sys: {
              id: 'master',
              type: 'Link',
              linkType: 'Environment',
            },
          },
          publishedVersion: 106,
          revision: 19,
          contentType: {
            sys: {
              type: 'Link',
              linkType: 'ContentType',
              id: 'selfPacedPl',
            },
          },
          locale: 'en-US',
        },
        fields: {
          title: '❌ [ENG] Self-Paced PL 1',
          actionBlockOverline: 'K-12 Teachers',
          shortDescription:
            'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Praesent eget risus vitae massa semper aliquam quis mattis quam.',
          image: {
            sys: {
              type: 'Link',
              linkType: 'Asset',
              id: '6fdNRFZbNXpiXQd6v7fHen',
            },
          },
          primaryLinkRef: {
            sys: {
              type: 'Link',
              linkType: 'Entry',
              id: '79dI2fR2dzbb0IN3dFQJ3t',
            },
          },
          secondaryLinkRef: {
            sys: {
              type: 'Link',
              linkType: 'Entry',
              id: '49SifjEqSHArcx1iEiSw4o',
            },
          },
          marketingLink: {
            sys: {
              type: 'Link',
              linkType: 'Entry',
              id: '5CznPyR4ZsbIkhpwSaUxoe',
            },
          },
          experienceLevel: ['Beginner'],
          duration: 1,
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
          id: '1HWV07i9omvarlmtVr4orB',
          type: 'Entry',
          createdAt: '2025-05-16T16:28:44.850Z',
          updatedAt: '2025-07-23T18:10:14.286Z',
          environment: {
            sys: {
              id: 'master',
              type: 'Link',
              linkType: 'Environment',
            },
          },
          publishedVersion: 55,
          revision: 14,
          contentType: {
            sys: {
              type: 'Link',
              linkType: 'ContentType',
              id: 'curriculum',
            },
          },
          locale: 'en-US',
        },
        fields: {
          title: '❌ [ENG] Curriculum 2',
          actionBlockOverline: 'Grades 6-8',
          shortDescription:
            'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Praesent eget risus vitae massa semper aliquam quis mattis quam.',
          primaryLinkRef: {
            sys: {
              type: 'Link',
              linkType: 'Entry',
              id: '79dI2fR2dzbb0IN3dFQJ3t',
            },
          },
          secondaryLinkRef: {
            sys: {
              type: 'Link',
              linkType: 'Entry',
              id: '49SifjEqSHArcx1iEiSw4o',
            },
          },
          image: {
            sys: {
              type: 'Link',
              linkType: 'Asset',
              id: '46WnKBOGVA8e4bFtBSRPuE',
            },
          },
          experienceLevel: ['Beginner'],
          duration: ['School Year'],
          devices: ['Computer'],
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
          id: 'tQOlCHWsKpGR4hFaI3xqm',
          type: 'Entry',
          createdAt: '2025-07-02T22:44:50.443Z',
          updatedAt: '2025-07-23T18:10:13.280Z',
          environment: {
            sys: {
              id: 'master',
              type: 'Link',
              linkType: 'Environment',
            },
          },
          publishedVersion: 34,
          revision: 11,
          contentType: {
            sys: {
              type: 'Link',
              linkType: 'ContentType',
              id: 'selfPacedPl',
            },
          },
          locale: 'en-US',
        },
        fields: {
          title: '❌ [ENG] Self-Paced PL 3',
          actionBlockOverline: 'K-12 Teachers',
          shortDescription:
            'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Praesent eget risus vitae massa semper aliquam quis mattis quam.',
          image: {
            sys: {
              type: 'Link',
              linkType: 'Asset',
              id: '6fdNRFZbNXpiXQd6v7fHen',
            },
          },
          primaryLinkRef: {
            sys: {
              type: 'Link',
              linkType: 'Entry',
              id: '79dI2fR2dzbb0IN3dFQJ3t',
            },
          },
          secondaryLinkRef: {
            sys: {
              type: 'Link',
              linkType: 'Entry',
              id: '49SifjEqSHArcx1iEiSw4o',
            },
          },
          marketingLink: {
            sys: {
              type: 'Link',
              linkType: 'Entry',
              id: '5CznPyR4ZsbIkhpwSaUxoe',
            },
          },
          experienceLevel: ['Beginner'],
          duration: 1,
          publishedDate: '2025-02-01T09:00-04:00',
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
          id: '3CqSD4orrZzEoAvyXEFS7x',
          type: 'Entry',
          createdAt: '2025-05-16T16:28:37.637Z',
          updatedAt: '2025-07-23T18:10:12.331Z',
          environment: {
            sys: {
              id: 'master',
              type: 'Link',
              linkType: 'Environment',
            },
          },
          publishedVersion: 65,
          revision: 14,
          contentType: {
            sys: {
              type: 'Link',
              linkType: 'ContentType',
              id: 'curriculum',
            },
          },
          locale: 'en-US',
        },
        fields: {
          title: '❌ [ENG] Curriculum 1',
          actionBlockOverline: 'Grades K-5',
          shortDescription:
            'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Praesent eget risus vitae massa semper aliquam quis mattis quam.',
          primaryLinkRef: {
            sys: {
              type: 'Link',
              linkType: 'Entry',
              id: '79dI2fR2dzbb0IN3dFQJ3t',
            },
          },
          secondaryLinkRef: {
            sys: {
              type: 'Link',
              linkType: 'Entry',
              id: '49SifjEqSHArcx1iEiSw4o',
            },
          },
          image: {
            sys: {
              type: 'Link',
              linkType: 'Asset',
              id: '46WnKBOGVA8e4bFtBSRPuE',
            },
          },
          grade: [
            'K',
            '1',
            '2',
            '3',
            '4',
            '5',
            '6',
            '7',
            '8',
            '9',
            '10',
            '11',
            '12',
          ],
          experienceLevel: ['Beginner'],
          duration: ['School Year'],
          devices: ['Computer'],
          topics: [
            'Art and Design',
            'App Design',
            'Artificial Intelligence',
            'Web Design',
          ],
          professionalLearning: [
            'Facilitator-led Workshops',
            'Self-paced Modules',
          ],
          accessibility: [
            'Text to Speech',
            'Closed captioning',
            'Immersive reader',
          ],
          languages: [
            'Arabic',
            'Bahasa Indonesian',
            'Chinese Traditional',
            'English',
            'Farsi',
            'French',
            'German',
            'Hindi',
            'Italian',
            'Japanese',
            'Korean',
            'Polish',
            'Portuguese - Brazil',
            'Slovak',
            'Spanish - Latam',
            'Spanish - Spain',
            'Thai',
            'Turkish',
          ],
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
          id: '6gUm7q1JYZjyE5p9EfANIG',
          type: 'Entry',
          createdAt: '2025-07-02T22:44:50.476Z',
          updatedAt: '2025-07-23T18:10:13.317Z',
          environment: {
            sys: {
              id: 'master',
              type: 'Link',
              linkType: 'Environment',
            },
          },
          publishedVersion: 34,
          revision: 11,
          contentType: {
            sys: {
              type: 'Link',
              linkType: 'ContentType',
              id: 'selfPacedPl',
            },
          },
          locale: 'en-US',
        },
        fields: {
          title: '❌ [ENG] Self-Paced PL 2',
          actionBlockOverline: 'K-12 Teachers',
          shortDescription:
            'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Praesent eget risus vitae massa semper aliquam quis mattis quam.',
          image: {
            sys: {
              type: 'Link',
              linkType: 'Asset',
              id: '6fdNRFZbNXpiXQd6v7fHen',
            },
          },
          primaryLinkRef: {
            sys: {
              type: 'Link',
              linkType: 'Entry',
              id: '79dI2fR2dzbb0IN3dFQJ3t',
            },
          },
          secondaryLinkRef: {
            sys: {
              type: 'Link',
              linkType: 'Entry',
              id: '49SifjEqSHArcx1iEiSw4o',
            },
          },
          marketingLink: {
            sys: {
              type: 'Link',
              linkType: 'Entry',
              id: '5CznPyR4ZsbIkhpwSaUxoe',
            },
          },
          experienceLevel: ['Beginner'],
          duration: 1,
          publishedDate: '2025-02-01',
        },
      },
    ] as any,
    background: 'primary',
    sortOrder: 'manual',
    hideImages: false,
  },
};

export const HiddenImages: Story = {
  args: {
    className: '',
    blocks: [
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
          id: '6Jgr1x1twPWiSMQpCUmrUt',
          type: 'Entry',
          createdAt: '2025-05-16T16:28:52.056Z',
          updatedAt: '2025-07-23T18:10:14.255Z',
          environment: {
            sys: {
              id: 'master',
              type: 'Link',
              linkType: 'Environment',
            },
          },
          publishedVersion: 55,
          revision: 14,
          contentType: {
            sys: {
              type: 'Link',
              linkType: 'ContentType',
              id: 'curriculum',
            },
          },
          locale: 'en-US',
        },
        fields: {
          title: '❌ [ENG] Curriculum 3',
          actionBlockOverline: 'Grades 6-8',
          shortDescription:
            'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Praesent eget risus vitae massa semper aliquam quis mattis quam.',
          primaryLinkRef: {
            sys: {
              type: 'Link',
              linkType: 'Entry',
              id: '79dI2fR2dzbb0IN3dFQJ3t',
            },
          },
          secondaryLinkRef: {
            sys: {
              type: 'Link',
              linkType: 'Entry',
              id: '49SifjEqSHArcx1iEiSw4o',
            },
          },
          image: {
            sys: {
              type: 'Link',
              linkType: 'Asset',
              id: '46WnKBOGVA8e4bFtBSRPuE',
            },
          },
          experienceLevel: ['Beginner'],
          duration: ['School Year'],
          devices: ['Computer'],
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
          id: '7Gumifs6ZTcj2G02BUoqFz',
          type: 'Entry',
          createdAt: '2025-04-08T16:00:54.305Z',
          updatedAt: '2025-07-23T18:10:12.048Z',
          environment: {
            sys: {
              id: 'master',
              type: 'Link',
              linkType: 'Environment',
            },
          },
          publishedVersion: 106,
          revision: 19,
          contentType: {
            sys: {
              type: 'Link',
              linkType: 'ContentType',
              id: 'selfPacedPl',
            },
          },
          locale: 'en-US',
        },
        fields: {
          title: '❌ [ENG] Self-Paced PL 1',
          actionBlockOverline: 'K-12 Teachers',
          shortDescription:
            'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Praesent eget risus vitae massa semper aliquam quis mattis quam.',
          image: {
            sys: {
              type: 'Link',
              linkType: 'Asset',
              id: '6fdNRFZbNXpiXQd6v7fHen',
            },
          },
          primaryLinkRef: {
            sys: {
              type: 'Link',
              linkType: 'Entry',
              id: '79dI2fR2dzbb0IN3dFQJ3t',
            },
          },
          secondaryLinkRef: {
            sys: {
              type: 'Link',
              linkType: 'Entry',
              id: '49SifjEqSHArcx1iEiSw4o',
            },
          },
          marketingLink: {
            sys: {
              type: 'Link',
              linkType: 'Entry',
              id: '5CznPyR4ZsbIkhpwSaUxoe',
            },
          },
          experienceLevel: ['Beginner'],
          duration: 1,
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
          id: '1HWV07i9omvarlmtVr4orB',
          type: 'Entry',
          createdAt: '2025-05-16T16:28:44.850Z',
          updatedAt: '2025-07-23T18:10:14.286Z',
          environment: {
            sys: {
              id: 'master',
              type: 'Link',
              linkType: 'Environment',
            },
          },
          publishedVersion: 55,
          revision: 14,
          contentType: {
            sys: {
              type: 'Link',
              linkType: 'ContentType',
              id: 'curriculum',
            },
          },
          locale: 'en-US',
        },
        fields: {
          title: '❌ [ENG] Curriculum 2',
          actionBlockOverline: 'Grades 6-8',
          shortDescription:
            'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Praesent eget risus vitae massa semper aliquam quis mattis quam.',
          primaryLinkRef: {
            sys: {
              type: 'Link',
              linkType: 'Entry',
              id: '79dI2fR2dzbb0IN3dFQJ3t',
            },
          },
          secondaryLinkRef: {
            sys: {
              type: 'Link',
              linkType: 'Entry',
              id: '49SifjEqSHArcx1iEiSw4o',
            },
          },
          image: {
            sys: {
              type: 'Link',
              linkType: 'Asset',
              id: '46WnKBOGVA8e4bFtBSRPuE',
            },
          },
          experienceLevel: ['Beginner'],
          duration: ['School Year'],
          devices: ['Computer'],
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
          id: 'tQOlCHWsKpGR4hFaI3xqm',
          type: 'Entry',
          createdAt: '2025-07-02T22:44:50.443Z',
          updatedAt: '2025-07-23T18:10:13.280Z',
          environment: {
            sys: {
              id: 'master',
              type: 'Link',
              linkType: 'Environment',
            },
          },
          publishedVersion: 34,
          revision: 11,
          contentType: {
            sys: {
              type: 'Link',
              linkType: 'ContentType',
              id: 'selfPacedPl',
            },
          },
          locale: 'en-US',
        },
        fields: {
          title: '❌ [ENG] Self-Paced PL 3',
          actionBlockOverline: 'K-12 Teachers',
          shortDescription:
            'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Praesent eget risus vitae massa semper aliquam quis mattis quam.',
          image: {
            sys: {
              type: 'Link',
              linkType: 'Asset',
              id: '6fdNRFZbNXpiXQd6v7fHen',
            },
          },
          primaryLinkRef: {
            sys: {
              type: 'Link',
              linkType: 'Entry',
              id: '79dI2fR2dzbb0IN3dFQJ3t',
            },
          },
          secondaryLinkRef: {
            sys: {
              type: 'Link',
              linkType: 'Entry',
              id: '49SifjEqSHArcx1iEiSw4o',
            },
          },
          marketingLink: {
            sys: {
              type: 'Link',
              linkType: 'Entry',
              id: '5CznPyR4ZsbIkhpwSaUxoe',
            },
          },
          experienceLevel: ['Beginner'],
          duration: 1,
          publishedDate: '2025-02-01T09:00-04:00',
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
          id: '3CqSD4orrZzEoAvyXEFS7x',
          type: 'Entry',
          createdAt: '2025-05-16T16:28:37.637Z',
          updatedAt: '2025-07-23T18:10:12.331Z',
          environment: {
            sys: {
              id: 'master',
              type: 'Link',
              linkType: 'Environment',
            },
          },
          publishedVersion: 65,
          revision: 14,
          contentType: {
            sys: {
              type: 'Link',
              linkType: 'ContentType',
              id: 'curriculum',
            },
          },
          locale: 'en-US',
        },
        fields: {
          title: '❌ [ENG] Curriculum 1',
          actionBlockOverline: 'Grades K-5',
          shortDescription:
            'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Praesent eget risus vitae massa semper aliquam quis mattis quam.',
          primaryLinkRef: {
            sys: {
              type: 'Link',
              linkType: 'Entry',
              id: '79dI2fR2dzbb0IN3dFQJ3t',
            },
          },
          secondaryLinkRef: {
            sys: {
              type: 'Link',
              linkType: 'Entry',
              id: '49SifjEqSHArcx1iEiSw4o',
            },
          },
          image: {
            sys: {
              type: 'Link',
              linkType: 'Asset',
              id: '46WnKBOGVA8e4bFtBSRPuE',
            },
          },
          grade: [
            'K',
            '1',
            '2',
            '3',
            '4',
            '5',
            '6',
            '7',
            '8',
            '9',
            '10',
            '11',
            '12',
          ],
          experienceLevel: ['Beginner'],
          duration: ['School Year'],
          devices: ['Computer'],
          topics: [
            'Art and Design',
            'App Design',
            'Artificial Intelligence',
            'Web Design',
          ],
          professionalLearning: [
            'Facilitator-led Workshops',
            'Self-paced Modules',
          ],
          accessibility: [
            'Text to Speech',
            'Closed captioning',
            'Immersive reader',
          ],
          languages: [
            'Arabic',
            'Bahasa Indonesian',
            'Chinese Traditional',
            'English',
            'Farsi',
            'French',
            'German',
            'Hindi',
            'Italian',
            'Japanese',
            'Korean',
            'Polish',
            'Portuguese - Brazil',
            'Slovak',
            'Spanish - Latam',
            'Spanish - Spain',
            'Thai',
            'Turkish',
          ],
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
          id: '6gUm7q1JYZjyE5p9EfANIG',
          type: 'Entry',
          createdAt: '2025-07-02T22:44:50.476Z',
          updatedAt: '2025-07-23T18:10:13.317Z',
          environment: {
            sys: {
              id: 'master',
              type: 'Link',
              linkType: 'Environment',
            },
          },
          publishedVersion: 34,
          revision: 11,
          contentType: {
            sys: {
              type: 'Link',
              linkType: 'ContentType',
              id: 'selfPacedPl',
            },
          },
          locale: 'en-US',
        },
        fields: {
          title: '❌ [ENG] Self-Paced PL 2',
          actionBlockOverline: 'K-12 Teachers',
          shortDescription:
            'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Praesent eget risus vitae massa semper aliquam quis mattis quam.',
          image: {
            sys: {
              type: 'Link',
              linkType: 'Asset',
              id: '6fdNRFZbNXpiXQd6v7fHen',
            },
          },
          primaryLinkRef: {
            sys: {
              type: 'Link',
              linkType: 'Entry',
              id: '79dI2fR2dzbb0IN3dFQJ3t',
            },
          },
          secondaryLinkRef: {
            sys: {
              type: 'Link',
              linkType: 'Entry',
              id: '49SifjEqSHArcx1iEiSw4o',
            },
          },
          marketingLink: {
            sys: {
              type: 'Link',
              linkType: 'Entry',
              id: '5CznPyR4ZsbIkhpwSaUxoe',
            },
          },
          experienceLevel: ['Beginner'],
          duration: 1,
          publishedDate: '2025-02-01',
        },
      },
    ] as any,
    background: 'primary',
    sortOrder: 'alphabetical',
    hideImages: true,
  },
};
