// Hour of AI variants of shared definitions: color pickers limited to the
// brand palette, with Hour of AI defaults.
import {ComponentDefinition} from '@contentful/experiences-sdk-react';

import {BadgeContentfulComponentDefinition} from '@/components/contentful/badge';
import {ButtonLegacyContentfulComponentDefinition} from '@/components/contentful/corporateSite/buttonLegacy';
import {CustomTextContentfulComponentDefinition} from '@/components/contentful/customText';
import {CodeOrgDividerContentfulComponentDefinition} from '@/components/contentful/divider/dividerContentfulDefinition';
import {HeadingContentfulComponentDefinition} from '@/components/contentful/heading';
import {IconContentfulComponentDefinition} from '@/components/contentful/icon';
import {BrandLinkContentfulComponentDefinition} from '@/components/contentful/link';
import {ParagraphContentfulComponentDefinition} from '@/components/contentful/paragraph';
import {SectionCorporateSiteContentfulComponentDefinition} from '@/components/contentful/section';
import {SimpleListContentfulComponentDefinition} from '@/components/contentful/simpleList';
import {TestimonialContentfulComponentDefinition} from '@/components/contentful/testimonial';

import {hourOfAiColorOptions, hourOfAiTextColorOptions} from './colorOptions';

type Variables = NonNullable<ComponentDefinition['variables']>;
type Option = {value: string; displayName: string};

const withVariables = (
  definition: ComponentDefinition,
  overrides: Record<string, {defaultValue: string; in: Option[]}>,
): ComponentDefinition => ({
  ...definition,
  variables: {
    ...definition.variables,
    ...Object.fromEntries(
      Object.entries(overrides).map(([name, {defaultValue, in: options}]) => [
        name,
        {
          ...(definition.variables as Variables)[name],
          defaultValue,
          validations: {in: options},
        },
      ]),
    ),
  },
});

export const HourOfAiHeadingDefinition = withVariables(
  HeadingContentfulComponentDefinition,
  {
    color: {
      defaultValue: 'purpleDark',
      in: hourOfAiTextColorOptions('purpleDark', {largeText: true}),
    },
  },
);

export const HourOfAiParagraphDefinition = withVariables(
  ParagraphContentfulComponentDefinition,
  {color: {defaultValue: 'black', in: hourOfAiTextColorOptions('black')}},
);

export const HourOfAiCustomTextDefinition = withVariables(
  CustomTextContentfulComponentDefinition,
  {
    color: {
      defaultValue: 'default',
      in: [
        {value: 'default', displayName: 'Default (from type)'},
        ...hourOfAiTextColorOptions(undefined, {largeText: true}),
      ],
    },
  },
);

export const HourOfAiBrandLinkDefinition = withVariables(
  BrandLinkContentfulComponentDefinition,
  {
    color: {
      defaultValue: 'color',
      in: [
        {value: 'color', displayName: 'Dark Purple (default)'},
        {value: 'black', displayName: 'Black'},
        {value: 'white', displayName: 'White'},
      ],
    },
  },
);

export const HourOfAiDividerDefinition = withVariables(
  CodeOrgDividerContentfulComponentDefinition,
  {color: {defaultValue: 'blueLight', in: hourOfAiColorOptions('blueLight')}},
);

export const HourOfAiIconDefinition = withVariables(
  IconContentfulComponentDefinition,
  {
    color: {defaultValue: 'purpleDark', in: hourOfAiColorOptions('purpleDark')},
    backgroundColor: {
      defaultValue: 'blueLight',
      in: hourOfAiColorOptions('blueLight'),
    },
  },
);

export const HourOfAiBadgeDefinition = withVariables(
  BadgeContentfulComponentDefinition,
  {
    color: {
      defaultValue: 'purple',
      in: [
        {value: 'black', displayName: 'Black'},
        {value: 'purple', displayName: 'Dark Purple (default)'},
        {value: 'pink', displayName: 'Pink'},
        {value: 'blue', displayName: 'Blue'},
      ],
    },
  },
);

export const HourOfAiButtonDefinition = withVariables(
  ButtonLegacyContentfulComponentDefinition,
  {
    color: {
      defaultValue: 'purple',
      in: [
        {value: 'purple', displayName: 'Dark Purple (default)'},
        {value: 'black', displayName: 'Black'},
        {value: 'white', displayName: 'White'},
      ],
    },
  },
);

export const HourOfAiSectionDefinition = withVariables(
  SectionCorporateSiteContentfulComponentDefinition,
  {
    background: {
      defaultValue: 'white',
      in: [
        ...hourOfAiColorOptions('white').filter(o => o.value === 'white'),
        ...hourOfAiColorOptions().filter(
          o => !['white', 'black'].includes(o.value),
        ),
        {value: 'black', displayName: 'Black'},
        {value: 'transparent', displayName: 'Transparent'},
      ],
    },
  },
);

export const HourOfAiSimpleListDefinition = withVariables(
  SimpleListContentfulComponentDefinition,
  {
    type: {defaultValue: 'purpleDark', in: hourOfAiColorOptions('purpleDark')},
    textColor: {defaultValue: 'black', in: hourOfAiTextColorOptions('black')},
  },
);

export const HourOfAiTestimonialDefinition = withVariables(
  TestimonialContentfulComponentDefinition,
  {
    background: {
      defaultValue: 'Pattern Dark',
      in: [{value: 'Pattern Dark', displayName: 'Dark Purple'}],
    },
  },
);
