import {ComponentDefinitionVariable} from '@contentful/experiences-core/types';

export const componentSizeXSToLDefinition: ComponentDefinitionVariable = {
  displayName: 'Size',
  type: 'Text',
  group: 'style',
  defaultValue: 'm',
  validations: {
    in: [
      {value: 'l', displayName: 'Large'},
      {value: 'm', displayName: 'Medium'},
      {value: 's', displayName: 'Small'},
      {value: 'xs', displayName: 'Extra Small'},
    ],
  },
};

export const marginBottomNoneToMDefinition = {
  displayName: 'Margin bottom',
  type: 'Text',
  defaultValue: 'xs',
  group: 'style',
  validations: {
    in: [
      {value: 'none', displayName: 'None'},
      {value: 'xs', displayName: 'Extra Small'},
      {value: 's', displayName: 'Small'},
      {value: 'm', displayName: 'Medium'},
    ],
  },
};

export const removeMarginBottomDefinition: ComponentDefinitionVariable = {
  displayName: 'Remove margin bottom?',
  type: 'Boolean',
  defaultValue: false,
  group: 'style',
};

export const videoRelatedDefinitions: Record<
  string,
  ComponentDefinitionVariable
> = {
  blockVideoTitle: {
    displayName: 'Video title',
    type: 'Text',
    group: 'content',
    description:
      'The title of the video. This will double as the caption under the video player.',
    validations: {
      bindingSourceType: ['entry', 'manual'],
    },
  },
  blockVideoYouTubeId: {
    displayName: 'Video YouTube ID',
    type: 'Text',
    group: 'content',
    description:
      'The YouTube ID of the video. This is the unique identifier for the video on YouTube.',
    validations: {
      bindingSourceType: ['entry', 'manual'],
    },
  },
  blockVideoFallback: {
    displayName: 'Video fallback',
    type: 'Text',
    group: 'content',
    description:
      'This is the URL of the video that will be used in place of the YouTube video if YouTube is blocked.',
    validations: {
      bindingSourceType: ['entry', 'manual'],
    },
  },
  blockVideoShowCaption: {
    displayName: 'Show video caption',
    type: 'Boolean',
    defaultValue: true,
    group: 'style',
    description:
      'Check this to show a caption (video title) under the video player.',
  },
};
