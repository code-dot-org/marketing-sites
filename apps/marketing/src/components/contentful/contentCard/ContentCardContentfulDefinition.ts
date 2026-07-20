// Creates a definition for the Content Card component to be used in Contentful Studio
import {ComponentDefinition} from '@contentful/experiences-sdk-react';

import {CARD_BADGE_COLOR_OPTIONS} from '@/components/contentful/badge/constants';

export const ContentCardContentfulComponentDefinition: ComponentDefinition = {
  id: 'contentCard',
  name: 'Content Card',
  category: '04: Layout Building Blocks',
  tooltip: {
    description:
      'A flexible content card: image, badge, title, description, and a link. Three styles: Outline, Flat, and Overlay.',
  },
  // Adding an empty array here so no default style options show in the Design tab.
  builtInStyles: [],
  variables: {
    badge: {
      displayName: 'Badge',
      type: 'Text',
      group: 'content',
      validations: {
        bindingSourceType: ['entry', 'manual'],
      },
    },
    title: {
      displayName: 'Title',
      type: 'Text',
      group: 'content',
      validations: {
        bindingSourceType: ['entry', 'manual'],
      },
    },
    description: {
      displayName: 'Description',
      type: 'Text',
      group: 'content',
      validations: {
        bindingSourceType: ['entry', 'manual'],
      },
    },
    link: {
      displayName: 'Link',
      type: 'Link',
      group: 'content',
      description: 'Accepts only the "Link" content type entry',
      validations: {
        bindingSourceType: ['entry'],
      },
    },
    image: {
      displayName: 'Image',
      type: 'Media',
      group: 'content',
      validations: {
        bindingSourceType: ['entry', 'asset', 'manual'],
      },
    },
    cardStyle: {
      displayName: 'Card Style',
      description:
        'Outline: bordered card. Flat: no chrome, rounded image. Overlay: the image is the card background behind a translucent panel.',
      type: 'Text',
      defaultValue: 'outline',
      group: 'style',
      validations: {
        in: [
          {value: 'outline', displayName: 'Outline'},
          {value: 'flat', displayName: 'Flat'},
          {value: 'overlay', displayName: 'Overlay'},
        ],
      },
    },
    badgeColor: {
      displayName: 'Badge Color',
      type: 'Text',
      defaultValue: 'purple',
      group: 'style',
      validations: {
        in: CARD_BADGE_COLOR_OPTIONS,
      },
    },
    titleColor: {
      displayName: 'Title Color',
      description: "Black follows the card style's default text color.",
      type: 'Text',
      defaultValue: 'black',
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
    titleCase: {
      displayName: 'Title Case',
      type: 'Text',
      defaultValue: 'none',
      group: 'style',
      validations: {
        in: [
          {value: 'none', displayName: 'None'},
          {value: 'uppercase', displayName: 'Uppercase'},
        ],
      },
    },
    titleAppearance: {
      displayName: 'Title Appearance',
      description:
        "Overrides the title size only, from the Display scale (same options as the Heading component). Default keeps the card's standard title size.",
      type: 'Text',
      defaultValue: 'default',
      group: 'style',
      validations: {
        in: [
          {value: 'default', displayName: 'Default'},
          {value: 'display-4xl', displayName: 'Display 4xl'},
          {value: 'display-3xl', displayName: 'Display 3xl'},
          {value: 'display-2xl', displayName: 'Display 2xl'},
          {value: 'display-xl', displayName: 'Display xl'},
          {value: 'display-lg', displayName: 'Display lg'},
          {value: 'display-md', displayName: 'Display md'},
          {value: 'display-sm', displayName: 'Display sm'},
          {value: 'display-xs', displayName: 'Display xs'},
        ],
      },
    },
    linkTextOverride: {
      displayName: 'Link Text Override',
      description: "Overrides the bound Link entry's label.",
      type: 'Text',
      group: 'style',
    },
    linkIconOverride: {
      displayName: 'Link Icon Override',
      description:
        'FontAwesome icon name for the link. Defaults to arrow-right. External links show the external-link treatment instead.',
      type: 'Text',
      group: 'style',
    },
    linkColor: {
      displayName: 'Link Color',
      description: "Black follows the card style's default link color.",
      type: 'Text',
      defaultValue: 'black',
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
    titleOverlay: {
      displayName: 'Title Overlay',
      description:
        'Moves the title on top of the image with a purple gradient. Has no effect for the Overlay card style.',
      type: 'Boolean',
      defaultValue: false,
      group: 'style',
    },
  },
};
