// This Badge component is used specifically on Code.org
import {ComponentDefinition} from '@contentful/experiences-sdk-react';

export const BadgeContentfulComponentDefinition: ComponentDefinition = {
  id: 'badge',
  name: 'Badge',
  category: '03: Content Building Blocks',
  tooltip: {
    description:
      'Use a badge to label or highlight content with a short status pill. Supports brand colors, sizes, and an optional Font Awesome icon.',
  },
  builtInStyles: [],
  variables: {
    color: {
      displayName: 'Color',
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
    size: {
      displayName: 'Size',
      type: 'Text',
      defaultValue: 'medium',
      group: 'style',
      validations: {
        in: [
          {value: 'small', displayName: 'Small'},
          {value: 'medium', displayName: 'Medium'},
          {value: 'large', displayName: 'Large'},
        ],
      },
    },
    appearance: {
      displayName: 'Appearance',
      description:
        'Auto renders the light badge (light background, dark text) on dark sections and the dark badge (color background, white text) everywhere else. Light/Dark force one variant.',
      type: 'Text',
      defaultValue: 'auto',
      group: 'style',
      validations: {
        in: [
          {value: 'auto', displayName: 'Auto (match section)'},
          {value: 'light', displayName: 'Light'},
          {value: 'dark', displayName: 'Dark'},
        ],
      },
    },
    iconPosition: {
      displayName: 'Icon Position',
      type: 'Text',
      defaultValue: 'left',
      group: 'style',
      validations: {
        in: [
          {value: 'left', displayName: 'Left'},
          {value: 'right', displayName: 'Right'},
        ],
      },
    },
    isIconOnly: {
      displayName: 'Icon Only',
      description:
        'When enabled, renders a circular badge with only the icon. Text is hidden. Aria Label is required for accessibility.',
      type: 'Boolean',
      defaultValue: false,
      group: 'style',
    },
    text: {
      displayName: 'Text',
      type: 'Text',
      defaultValue: 'Badge',
      group: 'content',
      validations: {
        bindingSourceType: ['entry', 'manual'],
      },
    },
    iconName: {
      displayName: 'Icon Name',
      description:
        'Optional. Font Awesome icon name to render inside the badge.',
      type: 'Text',
      group: 'content',
      validations: {
        bindingSourceType: ['entry', 'manual'],
      },
    },
    ariaLabel: {
      displayName: 'Aria Label',
      description: 'Accessible name for icon-only badges.',
      type: 'Text',
      group: 'content',
      validations: {
        bindingSourceType: ['entry', 'manual'],
      },
    },
  },
};
