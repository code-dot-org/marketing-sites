// Imports the variants directly; the full registration list trips Jest's
// ESM transforms (see code.org/__tests__/divider.registration.test.ts).

import {ActivityCardContentfulComponentDefinition as ActivityCard} from '@/components/contentful/activityCard/ActivityCardContentfulDefinition';
import {ActivityCarouselContentfulComponentDefinition as ActivityCarousel} from '@/components/contentful/activityCarousel/ActivityCarouselContentfulDefinition';

import {
  HourOfAiBadgeDefinition,
  HourOfAiBrandLinkDefinition,
  HourOfAiButtonDefinition,
  HourOfAiCustomTextDefinition,
  HourOfAiDividerDefinition,
  HourOfAiHeadingDefinition,
  HourOfAiIconDefinition,
  HourOfAiParagraphDefinition,
  HourOfAiSectionDefinition,
  HourOfAiSimpleListDefinition,
} from '../definitions';
import {hourOfAiDesignTokens} from '../designTokens';

const PALETTE = [
  'black',
  'purpleDark',
  'pinkPrimary',
  'pinkLight',
  'bluePrimary',
  'blueLight',
  'white',
];
const BODY_TEXT = PALETTE.filter(
  v => !['bluePrimary', 'blueLight'].includes(v),
);

const variable = (definition: typeof HourOfAiHeadingDefinition, name: string) =>
  definition.variables[name];
const values = (definition: typeof HourOfAiHeadingDefinition, name: string) =>
  variable(definition, name).validations?.in?.map(o => o.value);

describe('Hour of AI color pickers', () => {
  it('offers large-text colors on Heading, defaulting to Dark Purple', () => {
    expect(values(HourOfAiHeadingDefinition, 'color')).toEqual(PALETTE);
    expect(variable(HourOfAiHeadingDefinition, 'color').defaultValue).toBe(
      'purpleDark',
    );
  });

  it('keeps Blue and Light Blue off body text', () => {
    expect(values(HourOfAiParagraphDefinition, 'color')).toEqual(BODY_TEXT);
    expect(variable(HourOfAiParagraphDefinition, 'color').defaultValue).toBe(
      'black',
    );
  });

  it('leads Custom Text with the type default', () => {
    expect(values(HourOfAiCustomTextDefinition, 'color')).toEqual([
      'default',
      ...PALETTE,
    ]);
  });

  it('labels the brand link color Dark Purple', () => {
    expect(
      variable(HourOfAiBrandLinkDefinition, 'color').validations?.in?.[0],
    ).toEqual({value: 'color', displayName: 'Dark Purple (default)'});
  });

  it('offers Dark Purple, Black and White Buttons', () => {
    expect(values(HourOfAiButtonDefinition, 'color')).toEqual([
      'purple',
      'black',
      'white',
    ]);
    expect(variable(HourOfAiButtonDefinition, 'color').defaultValue).toBe(
      'purple',
    );
  });

  it('defaults Divider and the Icon fill to Light Blue', () => {
    expect(variable(HourOfAiDividerDefinition, 'color').defaultValue).toBe(
      'blueLight',
    );
    expect(values(HourOfAiDividerDefinition, 'color')).toEqual(PALETTE);
    expect(variable(HourOfAiIconDefinition, 'color').defaultValue).toBe(
      'purpleDark',
    );
    expect(
      variable(HourOfAiIconDefinition, 'backgroundColor').defaultValue,
    ).toBe('blueLight');
  });

  it('limits Badge to the palette families', () => {
    expect(values(HourOfAiBadgeDefinition, 'color')).toEqual([
      'black',
      'purple',
      'pink',
      'blue',
    ]);
  });

  it('offers palette and multi-color Section backgrounds, no gradients', () => {
    expect(values(HourOfAiSectionDefinition, 'background')).toEqual([
      'white',
      'purpleDark',
      'pinkPrimary',
      'pinkLight',
      'bluePrimary',
      'blueLight',
      'aurora',
      'dusk',
      'black',
      'transparent',
    ]);
    expect(variable(HourOfAiSectionDefinition, 'background').defaultValue).toBe(
      'white',
    );
  });

  it('offers Section background motion, defaulting to none', () => {
    expect(values(HourOfAiSectionDefinition, 'backgroundMotion')).toEqual([
      'none',
      'drift',
      'breathe',
      'pointer',
      'scroll',
    ]);
    expect(
      variable(HourOfAiSectionDefinition, 'backgroundMotion').defaultValue,
    ).toBe('none');
  });

  it('offers Slow, Normal and Fast motion speeds, defaulting to Normal', () => {
    expect(values(HourOfAiSectionDefinition, 'backgroundMotionSpeed')).toEqual([
      'slow',
      'normal',
      'fast',
    ]);
    expect(
      variable(HourOfAiSectionDefinition, 'backgroundMotionSpeed').defaultValue,
    ).toBe('normal');
  });

  it('limits SimpleList icon and text colors to the palette', () => {
    expect(values(HourOfAiSimpleListDefinition, 'type')).toEqual(PALETTE);
    expect(variable(HourOfAiSimpleListDefinition, 'type').defaultValue).toBe(
      'purpleDark',
    );
    expect(values(HourOfAiSimpleListDefinition, 'textColor')).toEqual(
      BODY_TEXT,
    );
  });

  it('offers large-text Activity Card title colors, defaulting to Dark Purple', () => {
    expect(values(ActivityCard, 'titleColor')).toEqual(PALETTE);
    expect(variable(ActivityCard, 'titleColor').defaultValue).toBe(
      'purpleDark',
    );
    expect(values(ActivityCard, 'organizationBadgeColor')).toEqual([
      'purple',
      'pink',
      'blue',
      'black',
      'pinkLight',
      'blueLight',
      'blackLight',
    ]);
    expect(variable(ActivityCard, 'organizationBadgeColor').defaultValue).toBe(
      'blueLight',
    );
  });

  it('shows every Activity Card field by default', () => {
    for (const name of [
      'showOrganization',
      'showAges',
      'showTopics',
      'showActivityType',
      'showLength',
      'showTutorialLink',
      'showTeacherLink',
    ]) {
      expect(variable(ActivityCard, name).defaultValue).toBe(true);
    }
  });

  it('gives Activity Carousel the Activity Card toggles and palette colors', () => {
    for (const name of Object.keys(ActivityCard.variables)) {
      if (name.startsWith('show') || name === 'organizationBadgeColor') {
        expect(variable(ActivityCarousel, name)).toEqual(
          variable(ActivityCard, name),
        );
      }
    }
    expect(variable(ActivityCarousel, 'cardWidth').defaultValue).toBe('325px');
    expect(variable(ActivityCard, 'width').defaultValue).toBe('325px');
    expect(values(ActivityCarousel, 'activityTitleColor')).toEqual(PALETTE);
    expect(variable(ActivityCarousel, 'activities').validations?.required).toBe(
      true,
    );
  });

  it('offers the palette in Studio design tokens', () => {
    expect(Object.keys(hourOfAiDesignTokens.color ?? {})).toEqual(PALETTE);
    expect(Object.keys(hourOfAiDesignTokens.border ?? {})).toEqual(PALETTE);
  });
});
