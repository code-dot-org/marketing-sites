// Creates a definition for the Unit Carousel component to be used in Contentful Studio
import {ComponentDefinition} from '@contentful/experiences-sdk-react';

import {brandTextColorOptions} from '@/components/common/colors';
import {
  HEADING_LEVEL_OPTIONS,
  UNIT_CARD_TYPE_OPTIONS,
} from '@/components/contentful/unitCard/constants';

export const UnitCarouselContentfulComponentDefinition: ComponentDefinition = {
  // Stored in every experience's component tree; renaming it would break
  // existing pages. Only the display name changed to Curriculum Carousel.
  id: 'unitCarousel',
  name: 'Curriculum Carousel',
  category: '07: Curriculum',
  tooltip: {
    description:
      'A horizontally scrolling row of Curriculum Cards with a title, details link, count and grade summary, and arrow navigation. Unit: bind a Course entry. Course: bind a Course Catalog entry.',
  },
  // Adding an empty array here so no default style options show in the Design tab.
  builtInStyles: [],
  children: false,
  variables: {
    title: {
      displayName: 'Title',
      type: 'Text',
      group: 'content',
      validations: {
        bindingSourceType: ['entry', 'manual'],
      },
    },
    courseDescription: {
      displayName: 'Description',
      description:
        'Shown as a paragraph in the header, below the unit count and grade summary.',
      type: 'Text',
      group: 'content',
      validations: {
        bindingSourceType: ['entry', 'manual'],
      },
    },
    courseDetailsLink: {
      displayName: 'Details Link',
      description: 'Accepts only the "Link" content type entry',
      type: 'Link',
      group: 'content',
      validations: {
        bindingSourceType: ['entry'],
      },
    },
    gradeBands: {
      displayName: 'Grade Bands',
      description:
        'Merged into one span in the subtitle, e.g. 9-10 and 11-12 display as Grades 9-12. Unit card type only.',
      type: 'Array',
      group: 'content',
      validations: {
        bindingSourceType: ['entry'],
      },
    },
    units: {
      displayName: 'Units or Courses',
      description:
        "Unit: bind a Course entry's Units field. Course: bind a Course Catalog entry's Courses field.",
      type: 'Array',
      group: 'content',
      validations: {
        required: true,
        bindingSourceType: ['entry'],
      },
    },
    cardType: {
      displayName: 'Card Type',
      description:
        'Unit cards from Curriculum entries, or Course cards from Course entries.',
      type: 'Text',
      defaultValue: 'unit',
      group: 'style',
      validations: {
        in: UNIT_CARD_TYPE_OPTIONS,
      },
    },
    showUnitCount: {
      displayName: 'Show Count',
      description:
        'When disabled, the unit or course count is hidden in the subtitle.',
      type: 'Boolean',
      defaultValue: true,
      group: 'style',
    },
    showTopics: {
      displayName: 'Show Topics',
      description: 'When disabled, the topics line is hidden on every card.',
      type: 'Boolean',
      defaultValue: true,
      group: 'style',
    },
    linkTextOverride: {
      displayName: 'Link Text Override',
      description:
        "Overrides every card's Link entry label; clear to use the entry labels.",
      type: 'Text',
      defaultValue: 'Explore',
      group: 'style',
    },
    headingLevel: {
      displayName: 'Heading Level',
      description:
        'Semantic level for the carousel title, one below the heading it sits under. Does not change its size.',
      type: 'Text',
      defaultValue: 'h3',
      group: 'style',
      validations: {
        in: HEADING_LEVEL_OPTIONS,
      },
    },
    cardTitleHeadingLevel: {
      displayName: 'Card Title Heading Level',
      description:
        'Semantic level for every card title, usually one below the Heading Level. Does not change their size.',
      type: 'Text',
      defaultValue: 'h4',
      group: 'style',
      validations: {
        in: HEADING_LEVEL_OPTIONS,
      },
    },
    headingColor: {
      displayName: 'Heading Color',
      description: 'Applied to the carousel title heading.',
      type: 'Text',
      defaultValue: 'black',
      group: 'style',
      validations: {
        in: brandTextColorOptions('black'),
      },
    },
  },
};
