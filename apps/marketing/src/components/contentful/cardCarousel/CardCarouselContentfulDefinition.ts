// Creates a definition for the Card Carousel component to be used in Contentful Studio
import {ComponentDefinition} from '@contentful/experiences-sdk-react';

// Imported from the server-safe constants module (not the contentCard
// barrel) — this file evaluates in the RSC layer, where values re-exported
// through the 'use client' component would arrive as reference proxies.
import {
  CONTENT_CARD_COLORS,
  CONTENT_CARD_STYLES,
  CONTENT_CARD_TITLE_APPEARANCES,
  CONTENT_CARD_TITLE_CASES,
} from '@/components/contentful/contentCard/constants';

import {DEFAULT_FIELD_MAPPING} from './mapEntryToCardProps';

// Builds a Studio dropdown option from a Content Card const value, matching
// the Content Card definition's displayNames ('outline' -> 'Outline',
// 'display-4xl' -> 'Display 4xl').
const opt = (value: string) => ({
  value,
  displayName:
    value.charAt(0).toUpperCase() + value.slice(1).replace(/-/g, ' '),
});

const FIELD_MAPPING_DESCRIPTION =
  'Field ID(s) to read from each bound entry; comma-separated, first match wins.';

export const CardCarouselContentfulComponentDefinition: ComponentDefinition = {
  id: 'cardCarousel',
  name: 'Card Carousel',
  category: '04: Layout Building Blocks',
  tooltip: {
    description:
      'A horizontal carousel of Content Cards built from any list of entries (Curriculum, Lab, Resources and Tools, Person, ...). Card fields are read via configurable field IDs.',
  },
  // Adding an empty array here so no default style options show in the Design tab.
  builtInStyles: [],
  children: false,
  variables: {
    cards: {
      displayName: 'Cards',
      description:
        'Bind an array of entries (Curriculum, Lab, Resources and Tools, Person, ...); each becomes one card.',
      type: 'Array',
      group: 'content',
      validations: {
        required: true,
        bindingSourceType: ['entry'],
      },
    },
    cardsPerView: {
      displayName: 'Cards Per View',
      description:
        'Full cards visible at the full content width; a sliver of the next card peeks to signal more.',
      type: 'Text',
      defaultValue: '3',
      group: 'style',
      validations: {
        in: [
          {value: '3', displayName: '3'},
          {value: '4', displayName: '4'},
        ],
      },
    },
    navPosition: {
      displayName: 'Nav Buttons Position',
      description:
        'Top places the arrows above the cards on the right; Bottom places them below the cards on the left.',
      type: 'Text',
      defaultValue: 'top',
      group: 'style',
      validations: {
        in: [
          {value: 'top', displayName: 'Top'},
          {value: 'bottom', displayName: 'Bottom'},
        ],
      },
    },
    titleFields: {
      displayName: 'Title Field(s)',
      description: FIELD_MAPPING_DESCRIPTION,
      type: 'Text',
      defaultValue: DEFAULT_FIELD_MAPPING.titleFields,
      group: 'style',
    },
    descriptionFields: {
      displayName: 'Description Field(s)',
      description: FIELD_MAPPING_DESCRIPTION,
      type: 'Text',
      defaultValue: DEFAULT_FIELD_MAPPING.descriptionFields,
      group: 'style',
    },
    imageFields: {
      displayName: 'Image Field(s)',
      description: FIELD_MAPPING_DESCRIPTION,
      type: 'Text',
      defaultValue: DEFAULT_FIELD_MAPPING.imageFields,
      group: 'style',
    },
    linkFields: {
      displayName: 'Link Field(s)',
      description: FIELD_MAPPING_DESCRIPTION,
      type: 'Text',
      defaultValue: DEFAULT_FIELD_MAPPING.linkFields,
      group: 'style',
    },
    badgeFields: {
      displayName: 'Badge Field(s)',
      description: `${FIELD_MAPPING_DESCRIPTION} Array fields (e.g. topics) use their first item.`,
      type: 'Text',
      defaultValue: DEFAULT_FIELD_MAPPING.badgeFields,
      group: 'style',
    },
    maxDescriptionLength: {
      displayName: 'Max Description Length',
      description:
        'Optional. Truncates each card description to at most this many characters, ending at a word with an ellipsis.',
      type: 'Number',
      group: 'style',
    },
    cardStyle: {
      displayName: 'Card Style',
      description:
        'Outline: bordered card. Flat: no chrome, rounded image. Overlay: the image is the card background behind a translucent panel.',
      type: 'Text',
      defaultValue: 'outline',
      group: 'style',
      validations: {
        in: CONTENT_CARD_STYLES.map(opt),
      },
    },
    badgeColor: {
      displayName: 'Badge Color',
      type: 'Text',
      defaultValue: 'purple',
      group: 'style',
      validations: {
        in: CONTENT_CARD_COLORS.map(opt),
      },
    },
    titleColor: {
      displayName: 'Title Color',
      description: "Black follows the card style's default text color.",
      type: 'Text',
      defaultValue: 'black',
      group: 'style',
      validations: {
        in: CONTENT_CARD_COLORS.map(opt),
      },
    },
    titleCase: {
      displayName: 'Title Case',
      type: 'Text',
      defaultValue: 'none',
      group: 'style',
      validations: {
        in: CONTENT_CARD_TITLE_CASES.map(opt),
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
        in: CONTENT_CARD_TITLE_APPEARANCES.map(opt),
      },
    },
    linkTextOverride: {
      displayName: 'Link Text Override',
      description: "Overrides every card's Link entry label.",
      type: 'Text',
      group: 'style',
    },
    linkIconOverride: {
      displayName: 'Link Icon Override',
      description:
        'FontAwesome icon name for the card links. Defaults to arrow-right. External links show the external-link treatment instead.',
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
        in: CONTENT_CARD_COLORS.map(opt),
      },
    },
    titleOverlay: {
      displayName: 'Title Overlay',
      description:
        'Moves each title on top of its image with a purple gradient. Has no effect for the Overlay card style.',
      type: 'Boolean',
      defaultValue: false,
      group: 'style',
    },
  },
};
