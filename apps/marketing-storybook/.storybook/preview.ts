import {useInMemoryEntities} from '@contentful/experiences-sdk-react';
import {CssBaseline, ThemeProvider} from '@mui/material';
import {withThemeFromJSXProvider} from '@storybook/addon-themes';

import {loadFonts, injectFontAwesome} from '@code-dot-org/fonts';

import '@code-dot-org/fonts/brands/code.org/index.css';
import '@code-dot-org/fonts/brands/CSForAll/index.css';
import cdoTheme from '../../marketing/src/themes/code.org';
import csforallTheme from '../../marketing/src/themes/csforall';
import './preview.module.scss';

injectFontAwesome();

const inMemoryEntities = useInMemoryEntities();

inMemoryEntities.addEntities([
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
      createdAt: '2025-04-23T21:39:00.300Z',
      updatedAt: '2025-07-12T14:45:59.774Z',
      environment: {
        sys: {
          id: 'development',
          type: 'Link',
          linkType: 'Environment',
        },
      },
      publishedVersion: 27,
      revision: 8,
      locale: 'en-US',
    },
    fields: {
      title: 'Image component test image',
      file: {
        url: '//contentful-images.code.org/90t6bu6vlf76/6fdNRFZbNXpiXQd6v7fHen/283802ca53f84a232f5c602f22640825/image-component.png',
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
      type: 'Asset',
      id: '46WnKBOGVA8e4bFtBSRPuE',
      revision: 1,
      createdAt: '2025-04-23T21:00:27.764Z',
      updatedAt: '2025-04-25T17:13:59.767Z',
      publishedAt: '2025-04-23T21:39:48.672Z',
      firstPublishedAt: '2025-04-23T21:39:48.672Z',
      publishedVersion: 2,
      environment: {
        sys: {
          id: 'development',
          type: 'Link',
          linkType: 'Environment',
        },
      },
      locale: 'en-US',
    },
    fields: {
      title: 'teach-page-top',
      description: '',
      file: {
        url: '//contentful-images.code.org/90t6bu6vlf76/46WnKBOGVA8e4bFtBSRPuE/7dfb9f86c13b035a49c295e0f62a48b4/teach-page-top.png',
        details: {
          size: 176607,
          image: {
            width: 800,
            height: 545,
          },
        },
        fileName: 'teach-page-top.png',
        contentType: 'image/png',
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
      type: 'Asset',
      id: '46WnKBOGVA8e4bFtBSRPuE',
      revision: 1,
      createdAt: '2025-04-23T21:00:27.764Z',
      updatedAt: '2025-04-25T17:13:59.767Z',
      publishedAt: '2025-04-23T21:39:48.672Z',
      firstPublishedAt: '2025-04-23T21:39:48.672Z',
      publishedVersion: 2,
      environment: {
        sys: {
          id: 'development',
          type: 'Link',
          linkType: 'Environment',
        },
      },
      locale: 'en-US',
    },
    fields: {
      title: 'teach-page-top',
      description: '',
      file: {
        url: '//contentful-images.code.org/90t6bu6vlf76/46WnKBOGVA8e4bFtBSRPuE/7dfb9f86c13b035a49c295e0f62a48b4/teach-page-top.png',
        details: {
          size: 176607,
          image: {
            width: 800,
            height: 545,
          },
        },
        fileName: 'teach-page-top.png',
        contentType: 'image/png',
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
      type: 'Entry',
      id: '79dI2fR2dzbb0IN3dFQJ3t',
      contentType: {
        sys: {
          type: 'Link',
          linkType: 'ContentType',
          id: 'link',
        },
      },
      revision: 4,
      createdAt: '2025-04-28T17:12:29.695Z',
      updatedAt: '2025-07-23T18:02:19.027Z',
      publishedAt: '2025-07-02T20:13:16.886Z',
      firstPublishedAt: '2025-04-28T17:15:38.181Z',
      publishedVersion: 213,
      environment: {
        sys: {
          id: 'development',
          type: 'Link',
          linkType: 'Environment',
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
]);

/**
 * Ensure fonts are loaded prior to rendering the story
 */
const fontLoader = async () => {
  return {
    fonts: await loadFonts(),
  };
};

export const decorators = [
  withThemeFromJSXProvider({
    themes: {
      'code.org': cdoTheme,
      csforall: csforallTheme,
    },
    defaultTheme: 'code.org',
    Provider: ThemeProvider,
    GlobalStyles: CssBaseline,
  }),
];

const preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },

    a11y: {
      // 'todo' - show a11y violations in the test UI only
      // 'error' - fail CI on a11y violations
      // 'off' - skip a11y checks entirely
      test: 'error',

      options: {
        rules: {
          'color-contrast': {enabled: false},
        },
      },
    },
  },
};
export const loaders = document.fonts ? [fontLoader] : [];

export default preview;
