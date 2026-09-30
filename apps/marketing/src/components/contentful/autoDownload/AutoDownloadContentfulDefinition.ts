import {ComponentDefinition} from '@contentful/experiences-sdk-react';

export const AUTO_DOWNLOAD_DEFAULTS = {
  message: 'Your download should start automatically.',
  linkText: "If it doesn't, download the file here.",
  failMessage: "The download didn't start automatically.",
} as const;

export const AutoDownloadContentfulComponentDefinition: ComponentDefinition = {
  id: 'autoDownload',
  name: 'Auto Download',
  category: '08: Advanced',
  thumbnailUrl:
    'https://contentful-images.code.org/90t6bu6vlf76/2CPKrKCB3KxD1n6wG9JTn9/aab22373a39e9cc5305b21c08bba588d/component_link_thumbnail.png',
  tooltip: {
    description:
      'Starts downloading the chosen file when the page loads, with a fallback link. Use one per page and mark the page noindex in its SEO settings.',
  },
  variables: {
    file: {
      displayName: 'File',
      type: 'Media',
      group: 'content',
      description: 'The file visitors download, for example a PDF.',
      validations: {
        bindingSourceType: ['asset'],
      },
    },
    message: {
      displayName: 'Message',
      type: 'Text',
      defaultValue: AUTO_DOWNLOAD_DEFAULTS.message,
      group: 'content',
      validations: {
        bindingSourceType: ['manual', 'entry'],
      },
    },
    linkText: {
      displayName: 'Link text',
      type: 'Text',
      defaultValue: AUTO_DOWNLOAD_DEFAULTS.linkText,
      group: 'content',
      validations: {
        bindingSourceType: ['manual', 'entry'],
      },
    },
    analyticsParameters: {
      displayName: 'Analytics parameters',
      type: 'Text',
      group: 'content',
      description:
        'Optional. Extra GA4 parameters sent with the download event, as name=value pairs separated by commas (e.g. download_campaign=springplcourse). Each name must be registered as a custom dimension in GA. Short labels only; no personal data.',
      validations: {
        bindingSourceType: ['manual'],
      },
    },
    failMessage: {
      displayName: 'Message if the download fails',
      type: 'Text',
      defaultValue: AUTO_DOWNLOAD_DEFAULTS.failMessage,
      group: 'content',
      validations: {
        bindingSourceType: ['manual', 'entry'],
      },
    },
  },
};
