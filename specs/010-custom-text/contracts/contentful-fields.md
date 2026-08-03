# Contract: customText Contentful component definition

`apps/marketing/src/components/contentful/customText/CustomTextContentfulDefinition.ts`

> **Status: PROPOSED / code-inferred.** Contentful MCP was not connected during planning. Before implementation: confirm via MCP that no `customText` type exists and the field/validation shapes are valid, present the schema for human application/approval, then re-read the applied state. No automated writes.

Shape mirrors `HeadingContentfulComponentDefinition`.

```ts
export const CustomTextContentfulComponentDefinition: ComponentDefinition = {
  id: 'customText',
  name: 'Custom Text',
  category: '03: Content Building Blocks',
  thumbnailUrl: '<TBD>',
  tooltip: {
    description: 'Catch-all for non-heading, non-body text elements …',
    imageUrl: '<TBD>',
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
          {value: 'subtitle', displayName: 'Subtitle'},
          {value: 'overline', displayName: 'Overline'},
          {value: 'statistic', displayName: 'Statistic'},
          {value: 'courseTopics', displayName: 'Course Topics'},
          {value: 'courseLabs', displayName: 'Course Labs'},
        ],
      },
    },
    children: {
      displayName: 'Content',
      type: 'Text',
      defaultValue: 'Custom text',
      group: 'content',
      validations: {bindingSourceType: ['entry', 'manual']},
    },

    // --- Overrides (group: 'style'); each leaves other type defaults intact ---
    htmlTag: {
      displayName: 'Override · HTML tag',
      type: 'Text',
      defaultValue: 'default',
      group: 'style',
      description: "Default uses the type's tag (span; p for Subtitle).",
      validations: {
        in: [
          {value: 'default', displayName: 'Default (from type)'},
          {value: 'span', displayName: '<span>'},
          {value: 'p', displayName: '<p>'},
          {value: 'div', displayName: '<div>'},
          {value: 'label', displayName: '<label>'},
        ],
      },
    },
    color: {
      displayName: 'Text color',
      type: 'Text',
      defaultValue: 'black',
      group: 'style',
      validations: {in: brandTextColorOptions('black')},
    },
    backgroundColor: {
      displayName: 'Background color',
      type: 'Text',
      defaultValue: 'none',
      group: 'style',
      description:
        'Adds a 2px border (border color below). Disables auto text-contrast.',
      validations: {
        in: [
          {value: 'none', displayName: 'None'},
          ...brandColorOptionsWithDefault('purpleLight'),
        ],
      },
    },
    borderColor: {
      displayName: 'Border color',
      type: 'Text',
      defaultValue: 'default',
      group: 'style',
      description:
        'Only applies when a background color is set. Width is fixed at 2px.',
      validations: {
        in: [
          {value: 'default', displayName: 'Default (from type)'},
          ...brandColorOptionsWithDefault('purplePrimary'),
        ],
      },
    },
    textSize: {
      displayName: 'Override · Text size',
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
    font: {
      displayName: 'Override · Font',
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
    fontWeight: {
      displayName: 'Override · Font weight',
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
    iconNameLeft: {
      displayName: 'Left icon name',
      type: 'Text',
      group: 'content',
      description:
        'Font Awesome icon name shown before the text. Takes precedence over right.',
    },
    iconNameRight: {
      displayName: 'Right icon name',
      type: 'Text',
      group: 'content',
      description:
        'Font Awesome icon name shown after the text. Ignored if a left icon is set.',
    },
  },
};
```

## Registration

Add to `apps/marketing/src/contentful/registration/code.org/index.ts`:

```ts
import CustomText, {
  CustomTextContentfulComponentDefinition,
} from '@/components/contentful/customText';
// …within componentRegistrations:
{component: CustomText, definition: CustomTextContentfulComponentDefinition},
```

## Notes / to confirm via MCP

- Confirm no existing `customText` id collides.
- Confirm `defaultValue: 'none'`/`'default'` sentinels validate against `validations.in` lists that include those sentinel rows (they do here).
- Whether to expose color/background/border under `group: 'style'` vs. a dedicated group — match neighboring components' grouping after MCP/Studio review.
- Thumbnail/tooltip imagery TBD (non-blocking).
