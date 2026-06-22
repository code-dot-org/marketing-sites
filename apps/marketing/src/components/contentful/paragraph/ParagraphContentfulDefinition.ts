// Creates a definition for the Typography component to be used in Contentful Studio
import {ComponentDefinition} from '@contentful/experiences-sdk-react';

import {
  brandTextColorOptions,
  LEGACY_PARAGRAPH_COLOR_OPTIONS,
} from '@/components/common/colors';
import {removeMarginBottomDefinition} from '@/components/common/definitions';

export const ParagraphContentfulComponentDefinition: ComponentDefinition = {
  id: 'paragraph',
  name: 'Paragraph',
  category: '03: Content Building Blocks',
  thumbnailUrl:
    'https://contentful-images.code.org/90t6bu6vlf76/5hP7jqXdP90BtLxMi6FSWm/09a555420c3313133d16e87a84e22826/component_paragraph_thumbnail.png',
  tooltip: {
    description:
      'Use a paragraph for body text and longer descriptions. Supports rich text formatting for emphasis, links, and structure.',
    imageUrl:
      'https://contentful-images.code.org/90t6bu6vlf76/5qoQl0G7ZKxKCI8VYBaCzl/19a21cd2fbb6b037c397fcbc417f70b1/component_paragraph_tooltip.png',
  },
  builtInStyles: ['cfTextAlign', 'cfMaxWidth'],
  variables: {
    visualAppearance: {
      displayName: 'Visual Appearance',
      type: 'Text',
      defaultValue: 'body-two',
      group: 'style',
      validations: {
        in: [
          {value: 'body-one', displayName: 'Body L'},
          {value: 'body-two', displayName: 'Body M'},
          {value: 'body-three', displayName: 'Body S'},
          {value: 'body-four', displayName: 'Body XS'},
        ],
      },
    },
    color: {
      displayName: 'Color',
      type: 'Text',
      defaultValue: 'black',
      group: 'style',
      validations: {
        in: [
          ...brandTextColorOptions('black'),
          ...LEGACY_PARAGRAPH_COLOR_OPTIONS,
        ],
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
    colorOverride: {
      displayName: 'Override · Color (hex)',
      type: 'Text',
      group: 'style',
      description:
        'Hex color (e.g. #1F1976). Overrides the Color selection above.',
    },
    removeMarginBottom: {...removeMarginBottomDefinition},
    isStrong: {
      displayName: 'Make this paragraph bold',
      type: 'Boolean',
      defaultValue: false,
      group: 'style',
    },
    isItalic: {
      displayName: 'Make this paragraph italic',
      type: 'Boolean',
      defaultValue: false,
      group: 'style',
    },
    children: {
      displayName: 'Content',
      type: 'Text',
      defaultValue: 'Paragraph',
      group: 'content',
      description: 'The text or other elements to display inside the paragraph',
      validations: {
        bindingSourceType: ['entry', 'manual'],
      },
    },
  },
};
