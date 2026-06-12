// Creates a definition for the Simple List component to be used in Contentful Studio
import {ComponentDefinition} from '@contentful/experiences-sdk-react';

import {SIMPLE_LIST_DEFAULT_ICON} from '@code-dot-org/component-library/list';

import {componentSizeXSToLDefinition} from '@/components/common/definitions';

export const SimpleListContentfulComponentDefinition: ComponentDefinition = {
  id: 'simpleList',
  name: 'Simple List',
  category: '03: Content Building Blocks',
  thumbnailUrl:
    'https://contentful-images.code.org/90t6bu6vlf76/bkW5Mm9owpcZWnexKTRCq/0554f4990e4165ff8907f425bb501eee/component_list_thumbnail.png',
  tooltip: {
    description:
      'A structured collection of list items in bullet-point format. Supports a custom icon.',
    imageUrl:
      'https://contentful-images.code.org/90t6bu6vlf76/5DICYZJBAh8MrBQQhkP5AO/836b3e29d0a036c3af7115c097b3c62f/component_list_tooltip.png',
  },
  // Adding an empty array here so no default style options show in the Design tab.
  builtInStyles: [],
  children: false,
  variables: {
    manualList: {
      displayName: 'Manual List',
      type: 'Text',
      group: 'content',
      description: 'Separate list items with a line break.',
      validations: {
        bindingSourceType: ['manual'],
      },
    },
    items: {
      displayName: 'List Items',
      type: 'Array',
      group: 'content',
      description:
        'Bind a "List" content type entry that contains "List Item" entries. Ignored when Manual List has content.',
      validations: {
        bindingSourceType: ['entry'],
      },
    },
    size: componentSizeXSToLDefinition,
    weight: {
      displayName: 'Text weight',
      type: 'Text',
      group: 'style',
      defaultValue: 'normal',
      validations: {
        in: [
          {value: 'normal', displayName: 'Normal'},
          {value: 'bold', displayName: 'Bold'},
        ],
      },
    },
    iconName: {
      displayName: 'Icon name',
      type: 'Text',
      group: 'style',
      description:
        'Font Awesome icon name to be displayed next to each list item',
      defaultValue: SIMPLE_LIST_DEFAULT_ICON,
    },
    type: {
      displayName: 'Icon color',
      type: 'Text',
      group: 'style',
      defaultValue: 'primary',
      validations: {
        in: [
          {value: 'primary', displayName: 'Primary'},
          {value: 'black', displayName: 'Black'},
          {value: 'white', displayName: 'White'},
          {value: 'brand1', displayName: 'Brand 1'},
          {value: 'brand2', displayName: 'Brand 2'},
          {value: 'brand3', displayName: 'Brand 3'},
          {value: 'secondary', displayName: 'Secondary (legacy)'},
          {value: 'brand', displayName: 'Brand (legacy)'},
        ],
      },
    },
    textColor: {
      displayName: 'Text color',
      type: 'Text',
      group: 'style',
      description: 'Override the default text color for the list item labels.',
      validations: {
        in: [
          {value: 'primary', displayName: 'Primary'},
          {value: 'black', displayName: 'Black'},
          {value: 'white', displayName: 'White'},
          {value: 'brand1', displayName: 'Brand 1'},
          {value: 'brand2', displayName: 'Brand 2'},
          {value: 'brand3', displayName: 'Brand 3'},
        ],
      },
    },
  },
};
