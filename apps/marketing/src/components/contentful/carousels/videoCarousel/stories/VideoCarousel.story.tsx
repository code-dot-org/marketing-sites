/* eslint-disable @typescript-eslint/no-explicit-any */

import {Meta, StoryObj} from '@storybook/react';

import VideoCarousel, {VideoCarouselProps} from '../VideoCarousel';

const meta: Meta<VideoCarouselProps> = {
  title: 'Marketing/Carousel/Video',
  component: VideoCarousel,
  tags: ['autodocs'],
};
export default meta;

type Story = StoryObj<VideoCarouselProps>;

export const FilledOut: Story = {
  args: {
    slides: [
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
          id: '53hnyQQVUfylnTa7f24dDJ',
          type: 'Entry',
          createdAt: '2025-02-03T17:10:00.912Z',
          updatedAt: '2025-07-23T18:10:12.861Z',
          environment: {
            sys: {
              id: 'master',
              type: 'Link',
              linkType: 'Environment',
            },
          },
          publishedVersion: 72,
          revision: 22,
          contentType: {
            sys: {
              type: 'Link',
              linkType: 'ContentType',
              id: 'video',
            },
          },
          locale: 'en-US',
        },
        fields: {
          videoTitle: 'Introducing How AI Works',
          youTubeId: 'Ok-xpKjKp2g',
          videoFallbackFile: {
            sys: {
              type: 'Link',
              linkType: 'Asset',
              id: '1jVlIMJ2yBmzqD1H5hHDNj',
            },
          },
          videoFallbackUrl:
            'https://contentful-videos.code.org/90t6bu6vlf76/1jVlIMJ2yBmzqD1H5hHDNj/9fe6b733248373a6546b44d1bad1baf6/ai-01-intro-to-ai.mp4',
          publishedDate: '2020-12-01T00:00-04:00',
          description:
            'Learn all about how AI works with this new video series. ',
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
          id: '3BLuF3jm0oTV17RPwLOgC6',
          type: 'Entry',
          createdAt: '2025-01-21T22:14:16.304Z',
          updatedAt: '2025-07-23T18:10:11.986Z',
          environment: {
            sys: {
              id: 'master',
              type: 'Link',
              linkType: 'Environment',
            },
          },
          publishedVersion: 92,
          revision: 23,
          contentType: {
            sys: {
              type: 'Link',
              linkType: 'ContentType',
              id: 'video',
            },
          },
          locale: 'en-US',
        },
        fields: {
          videoTitle: "What Most Schools Don't Teach",
          youTubeId: 'nKIu9yen5nc',
          videoFallbackFile: {
            sys: {
              type: 'Link',
              linkType: 'Asset',
              id: '5Unfit2zLyqPp9HofyWU9T',
            },
          },
          videoFallbackUrl:
            'https://contentful-videos.code.org/90t6bu6vlf76/5Unfit2zLyqPp9HofyWU9T/4f0a43abe3dc649dc752ca321f1945c7/what-most-schools-dont-teach.mp4',
          publishedDate: '2013-02-26T00:00-04:00',
          description:
            'Learn about a new "superpower" that isn\'t being taught in more than half of U.S. schools.  ',
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
          id: '3oxrIQkHqzpbTrXqwk0aIa',
          type: 'Entry',
          createdAt: '2025-03-04T18:34:22.395Z',
          updatedAt: '2025-07-23T18:10:12.815Z',
          environment: {
            sys: {
              id: 'master',
              type: 'Link',
              linkType: 'Environment',
            },
          },
          publishedVersion: 67,
          revision: 21,
          contentType: {
            sys: {
              type: 'Link',
              linkType: 'ContentType',
              id: 'video',
            },
          },
          locale: 'en-US',
        },
        fields: {
          videoTitle: 'Computer Science is Changing Everything',
          youTubeId: 'QvyTEx1wyOY',
          videoFallbackFile: {
            sys: {
              type: 'Link',
              linkType: 'Asset',
              id: 'L5PVu2K4eN5rocJTApuC5',
            },
          },
          videoFallbackUrl:
            'https://contentful-videos.code.org/90t6bu6vlf76/L5PVu2K4eN5rocJTApuC5/fb69b3b7d0a0e95989feec6165725a22/cs-is-everything.mp4',
          publishedDate: '2019-09-29T00:00-04:00',
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
          id: '4xyTmh7jAVCC3glKeke0cP',
          type: 'Entry',
          createdAt: '2025-03-17T18:49:45.094Z',
          updatedAt: '2025-07-23T18:10:12.771Z',
          environment: {
            sys: {
              id: 'master',
              type: 'Link',
              linkType: 'Environment',
            },
          },
          publishedVersion: 64,
          revision: 18,
          contentType: {
            sys: {
              type: 'Link',
              linkType: 'ContentType',
              id: 'video',
            },
          },
          locale: 'en-US',
        },
        fields: {
          videoTitle: 'Introducing How Computers Work',
          youTubeId: 'OAx_6-wdslM',
          videoFallbackFile: {
            sys: {
              type: 'Link',
              linkType: 'Asset',
              id: '2lkClZGdouHPDUTRZu8LxZ',
            },
          },
          videoFallbackUrl:
            'https://contentful-videos.code.org/90t6bu6vlf76/2lkClZGdouHPDUTRZu8LxZ/271ce1df5c6909836589a34212476757/01_howcomputerswork_sm-mp4.mp4',
          publishedDate: '2018-01-30T00:00-04:00',
          description:
            'Bill Gates kicks off an introduction to the series How Computers Work.',
        },
      },
    ] as any,
  },
};
