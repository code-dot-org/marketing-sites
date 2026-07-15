// Contentful Studio definition for the Custom Text component (spec 010).
//
// NOTE: The live `customText` content type has NOT been confirmed via
// Contentful MCP (not connected during planning). Before relying on this in
// production, confirm there is no id collision and that the field/validation
// shapes are valid, then have a human apply/approve the type and re-read the
// state (constitution Principle V, FR-016).

import {ComponentDefinition} from '@contentful/experiences-sdk-react';

import {brandTextColorOptions} from '@/components/common/colors';
import {removeMarginBottomDefinition} from '@/components/common/definitions';

export const CustomTextContentfulComponentDefinition: ComponentDefinition = {
  id: 'customText',
  name: 'Custom Text',
  category: '03: Content Building Blocks',
  thumbnailUrl:
    'https://contentful-images.code.org/90t6bu6vlf76/30ubXKEp07H0liw3w6jad/222daf47eb2d7f14dfef4e9711522217/component_overline_thumbnail.png',
  tooltip: {
    description:
      'A catch-all for non-heading, non-body text elements. Pick a type for instant defaults, then optionally override individual styles.',
    imageUrl:
      'https://contentful-images.code.org/90t6bu6vlf76/3kSwyMuHssbpZtr0hUAKyf/1f4d22b8e8bf3037bda3ff58d03ce293/component_heading_tooltip.png',
  },
  builtInStyles: ['cfTextAlign', 'cfMaxWidth'],
  variables: {
    type: {
      displayName: 'Type',
      type: 'Text',
      defaultValue: 'custom',
      group: 'style',
      validations: {
        in: [
          {value: 'custom', displayName: 'Custom'},
          {value: 'subtitle', displayName: 'Featured Subtitle'},
          {value: 'overline', displayName: 'Overline'},
          {value: 'statistic', displayName: 'Statistic'},
        ],
      },
    },
    children: {
      displayName: 'Content',
      type: 'Text',
      defaultValue: 'Custom text',
      group: 'content',
      validations: {
        bindingSourceType: ['entry', 'manual'],
      },
    },
    color: {
      displayName: 'Text color',
      type: 'Text',
      defaultValue: 'black',
      group: 'style',
      validations: {
        in: brandTextColorOptions('black'),
      },
    },
    font: {
      displayName: 'Font Family',
      type: 'Text',
      defaultValue: 'default',
      group: 'style',
      validations: {
        in: [
          {value: 'default', displayName: 'Default (from type)'},
          {value: 'text', displayName: 'Text (Geist)'},
          {value: 'display', displayName: 'Display (Space Grotesk)'},
        ],
      },
    },
    textSize: {
      displayName: 'Appearance',
      type: 'Text',
      defaultValue: 'default',
      group: 'style',
      validations: {
        in: [
          {value: 'default', displayName: 'Default (from type)'},
          {value: 'xs', displayName: 'XS'},
          {value: 'sm', displayName: 'SM'},
          {value: 'md', displayName: 'MD'},
          {value: 'lg', displayName: 'LG'},
          {value: 'xl', displayName: 'XL'},
          {value: '2xl', displayName: '2XL'},
          {value: '3xl', displayName: '3XL'},
          {value: '4xl', displayName: '4XL'},
        ],
      },
    },
    fontWeight: {
      displayName: 'Font weight',
      type: 'Text',
      defaultValue: 'default',
      group: 'style',
      validations: {
        in: [
          {value: 'default', displayName: 'Default (from type)'},
          {value: '400', displayName: 'Regular'},
          {value: '500', displayName: 'Medium'},
          {value: '600', displayName: 'Semibold'},
          {value: '700', displayName: 'Bold'},
        ],
      },
    },
    textTransform: {
      displayName: 'Transform case',
      type: 'Text',
      defaultValue: 'default',
      group: 'style',
      description:
        "'Default' inherits the type's casing (Overline is uppercase). 'None' forces no transform.",
      validations: {
        in: [
          {value: 'default', displayName: 'Default (from type)'},
          {value: 'none', displayName: 'None'},
          {value: 'uppercase', displayName: 'Uppercase'},
          {value: 'lowercase', displayName: 'Lowercase'},
          {value: 'capitalize', displayName: 'Capitalize'},
        ],
      },
    },
    removeMarginBottom: {...removeMarginBottomDefinition},
    // Advanced numeric overrides — grouped with the HTML tag override near the
    // bottom of the Design tab.
    fontSize: {
      displayName: 'Override · Text size',
      type: 'Number',
      group: 'style',
      description:
        'Font size in rem (e.g. 1.5). Overrides the Appearance size when set.',
    },
    lineHeight: {
      displayName: 'Override · Line height',
      type: 'Number',
      group: 'style',
      description:
        'Unitless line-height (e.g. 1.2). Overrides the Appearance line-height when set.',
    },
    iconNameLeft: {
      displayName: 'Left icon name',
      type: 'Text',
      group: 'content',
      description:
        'Font Awesome icon name shown before the text; inherits the text color. Takes precedence over the right icon.',
    },
    iconNameRight: {
      displayName: 'Right icon name',
      type: 'Text',
      group: 'content',
      description:
        'Font Awesome icon name shown after the text; inherits the text color. Ignored if a left icon is set.',
    },
    // HTML tag override is intentionally the LAST option in the Design tab.
    htmlTag: {
      displayName: 'HTML tag',
      type: 'Text',
      defaultValue: 'default',
      group: 'style',
      description:
        "Default uses the type's tag (span; p for Subtitle). Override to render the other element.",
      validations: {
        in: [
          {value: 'default', displayName: 'Default (from type)'},
          {value: 'span', displayName: '<span>'},
          {value: 'p', displayName: '<p>'},
        ],
      },
    },
  },
};
