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
      defaultValue: 'text-md',
      group: 'style',
      // Spec 009 amendment-4 — narrowed to the 8 Text-scale cells with
      // text-md (default) first. Legacy `body-*` stored values continue
      // to render via the auto-map in resolveParagraphStyles.ts; they
      // just no longer appear in the Studio dropdown. Matches the
      // narrowing precedent set by spec 008 (Brand Text Link color enum).
      validations: {
        in: [
          {value: 'text-md', displayName: 'Text md (default)'},
          {value: 'text-4xl', displayName: 'Text 4xl'},
          {value: 'text-3xl', displayName: 'Text 3xl'},
          {value: 'text-2xl', displayName: 'Text 2xl'},
          {value: 'text-xl', displayName: 'Text xl'},
          {value: 'text-lg', displayName: 'Text lg'},
          {value: 'text-sm', displayName: 'Text sm'},
          {value: 'text-xs', displayName: 'Text xs'},
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
