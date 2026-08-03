// Creates a definition for the Catalog Interstitial component to be used in Contentful Studio
import {ComponentDefinition} from '@contentful/experiences-sdk-react';

export const CatalogInterstitialContentfulComponentDefinition: ComponentDefinition =
  {
    id: 'catalogInterstitial',
    name: 'Catalog Interstitial',
    category: '07: Curriculum',
    tooltip: {
      description:
        'Drop inside a Course Catalog and build any content within it. The content appears after the Nth visible course section, moving to the end when fewer sections are shown.',
    },
    // Adding an empty array here so no default style options show in the Design tab.
    builtInStyles: [],
    children: true,
    variables: {
      position: {
        displayName: 'Position',
        description:
          'Appears after this many visible course sections. 1 = after the first course.',
        type: 'Number',
        defaultValue: 1,
        group: 'style',
        validations: {
          bindingSourceType: ['manual'],
        },
      },
    },
  };
