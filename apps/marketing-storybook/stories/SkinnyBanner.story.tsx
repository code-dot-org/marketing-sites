import SkinnyBanner from '@/components/contentful/skinnyBanner';
import {Meta, StoryObj} from '@storybook/react';

const meta: Meta<typeof SkinnyBanner> = {
  title: 'Marketing/SkinnyBanner',
  component: SkinnyBanner,
  parameters: {
    layout: 'centered',
  },
};
export default meta;

export const Playground: StoryObj<typeof SkinnyBanner> = {
  args: {
    contentMode: 'Light',
    heading: 'Skinny Banner Heading',
    description: 'This is a description for the Skinny Banner.',
    sectionImages: [
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
          id: '6fdNRFZbNXpiXQd6v7fHen',
          type: 'Asset',
          createdAt: '2025-03-10T17:47:45.550Z',
          updatedAt: '2025-03-11T23:01:17.123Z',
          environment: {
            sys: {
              id: 'master',
              type: 'Link',
              linkType: 'Environment',
            },
          },
          publishedVersion: 13,
          revision: 2,
          locale: 'en-US',
        },
        fields: {
          title: 'Image component test image',
          description: '',
          file: {
            url: '//contentful-images.code.org/90t6bu6vlf76/6fdNRFZbNXpiXQd6v7fHen/d6328a3a965b3daca5fb0375caf72064/image-component.png',
            details: {
              size: 330078,
              image: {
                width: 1200,
                height: 700,
              },
            },
            fileName: 'image-component.png',
            contentType: 'image/png',
          },
        },
      },
    ],
    buttonLinks: [
      {
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
    ],
    partnerLogo: 'https://example.com/partner-logo.png',
    partnerCallout: 'In partnership with Example',
    backgroundImage: 'https://example.com/background.jpg',
  },
  argTypes: {
    contentMode: {control: 'select', options: ['Light', 'Dark']},
    heading: {control: 'text'},
    description: {control: 'text'},
    sectionImages: {control: 'object'},
    buttonLinks: {control: 'object'},
    partnerLogo: {control: 'text'},
    partnerCallout: {control: 'text'},
    backgroundImage: {control: 'text'},
  },
};

export const LightBackground: StoryObj<typeof SkinnyBanner> = {
  args: {
    className: 'cf-42e4b0b8863324d5fa088ccede7a0ed5',
    heading: 'Skinny Banner Light Background',
    description:
      'Praesent eget risus vitae massa semper aliquam quis mattis quam. Morbi vitae tortor tempus, placerat leo et, suscipit lectus.',
    sectionImages: [
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
          id: '6fdNRFZbNXpiXQd6v7fHen',
          type: 'Asset',
          createdAt: '2025-03-10T17:47:45.550Z',
          updatedAt: '2025-03-11T23:01:17.123Z',
          environment: {
            sys: {
              id: 'master',
              type: 'Link',
              linkType: 'Environment',
            },
          },
          publishedVersion: 13,
          revision: 2,
          locale: 'en-US',
        },
        fields: {
          title: 'Image component test image',
          description: '',
          file: {
            url: '//contentful-images.code.org/90t6bu6vlf76/6fdNRFZbNXpiXQd6v7fHen/d6328a3a965b3daca5fb0375caf72064/image-component.png',
            details: {
              size: 330078,
              image: {
                width: 1200,
                height: 700,
              },
            },
            fileName: 'image-component.png',
            contentType: 'image/png',
          },
        },
      },
    ],
    buttonLinks: [
      {
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
    ],
    partnerLogo:
      '//contentful-images.code.org/90t6bu6vlf76/6TJZRnAUG6nipPqCP7pVFL/881151ccc632b92e38ef7693d77fab90/afe-d1c13b2b5d11e6d1eac3bfb83774614c.png',
    contentMode: 'Light',
  },
};

export const DarkBackground: StoryObj<typeof SkinnyBanner> = {
  args: {
    className: 'cf-319ed4731cab9fbc9225f3b0a53bd2d5',
    heading: 'Skinny Banner Dark Background',
    description:
      'Praesent eget risus vitae massa semper aliquam quis mattis quam. Morbi vitae tortor tempus, placerat leo et, suscipit lectus.',
    sectionImages: [
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
          id: '6fdNRFZbNXpiXQd6v7fHen',
          type: 'Asset',
          createdAt: '2025-03-10T17:47:45.550Z',
          updatedAt: '2025-03-11T23:01:17.123Z',
          environment: {
            sys: {
              id: 'master',
              type: 'Link',
              linkType: 'Environment',
            },
          },
          publishedVersion: 13,
          revision: 2,
          locale: 'en-US',
        },
        fields: {
          title: 'Image component test image',
          description: '',
          file: {
            url: '//contentful-images.code.org/90t6bu6vlf76/6fdNRFZbNXpiXQd6v7fHen/d6328a3a965b3daca5fb0375caf72064/image-component.png',
            details: {
              size: 330078,
              image: {
                width: 1200,
                height: 700,
              },
            },
            fileName: 'image-component.png',
            contentType: 'image/png',
          },
        },
      },
    ],
    buttonLinks: [
      {
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
    ],
    partnerLogo:
      '//contentful-images.code.org/90t6bu6vlf76/7iR45Lju4ssVPnrB0TYy8S/19994068b5cd151084a209c336a116bf/AFE-dark-logo.png',
    contentMode: 'Dark',
  },
};

export const ImageBackground: StoryObj<typeof SkinnyBanner> = {
  args: {
    className: 'cf-aaa6eb5d838ce73c4930462cfef7695f',
    heading: 'Skinny Banner Image Background',
    description:
      'Praesent eget risus vitae massa semper aliquam quis mattis quam. Morbi vitae tortor tempus, placerat leo et, suscipit lectus.',
    sectionImages: [
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
          id: '6fdNRFZbNXpiXQd6v7fHen',
          type: 'Asset',
          createdAt: '2025-03-10T17:47:45.550Z',
          updatedAt: '2025-03-11T23:01:17.123Z',
          environment: {
            sys: {
              id: 'master',
              type: 'Link',
              linkType: 'Environment',
            },
          },
          publishedVersion: 13,
          revision: 2,
          locale: 'en-US',
        },
        fields: {
          title: 'Image component test image',
          description: '',
          file: {
            url: '//contentful-images.code.org/90t6bu6vlf76/6fdNRFZbNXpiXQd6v7fHen/d6328a3a965b3daca5fb0375caf72064/image-component.png',
            details: {
              size: 330078,
              image: {
                width: 1200,
                height: 700,
              },
            },
            fileName: 'image-component.png',
            contentType: 'image/png',
          },
        },
      },
    ],
    backgroundImage:
      '//contentful-images.code.org/90t6bu6vlf76/5CxK7pS9iAl2fs6smAtV3Z/0d127bb5e1bd745fee89c9e2a4cbec9e/ai-bg.png',
    buttonLinks: [
      {
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
    ],
    contentMode: 'Dark',
  },
};
