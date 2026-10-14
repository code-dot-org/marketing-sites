// Creates a definition for the Unit Card component to be used in Contentful Studio
import {ComponentDefinition} from '@contentful/experiences-sdk-react';

import {HEADING_LEVEL_OPTIONS, UNIT_CARD_TYPE_OPTIONS} from './constants';

export const UnitCardContentfulComponentDefinition: ComponentDefinition = {
  // Stored in every experience's component tree; renaming it would break
  // existing pages. Only the display name changed to Curriculum Card.
  id: 'unitCard',
  name: 'Curriculum Card',
  category: '07: Curriculum',
  tooltip: {
    description:
      'A compact card for a curriculum unit or course: image, grade band, title, description, topics, duration, and a link. Bind fields from a Curriculum or Course entry.',
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
      displayName: 'Description',
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
      description:
        'Bind the Curriculum or Course entry\'s Duration field. Shows "Flexible duration" when none or more than one is selected.',
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
      displayName: 'Link',
      type: 'Link',
      group: 'content',
      description: 'Accepts only the "Link" content type entry',
      validations: {
        bindingSourceType: ['entry'],
      },
    },
    cardType: {
      displayName: 'Card Type',
      description: 'Unit for Curriculum entries, Course for Course entries.',
      type: 'Text',
      defaultValue: 'unit',
      group: 'style',
      validations: {
        in: UNIT_CARD_TYPE_OPTIONS,
      },
    },
    showTopics: {
      displayName: 'Show Topics',
      description: 'When disabled, the topics line is hidden.',
      type: 'Boolean',
      defaultValue: true,
      group: 'style',
    },
    titleHeadingLevel: {
      displayName: 'Title Heading Level',
      description:
        'Semantic level for the title, one below the heading it sits under. Does not change its size.',
      type: 'Text',
      defaultValue: 'h4',
      group: 'style',
      validations: {
        in: HEADING_LEVEL_OPTIONS,
      },
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
