// Creates a definition for the Divider component to be used in Contentful Studio
import {ComponentDefinition} from '@contentful/experiences-sdk-react';

import {brandColorOptionsWithDefault} from '@/components/common/colors';

// Brand options for the Divider dropdown. `primary` and `white` are filtered
// out because their value strings collide with the legacy Divider color
// values (also `primary` and `white`), which render via the existing
// class-based theme overrides. Authors who want a white divider should pick
// the "White (legacy)" option at the bottom of the list.
const DIVIDER_BRAND_OPTIONS = brandColorOptionsWithDefault(
  'purplePrimary',
).filter(opt => opt.value !== 'primary' && opt.value !== 'white');

export const DividerContentfulComponentDefinition: ComponentDefinition = {
  id: 'divider',
  name: 'Divider',
  category: '02: Page Structure',
  // Adding an empty array here so no default style options show in the Design tab.
  builtInStyles: [],
  thumbnailUrl:
    'https://contentful-images.code.org/90t6bu6vlf76/6UpajalIAQ0bHw17sZky2Y/6c93c9859576d981676325338e844075/component_divider_thumbnail.png',
  tooltip: {
    description:
      'Use a divider to visually separate content sections. It spans the full width and helps improve readability and layout structure.',
    imageUrl:
      'https://contentful-images.code.org/90t6bu6vlf76/3gRz7bA5miAVaFwJqM6w18/075ca1479e4c79c3969e3cb4a87a9992/component_divider_tooltip.png',
  },
  variables: {
    color: {
      displayName: 'Color',
      type: 'Text',
      defaultValue: 'purplePrimary',
      group: 'style',
      validations: {
        in: [
          ...DIVIDER_BRAND_OPTIONS,
          // Legacy Divider colors — render via the existing
          // `.divider--color-{value}` CSS classes. Kept at the bottom of the
          // list so existing Contentful entries continue to validate.
          // `strong` displays as "Secondary (legacy)" — the stored value
          // remains `strong` so existing usage on Code.org keeps working.
          {value: 'primary', displayName: 'Primary (legacy)'},
          {value: 'strong', displayName: 'Secondary (legacy)'},
          {value: 'white', displayName: 'White (legacy)'},
        ],
      },
    },
    margin: {
      displayName: 'Margin',
      type: 'Text',
      defaultValue: 'm',
      group: 'style',
      validations: {
        in: [
          {value: 'none', displayName: 'None'},
          {value: 'xs', displayName: 'Extra Small'},
          {value: 's', displayName: 'Small'},
          {value: 'm', displayName: 'Medium'},
          {value: 'l', displayName: 'Large'},
        ],
      },
    },
  },
};
