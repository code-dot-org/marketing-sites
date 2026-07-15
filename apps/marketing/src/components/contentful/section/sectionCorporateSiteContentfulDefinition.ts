// Creates a definition for the Section component to be used in Contentful Studio
import {ComponentDefinition} from '@contentful/experiences-sdk-react';

import {
  BRAND_COLORS,
  brandColorOptionsWithDefault,
} from '@/components/common/colors';
import {
  sectionIdDefinition,
  sectionPaddingDefinition,
} from '@/components/common/definitions';
import {SECTION_GRADIENT_OPTIONS} from '@/components/common/gradients';

// Transparent is a first-class section background: the Section renders with
// no background color so authors can wrap it in a Contentful-native parent or
// supply a background image. Descendants opt out of contrast switching (see
// Section.tsx + SectionBackgroundContext.tsx).
const TRANSPARENT_BACKGROUND_OPTION = {
  value: 'transparent',
  displayName: 'Transparent',
};

// Legacy backgrounds (Corporate Site primitives, patterns, and the `primary`
// manifest entry) are deliberately absent from the picker: existing entries
// still render — Section.tsx keeps the value space and the theme keeps their
// CSS rules — but authors can no longer select them.
//
// Order: White (default), Gray 1, the color families, the remaining grays,
// gradients, Black, Transparent.
const SECTION_BACKGROUND_OPTIONS = ((): {
  value: string;
  displayName: string;
}[] => {
  const options = brandColorOptionsWithDefault('white');
  const byValue = new Map(options.map(o => [o.value, o]));
  const familyOf = new Map(BRAND_COLORS.map(c => [c.value, c.family]));
  const grayValues = BRAND_COLORS.filter(c => c.family === 'gray').map(
    c => c.value,
  );
  const colorOptions = options.filter(
    o =>
      o.value !== 'primary' &&
      !['black', 'white', 'gray'].includes(familyOf.get(o.value) ?? ''),
  );
  return [
    byValue.get('white'),
    byValue.get('gray1'),
    ...colorOptions,
    ...grayValues.filter(v => v !== 'gray1').map(v => byValue.get(v)),
    ...SECTION_GRADIENT_OPTIONS,
    byValue.get('black'),
    TRANSPARENT_BACKGROUND_OPTION,
  ].filter((o): o is {value: string; displayName: string} => o !== undefined);
})();

export const SectionCorporateSiteContentfulComponentDefinition: ComponentDefinition =
  {
    id: 'section',
    name: 'Section (Use Me!)',
    category: '01: Page Sections',
    thumbnailUrl:
      'https://contentful-images.code.org/90t6bu6vlf76/1DVXtxBlLLunOb1PrjRTqz/6bfd2cae987a5cf2dd0c211e677b5023/component_section_thumbnail.png',
    tooltip: {
      description:
        '** Use this component instead of the Section component in the "Structure" group at the top ** A flexible content block for grouping text, media, and other components into a structured layout.',
      imageUrl:
        'https://contentful-images.code.org/90t6bu6vlf76/2u0fxxgU5ACOFA9Co8yHmG/a110e0c14e2ac0c065ffafeaebb32d58/component_section_tooltip.png',
    },
    // Adding an empty array here so no default style options show in the Design tab.
    builtInStyles: [],
    children: true,
    variables: {
      background: {
        displayName: 'Background',
        type: 'Text',
        group: 'style',
        description: 'The background color of the section.',
        defaultValue: 'white',
        validations: {
          in: SECTION_BACKGROUND_OPTIONS,
        },
      },
      ...sectionPaddingDefinition,
      divider: {
        displayName: 'Bottom divider',
        type: 'Text',
        group: 'style',
        description: 'Adds a bottom divider to the section.',
        defaultValue: 'none',
        validations: {
          in: [
            {value: 'none', displayName: 'None'},
            {value: 'primary', displayName: 'Primary'},
            {value: 'strong', displayName: 'Strong'},
          ],
        },
      },
      gap: {
        displayName: 'Vertical gap (rem)',
        type: 'Number',
        group: 'style',
        description:
          'Vertical gap (in rem) between direct children. Leave blank for no gap; 3 is a good starting value when stacking multiple containers.',
      },
      // Background-image auxiliary settings live in the Design tab; the Media
      // asset selector itself lives in the Content tab below (Studio only
      // renders Media inputs under `group: 'content'`).
      backgroundImageScaling: {
        displayName: 'BG img scaling',
        type: 'Text',
        group: 'style',
        defaultValue: 'cover',
        validations: {
          in: [
            {value: 'cover', displayName: 'Cover'},
            {value: 'contain', displayName: 'Contain'},
            {value: 'auto', displayName: 'Auto (original size)'},
            {value: 'manual', displayName: 'Manual (use Height %)'},
          ],
        },
      },
      backgroundImageHeight: {
        displayName: 'BG img height (%)',
        type: 'Number',
        group: 'style',
        description:
          'Used only when Scaling = Manual. 100 = full section height; width scales proportionally.',
        defaultValue: 100,
      },
      backgroundImagePositionX: {
        displayName: 'BG img horizontal align (%)',
        type: 'Number',
        group: 'style',
        description:
          '0 = left, 50 = center, 100 = right. Values outside 0–100 push the image past the edge.',
        defaultValue: 50,
      },
      backgroundImagePositionY: {
        displayName: 'BG img vertical align (%)',
        type: 'Number',
        group: 'style',
        description: '0 = top, 50 = middle, 100 = bottom.',
        defaultValue: 50,
      },
      backgroundImageRepeat: {
        displayName: 'BG img repeat',
        type: 'Text',
        group: 'style',
        defaultValue: 'no-repeat',
        validations: {
          in: [
            {value: 'no-repeat', displayName: 'No repeat'},
            {value: 'repeat', displayName: 'Tile'},
            {value: 'repeat-x', displayName: 'Tile horizontally'},
            {value: 'repeat-y', displayName: 'Tile vertically'},
          ],
        },
      },
      backgroundImageUnset: {
        displayName: 'BG image unset',
        type: 'Boolean',
        group: 'style',
        description: 'Check to hide the background image at this viewport.',
      },
      disableContentPadding: {
        displayName: 'Disable content padding',
        type: 'Boolean',
        group: 'style',
        defaultValue: false,
        description:
          'Let content span the full width by removing the inner side padding. Standard side padding still applies as the screen narrows.',
      },
      backgroundImage: {
        displayName: 'Background image',
        type: 'Media',
        group: 'content',
        description: 'Optional image rendered on top of the background color.',
        validations: {
          bindingSourceType: ['asset'],
        },
      },
      ...sectionIdDefinition,
    },
  };
