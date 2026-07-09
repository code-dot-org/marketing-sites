// Creates a definition for the Course Catalog component to be used in Contentful Studio
import {ComponentDefinition} from '@contentful/experiences-sdk-react';

export const CourseCatalogContentfulComponentDefinition: ComponentDefinition = {
  id: 'courseCatalog',
  name: 'Course Catalog',
  category: '07: Curriculum',
  tooltip: {
    description:
      'Stacked Unit Carousels for multiple courses with a grade-band filter bar. Bind Course entries; drop Catalog Interstitial components inside to weave content between course sections.',
  },
  // Adding an empty array here so no default style options show in the Design tab.
  builtInStyles: [],
  children: true,
  variables: {
    courses: {
      displayName: 'Courses',
      description: 'Bind an array of "Course" content type entries.',
      type: 'Array',
      group: 'content',
      validations: {
        required: true,
        bindingSourceType: ['entry'],
      },
    },
    showUnitCount: {
      displayName: 'Show Unit Count',
      description:
        'When disabled, the unit count is hidden in every carousel subtitle.',
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
