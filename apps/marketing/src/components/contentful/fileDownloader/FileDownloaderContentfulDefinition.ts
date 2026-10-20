import {ComponentDefinition} from '@contentful/experiences-sdk-react';

import {
  FILE_DOWNLOADER_COLOR_OPTIONS,
  FILE_DOWNLOADER_DEFAULTS,
  FILE_DOWNLOADER_VARIANT_OPTIONS,
} from './constants';

export const FileDownloaderContentfulComponentDefinition: ComponentDefinition =
  {
    id: 'fileDownloader',
    name: 'File Downloader',
    category: '08: Advanced',
    tooltip: {
      description:
        'A dropdown of files; choosing one downloads it. Bind a List of File Download entries. Fills its container, so set the width on the container.',
    },
    builtInStyles: [],
    children: false,
    variables: {
      files: {
        displayName: 'Files',
        description:
          "Bind a List entry's items. Only File Download entries are shown, in list order.",
        type: 'Array',
        group: 'content',
        validations: {
          required: true,
          bindingSourceType: ['entry'],
        },
      },
      placeholder: {
        displayName: 'Placeholder',
        description: 'Dropdown label, e.g. "Select report".',
        type: 'Text',
        defaultValue: FILE_DOWNLOADER_DEFAULTS.placeholder,
        group: 'content',
        validations: {
          bindingSourceType: ['manual', 'entry'],
        },
      },
      color: {
        displayName: 'Color',
        type: 'Text',
        defaultValue: FILE_DOWNLOADER_DEFAULTS.color,
        group: 'style',
        validations: {
          in: [...FILE_DOWNLOADER_COLOR_OPTIONS],
        },
      },
      // Not `style`, which would collide with React's style prop.
      variant: {
        displayName: 'Style',
        description:
          'Light and Dark match the Badge colors; Secondary is outlined like the secondary button.',
        type: 'Text',
        defaultValue: FILE_DOWNLOADER_DEFAULTS.variant,
        group: 'style',
        validations: {
          in: [...FILE_DOWNLOADER_VARIANT_OPTIONS],
        },
      },
    },
  };
