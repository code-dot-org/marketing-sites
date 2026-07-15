// Creates a definition for the Icon component to be used in Contentful Studio
import {ComponentDefinition} from '@contentful/experiences-sdk-react';

import {brandColorOptionsWithDefault} from '@/components/common/colors';
import {removeMarginBottomDefinition} from '@/components/common/definitions';

// Universal brand-color options in canonical manifest order; default is
// `purplePrimary` (matches Divider). Legacy `primary` is filtered out — Icon
// doesn't carry legacy values.
const ICON_GLYPH_COLOR_OPTIONS = brandColorOptionsWithDefault(
  'purplePrimary',
).filter(({value}) => value !== 'primary');

// Background color list: universal brand options with Gray 1 as the default.
// Legacy `primary` filtered out — Icon doesn't carry legacy values.
const ICON_BACKGROUND_COLOR_OPTIONS = brandColorOptionsWithDefault(
  'gray1',
).filter(({value}) => value !== 'primary');

export const IconContentfulComponentDefinition: ComponentDefinition = {
  id: 'icon',
  name: 'Icon',
  category: '03: Content Building Blocks',
  thumbnailUrl:
    'https://contentful-images.code.org/90t6bu6vlf76/7DncC3ARfnKQmQWytayrZA/dd718f899ba91bc3fd86dd8b930d8855/component_icon_thumbnail.png',
  // Adding an empty array here so no default style options show in the Design tab.
  builtInStyles: [],
  children: false,
  tooltip: {
    description:
      'A single Font Awesome icon with optional colored background shape.',
  },
  variables: {
    iconName: {
      displayName: 'Icon name',
      type: 'Text',
      group: 'style',
      description: 'Font Awesome icon name',
      defaultValue: 'lightbulb',
      validations: {
        required: true,
      },
    },
    iconSize: {
      displayName: 'Icon size (px)',
      type: 'Number',
      group: 'style',
      defaultValue: 24,
    },
    color: {
      displayName: 'Color',
      type: 'Text',
      group: 'style',
      defaultValue: 'purplePrimary',
      validations: {
        in: ICON_GLYPH_COLOR_OPTIONS,
      },
    },
    backgroundFill: {
      displayName: 'Background fill',
      type: 'Text',
      group: 'style',
      defaultValue: 'none',
      validations: {
        in: [
          {value: 'none', displayName: 'None (default)'},
          {value: 'filled', displayName: 'Filled'},
          {value: 'outline', displayName: 'Outline'},
        ],
      },
    },
    backgroundShape: {
      displayName: 'Background shape',
      type: 'Text',
      group: 'style',
      defaultValue: 'circle',
      validations: {
        in: [
          {value: 'circle', displayName: 'Circle (default)'},
          {value: 'square', displayName: 'Square (rounded)'},
        ],
      },
    },
    backgroundColor: {
      displayName: 'Background color',
      type: 'Text',
      group: 'style',
      defaultValue: 'gray1',
      validations: {
        in: ICON_BACKGROUND_COLOR_OPTIONS,
      },
    },
    removeMarginBottom: {...removeMarginBottomDefinition},
  },
};
