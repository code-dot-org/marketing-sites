// Creates a definition for the TextCollection component to be used in Contentful Studio
import {ComponentDefinitionVariable} from '@contentful/experiences-core/types';
import {ComponentDefinition} from '@contentful/experiences-sdk-react';

import {collectionsSortOrderDefinition} from '@/components/common/definitions';

export const TextCollectionContentfulComponentDefinition: ComponentDefinition =
  {
    id: 'collection-text',
    name: 'Text Collection',
    category: '06: Dynamic Displays',
    tooltip: {
      description: 'Showcase a list of text items from a content collection.',
    },
    // Adding an empty array here so no default style options show in the Design tab.
    builtInStyles: [],
    children: false,
    variables: {
      textCollection: {
        displayName: 'Text Collection',
        type: 'Array',
        validations: {
          required: true,
          bindingSourceType: ['entry'],
        },
      },
      ...collectionsSortOrderDefinition,
    },
  };

// Hour of AI only for now; set per viewport in Studio's Design tab.
export const textCollectionColumnsDefinition: Record<
  string,
  ComponentDefinitionVariable
> = {
  columns: {
    displayName: 'Columns',
    type: 'Text',
    group: 'style',
    description:
      'Smaller viewports use this value too unless you set them separately.',
    defaultValue: 'default',
    validations: {
      in: [
        {value: 'default', displayName: 'Default (3, 1 on mobile)'},
        {value: '1', displayName: '1'},
        {value: '2', displayName: '2'},
        {value: '3', displayName: '3'},
        {value: '4', displayName: '4'},
        {value: '5', displayName: '5'},
        {value: '6', displayName: '6'},
      ],
    },
  },
};
