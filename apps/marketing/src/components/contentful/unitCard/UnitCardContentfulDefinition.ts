// Creates a definition for the Unit Card component to be used in Contentful Studio
import {ComponentDefinition} from '@contentful/experiences-sdk-react';

export const UnitCardContentfulComponentDefinition: ComponentDefinition = {
  id: 'unitCard',
  name: 'Unit Card',
  category: '07: Curriculum',
  tooltip: {
    description:
      'A compact card for a curriculum unit: image, topic badges, title, description, grade band, duration, and an explore link. Bind fields from a Curriculum entry.',
  },
  // Adding an empty array here so no default style options show in the Design tab.
  builtInStyles: [],
  variables: {
    title: {
      displayName: 'Title',
      type: 'Text',
      group: 'content',
      validations: {
        bindingSourceType: ['entry', 'manual'],
      },
    },
    shortDescription: {
      displayName: 'Short Description',
      type: 'Text',
      group: 'content',
      validations: {
        bindingSourceType: ['entry', 'manual'],
      },
    },
    gradeBands: {
      displayName: 'Grade Bands',
      description:
        'Multiple bands are merged into one span, e.g. K-5 and 6-8 display as K-8.',
      type: 'Array',
      group: 'content',
      validations: {
        bindingSourceType: ['entry'],
      },
    },
    duration: {
      displayName: 'Duration',
      description: "Bind to the Curriculum entry's Length field.",
      type: 'Array',
      group: 'content',
      validations: {
        bindingSourceType: ['entry'],
      },
    },
    topics: {
      displayName: 'Topics',
      type: 'Array',
      group: 'content',
      validations: {
        bindingSourceType: ['entry'],
      },
    },
    image: {
      displayName: 'Image',
      type: 'Media',
      group: 'content',
      validations: {
        bindingSourceType: ['entry', 'asset', 'manual'],
      },
    },
    link: {
      displayName: 'Explore Link',
      type: 'Link',
      group: 'content',
      description: 'Accepts only the "Link" content type entry',
      validations: {
        bindingSourceType: ['entry'],
      },
    },
    showTopics: {
      displayName: 'Show Topics',
      description: 'When disabled, the topic badges row is hidden.',
      type: 'Boolean',
      defaultValue: true,
      group: 'style',
    },
    fullWidth: {
      displayName: 'Full Width',
      description:
        'When checked, the card grows to the width of its container instead of the standard card width.',
      type: 'Boolean',
      defaultValue: false,
      group: 'style',
    },
  },
};
