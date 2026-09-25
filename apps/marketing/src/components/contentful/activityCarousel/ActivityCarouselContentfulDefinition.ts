// Hour of AI only. Mirrors Unit Carousel, with a List entry's Activity items.
import {ComponentDefinition} from '@contentful/experiences-sdk-react';

import {
  ACTIVITY_FIELD_TOGGLES,
  ActivityCardContentfulComponentDefinition,
} from '@/components/contentful/activityCard/ActivityCardContentfulDefinition';
import {hourOfAiTextColorOptions} from '@/contentful/registration/hourofai/colorOptions';

export const ActivityCarouselContentfulComponentDefinition: ComponentDefinition =
  {
    id: 'activityCarousel',
    name: 'Activity Carousel',
    category: '07: Activities',
    tooltip: {
      description:
        'A horizontally scrolling row of Activity Cards with arrow navigation. Bind a List entry of Activities.',
    },
    // Adding an empty array here so no default style options show in the Design tab.
    builtInStyles: [],
    children: false,
    variables: {
      activities: {
        displayName: 'Activities',
        description:
          "Bind a List entry's Items In This List field (Activity entries).",
        type: 'Array',
        group: 'content',
        validations: {
          required: true,
          bindingSourceType: ['entry'],
        },
      },
      cardWidth: {
        ...ActivityCardContentfulComponentDefinition.variables.width,
        displayName: 'Card Width',
        description:
          'Width of every card in px or %, e.g. 325px. Leave empty for auto.',
      },
      ...ACTIVITY_FIELD_TOGGLES,
      tutorialLinkTextOverride: {
        displayName: 'Tutorial Link Text Override',
        description:
          "Overrides every card's tutorial link label; leave empty to use the entry labels.",
        type: 'Text',
        group: 'style',
      },
      teacherLinkTextOverride: {
        displayName: 'Teacher Resource Link Text Override',
        description:
          "Overrides every card's teacher resource link label; leave empty to use the entry labels.",
        type: 'Text',
        group: 'style',
      },
      activityTitleColor: {
        displayName: 'Activity Title Color',
        description: 'Applied to the activity title on every card.',
        type: 'Text',
        defaultValue: 'purpleDark',
        group: 'style',
        validations: {
          in: hourOfAiTextColorOptions('purpleDark', {largeText: true}),
        },
      },
    },
  };
