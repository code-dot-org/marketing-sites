// Creates a definition for the Link component to be used in Contentful Studio
import {ComponentDefinition} from '@contentful/experiences-sdk-react';

import {brandTextColorOptions} from '@/components/common/colors';
import {removeMarginBottomDefinition} from '@/components/common/definitions';

const BASE_VARIABLES: ComponentDefinition['variables'] = {
  isStrong: {
    displayName: 'Make this link bold',
    type: 'Boolean',
    defaultValue: false,
    group: 'style',
  },
  icon: {
    displayName: 'Icon',
    description:
      'FontAwesome icon name (e.g. "arrow-right"). Ignored when "Is this link external?" is on.',
    type: 'Text',
    group: 'style',
    validations: {
      bindingSourceType: ['entry', 'manual'],
    },
  },
  iconPosition: {
    displayName: 'Icon Position',
    type: 'Text',
    defaultValue: 'right',
    group: 'style',
    validations: {
      in: [
        {value: 'left', displayName: 'Left'},
        {value: 'right', displayName: 'Right'},
      ],
    },
  },
  children: {
    displayName: 'Link Label',
    type: 'Text',
    defaultValue: 'Link',
    group: 'content',
    validations: {
      bindingSourceType: ['entry', 'manual'],
    },
  },
  href: {
    displayName: 'Link URL',
    type: 'Text',
    defaultValue: 'https://code.org',
    group: 'content',
    validations: {
      bindingSourceType: ['entry', 'manual'],
    },
  },
  isLinkExternal: {
    displayName: 'Is this link external? (Does this link leave the site?)',
    description:
      'External links will be opened in a new tab, while internal links will be opened in the same tab.',
    type: 'Boolean',
    defaultValue: false,
    group: 'content',
    validations: {
      bindingSourceType: ['entry', 'manual'],
    },
  },
  removeMarginBottom: {...removeMarginBottomDefinition},
  disableUnderline: {
    displayName: 'Disable underline',
    description:
      'Brand Text Links are underlined by default. Enable to render without an underline.',
    type: 'Boolean',
    defaultValue: false,
    group: 'style',
  },
  ariaLabel: {
    displayName: 'Aria Label',
    type: 'Text',
    group: 'content',
    validations: {
      bindingSourceType: ['entry', 'manual'],
    },
  },
};

const SHARED_META = {
  id: 'link',
  name: 'Text Link',
  category: '03: Content Building Blocks',
  thumbnailUrl:
    'https://contentful-images.code.org/90t6bu6vlf76/2CPKrKCB3KxD1n6wG9JTn9/aab22373a39e9cc5305b21c08bba588d/component_link_thumbnail.png',
  tooltip: {
    description:
      'A standalone text link that directs users to internal or external pages, with options for styling and accessibility.',
    imageUrl:
      'https://contentful-images.code.org/90t6bu6vlf76/2toB92KGYPO9yDK3bI3qD8/7bcfbe2819c43f6c5b9c89e6218bad10/component_link_tooltip.png',
  },
  builtInStyles: ['cfTextAlign'],
} as const satisfies Omit<ComponentDefinition, 'variables'>;

// code.org: 3 Brand Hierarchies + 3 sizes. See research.md R13.
export const BrandLinkContentfulComponentDefinition: ComponentDefinition = {
  ...SHARED_META,
  variables: {
    color: {
      displayName: 'Color',
      type: 'Text',
      defaultValue: 'color',
      group: 'style',
      validations: {
        in: [
          {value: 'color', displayName: 'Color (Purple)'},
          {value: 'black', displayName: 'Black'},
          {value: 'white', displayName: 'White'},
        ],
      },
    },
    size: {
      displayName: 'Size',
      type: 'Text',
      defaultValue: 'm',
      group: 'style',
      validations: {
        in: [
          {value: 's', displayName: 'Small'},
          {value: 'm', displayName: 'Medium'},
          {value: 'l', displayName: 'Large'},
        ],
      },
    },
    ...BASE_VARIABLES,
  },
};

// csforall: legacy 22-color + 4-size enum (byte-identical to pre-rebrand).
export const LegacyLinkContentfulComponentDefinition: ComponentDefinition = {
  ...SHARED_META,
  variables: {
    color: {
      displayName: 'Color',
      type: 'Text',
      defaultValue: 'purplePrimary',
      group: 'style',
      validations: {
        in: brandTextColorOptions('purplePrimary'),
      },
    },
    size: {
      displayName: 'Size',
      type: 'Text',
      defaultValue: 'm',
      group: 'style',
      validations: {
        in: [
          {value: 'l', displayName: 'Large'},
          {value: 'm', displayName: 'Medium'},
          {value: 's', displayName: 'Small'},
          {value: 'xs', displayName: 'Extra Small'},
        ],
      },
    },
    ...BASE_VARIABLES,
  },
};

// Back-compat alias.
export const LinkContentfulComponentDefinition =
  LegacyLinkContentfulComponentDefinition;
