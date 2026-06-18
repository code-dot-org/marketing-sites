// Creates a definition for the Icon component to be used in Contentful Studio
import {ComponentDefinition} from '@contentful/experiences-sdk-react';

import {brandColorOptionsWithDefault} from '@/components/common/colors';

import {ICON_LIGHT_GREY} from './Icon';

// 22 universal brand-color options in canonical manifest order; default is
// `purplePrimary` (matches Divider). No legacy filter — Icon doesn't carry
// legacy values.
const ICON_GLYPH_COLOR_OPTIONS = brandColorOptionsWithDefault('purplePrimary');

// Background color list: Icon-local Light Grey default, then the 22 universal
// brand options. Light Grey lives only on this dropdown.
const ICON_BACKGROUND_COLOR_OPTIONS = [
  {value: ICON_LIGHT_GREY, displayName: 'Light Grey (default)'},
  ...brandColorOptionsWithDefault('purplePrimary').map(
    ({value, displayName}) => ({
      value,
      // Strip the "(default)" annotation off the brand list — Light Grey is the
      // default on this field, not purplePrimary.
      displayName: displayName.replace(/ \(default\)$/, ''),
    }),
  ),
];

export const IconContentfulComponentDefinition: ComponentDefinition = {
  id: 'icon',
  name: 'Icon',
  category: '03: Content Building Blocks',
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
      defaultValue: 32,
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
      defaultValue: ICON_LIGHT_GREY,
      validations: {
        in: ICON_BACKGROUND_COLOR_OPTIONS,
      },
    },
  },
};
