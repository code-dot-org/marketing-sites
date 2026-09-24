// Hour of AI only. Mirrors Unit Card: each field binds from an Activity entry.
import {ComponentDefinition} from '@contentful/experiences-sdk-react';

import {hourOfAiTextColorOptions} from '@/contentful/registration/hourofai/colorOptions';

import {ACTIVITY_CARD_DEFAULT_WIDTH} from './cardWidth';

type Variables = NonNullable<ComponentDefinition['variables']>;

// Dark and light Badge variants. Light Purple is left out: it renders the same
// as Light Blue on Hour of AI.
export const ACTIVITY_BADGE_COLOR_OPTIONS = [
  {value: 'purple', displayName: 'Dark Purple'},
  {value: 'pink', displayName: 'Pink'},
  {value: 'blue', displayName: 'Blue'},
  {value: 'black', displayName: 'Black'},
  {value: 'pinkLight', displayName: 'Light Pink'},
  {value: 'blueLight', displayName: 'Light Blue (default)'},
  {value: 'blackLight', displayName: 'Light Black'},
];

const toggle = (
  displayName: string,
  description: string,
): Variables[string] => ({
  displayName,
  description,
  type: 'Boolean',
  defaultValue: true,
  group: 'style',
});

// Shared with the Activity Carousel, which applies them to every card.
export const ACTIVITY_FIELD_TOGGLES: Variables = {
  showOrganization: toggle(
    'Show Organization',
    'When disabled, the organization is hidden.',
  ),
  showAges: toggle('Show Ages', 'When disabled, the ages are hidden.'),
  showTopics: toggle('Show Topics', 'When disabled, the topics are hidden.'),
  showActivityType: toggle(
    'Show Activity Type',
    'When disabled, the activity type is hidden.',
  ),
  showLength: toggle('Show Length', 'When disabled, the length is hidden.'),
  showTutorialLink: toggle(
    'Show Tutorial Link',
    'When disabled, the tutorial button is hidden.',
  ),
  showTeacherLink: toggle(
    'Show Teacher Resource Link',
    'When disabled, the teacher resource button is hidden.',
  ),
  organizationBadgeColor: {
    displayName: 'Organization Badge Color',
    type: 'Text',
    defaultValue: 'blueLight',
    group: 'style',
    validations: {in: ACTIVITY_BADGE_COLOR_OPTIONS},
  },
};

type BindingSources = NonNullable<
  NonNullable<Variables[string]['validations']>['bindingSourceType']
>;

const BINDING_SOURCES: Record<
  'Text' | 'Media' | 'Array' | 'Link',
  BindingSources
> = {
  Text: ['entry', 'manual'],
  Media: ['entry', 'asset', 'manual'],
  Array: ['entry'],
  Link: ['entry'],
};

const entryField = (
  displayName: string,
  type: keyof typeof BINDING_SOURCES,
  description?: string,
): Variables[string] => ({
  displayName,
  type,
  group: 'content',
  ...(description && {description}),
  validations: {bindingSourceType: BINDING_SOURCES[type]},
});

export const ActivityCardContentfulComponentDefinition: ComponentDefinition = {
  id: 'activityCard',
  name: 'Activity Card',
  category: '07: Activities',
  tooltip: {
    description:
      'A compact card for one activity: image, organization badge, title, description, ages, activity type, length, topics, and tutorial and teacher buttons. Bind fields from an Activity entry.',
  },
  // Adding an empty array here so no default style options show in the Design tab.
  builtInStyles: [],
  variables: {
    title: entryField('Title', 'Text'),
    organization: entryField('Organization', 'Text'),
    shortDescription: entryField('Short Description', 'Text'),
    ages: entryField('Ages', 'Array'),
    topics: entryField('Topics', 'Array', "Bind the Activity's Topic field."),
    activityType: entryField('Activity Type', 'Array'),
    length: entryField('Length', 'Array'),
    image: entryField('Image', 'Media'),
    tutorialLink: entryField(
      'Tutorial Link',
      'Link',
      "Bind the Activity's Primary Link field.",
    ),
    teacherLink: entryField(
      'Teacher Resource Link',
      'Link',
      "Bind the Activity's Secondary Link field.",
    ),
    tutorialId: entryField(
      'Tutorial ID',
      'Text',
      'Identifies the card in click analytics.',
    ),
    ...ACTIVITY_FIELD_TOGGLES,
    titleColor: {
      displayName: 'Title Color',
      type: 'Text',
      defaultValue: 'purpleDark',
      group: 'style',
      validations: {
        in: hourOfAiTextColorOptions('purpleDark', {largeText: true}),
      },
    },
    width: {
      displayName: 'Width',
      description:
        'Card width in px or %, e.g. 325px or 100%. Leave empty for auto.',
      type: 'Text',
      defaultValue: ACTIVITY_CARD_DEFAULT_WIDTH,
      group: 'style',
    },
  },
};
