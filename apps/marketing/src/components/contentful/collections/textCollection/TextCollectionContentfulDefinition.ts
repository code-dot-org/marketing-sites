// Creates a definition for the TextCollection component to be used in Contentful Studio
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
