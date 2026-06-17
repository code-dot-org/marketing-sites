// Creates a definition for the Typography component to be used in Contentful Studio
import {ComponentDefinition} from '@contentful/experiences-sdk-react';

import {brandColorOptionsWithDefault} from '@/components/common/colors';
import {removeMarginBottomDefinition} from '@/components/common/definitions';

export const HeadingContentfulComponentDefinition: ComponentDefinition = {
  id: 'heading',
  name: 'Heading',
  category: '03: Content Building Blocks',
  thumbnailUrl:
    'https://contentful-images.code.org/90t6bu6vlf76/LHRmOBd4IWYZuWScbJG3i/0442e38966e91c0e2aca88fdb2b217ad/component_divider_thumbnail.png',
  tooltip: {
    description:
      'Use a heading to introduce a section or key content. Choose from different levels to maintain a clear content hierarchy.',
    imageUrl:
      'https://contentful-images.code.org/90t6bu6vlf76/3kSwyMuHssbpZtr0hUAKyf/1f4d22b8e8bf3037bda3ff58d03ce293/component_heading_tooltip.png',
  },
  builtInStyles: ['cfTextAlign', 'cfMaxWidth'],
  variables: {
    visualAppearance: {
      displayName: 'Heading Level',
      type: 'Text',
      defaultValue: 'heading-xl',
      group: 'style',
      validations: {
        in: [
          {value: 'heading-xxl', displayName: 'Heading 1'},
          {value: 'heading-xl', displayName: 'Heading 2'},
          {value: 'heading-lg', displayName: 'Heading 3'},
          {value: 'heading-md', displayName: 'Heading 4'},
          {value: 'heading-sm', displayName: 'Heading 5'},
          {value: 'heading-xs', displayName: 'Heading 6'},
        ],
      },
    },
    color: {
      displayName: 'Color',
      type: 'Text',
      defaultValue: 'black',
      group: 'style',
      validations: {
        in: brandColorOptionsWithDefault('black'),
      },
    },
    textTransform: {
      displayName: 'Transform Case',
      type: 'Text',
      defaultValue: 'none',
      group: 'style',
      validations: {
        in: [
          {value: 'none', displayName: 'None'},
          {value: 'uppercase', displayName: 'Uppercase'},
          {value: 'lowercase', displayName: 'Lowercase'},
          {value: 'capitalize', displayName: 'Capitalize'},
        ],
      },
    },
    removeMarginBottom: {...removeMarginBottomDefinition},
    children: {
      displayName: 'Content',
      type: 'Text',
      defaultValue: 'Heading',
      group: 'content',
      validations: {
        bindingSourceType: ['entry', 'manual'],
      },
    },
    fontSize: {
      displayName: 'Override · Font size (rem)',
      type: 'Number',
      group: 'style',
      description:
        'Override the font size in rem. Leave blank for the responsive default.',
    },
    lineHeight: {
      displayName: 'Override · Line height',
      type: 'Number',
      group: 'style',
      description: 'Unitless line-height override. Default is 1.0.',
    },
    fontWeight: {
      displayName: 'Override · Font weight',
      type: 'Text',
      defaultValue: '500',
      group: 'style',
      description: 'Default is Medium.',
      validations: {
        in: [
          {value: '500', displayName: 'Medium'},
          {value: '700', displayName: 'Bold'},
        ],
      },
    },
    colorOverride: {
      displayName: 'Override · Color (hex)',
      type: 'Text',
      group: 'style',
      description:
        'Hex color (e.g. #1F1976). Overrides the Color selection above.',
    },
    fontKerning: {
      displayName: 'Override · Font kerning',
      type: 'Text',
      defaultValue: 'normal',
      group: 'style',
      description: 'Default is Normal.',
      validations: {
        in: [
          {value: 'normal', displayName: 'Normal'},
          {value: 'auto', displayName: 'Auto'},
          {value: 'none', displayName: 'None (off)'},
        ],
      },
    },
  },
};
