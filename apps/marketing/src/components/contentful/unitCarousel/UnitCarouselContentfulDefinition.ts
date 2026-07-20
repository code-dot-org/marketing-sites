// Creates a definition for the Unit Carousel component to be used in Contentful Studio
import {ComponentDefinition} from '@contentful/experiences-sdk-react';

import {CARD_BADGE_COLOR_OPTIONS} from '@/components/contentful/badge/constants';

export const UnitCarouselContentfulComponentDefinition: ComponentDefinition = {
  id: 'unitCarousel',
  name: 'Unit Carousel',
  category: '07: Curriculum',
  tooltip: {
    description:
      'A horizontally scrolling row of Unit Cards for one course: course title, details link, unit count and grade summary, with arrow navigation. Bind fields from a Course entry.',
  },
  // Adding an empty array here so no default style options show in the Design tab.
  builtInStyles: [],
  children: false,
  variables: {
    title: {
      displayName: 'Course Title',
      type: 'Text',
      group: 'content',
      validations: {
        bindingSourceType: ['entry', 'manual'],
      },
    },
    courseDetailsLink: {
      displayName: 'Course Details Link',
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
        'Merged into one span in the subtitle, e.g. 9-10 and 11-12 display as Grades 9-12.',
      type: 'Array',
      group: 'content',
      validations: {
        bindingSourceType: ['entry'],
      },
    },
    units: {
      displayName: 'Units',
      description: "Bind the Course entry's Units field (Curriculum entries).",
      type: 'Array',
      group: 'content',
      validations: {
        required: true,
        bindingSourceType: ['entry'],
      },
    },
    showUnitCount: {
      displayName: 'Show Unit Count',
      description: 'When disabled, the unit count is hidden in the subtitle.',
      type: 'Boolean',
      defaultValue: true,
      group: 'style',
    },
    showTopics: {
      displayName: 'Show Topics',
      description: 'When disabled, topic badges are hidden on every card.',
      type: 'Boolean',
      defaultValue: true,
      group: 'style',
    },
    topicBadgeColor: {
      displayName: 'Topic Badge Color',
      description: 'Applied to every topic badge on every card.',
      type: 'Text',
      defaultValue: 'purple',
      group: 'style',
      validations: {
        in: CARD_BADGE_COLOR_OPTIONS,
      },
    },
    linkTextOverride: {
      displayName: 'Link Text Override',
      description:
        "Overrides every card's Link entry label; clear to use the entry labels.",
      type: 'Text',
      defaultValue: 'Explore',
      group: 'style',
    },
    unitTitleColor: {
      displayName: 'Unit Title Color',
      description: 'Applied to the unit title on every card.',
      type: 'Text',
      defaultValue: 'black',
      group: 'style',
      validations: {
        in: [
          {value: 'black', displayName: 'Black'},
          {value: 'purple', displayName: 'Purple'},
          {value: 'blue', displayName: 'Blue'},
          {value: 'green', displayName: 'Green'},
          {value: 'orange', displayName: 'Orange'},
          {value: 'pink', displayName: 'Pink'},
        ],
      },
    },
    headingColor: {
      displayName: 'Heading Color',
      description: 'Applied to the course title heading.',
      type: 'Text',
      defaultValue: 'black',
      group: 'style',
      validations: {
        in: [
          {value: 'black', displayName: 'Black'},
          {value: 'purple', displayName: 'Purple'},
          {value: 'blue', displayName: 'Blue'},
          {value: 'green', displayName: 'Green'},
          {value: 'orange', displayName: 'Orange'},
          {value: 'pink', displayName: 'Pink'},
        ],
      },
    },
  },
};
