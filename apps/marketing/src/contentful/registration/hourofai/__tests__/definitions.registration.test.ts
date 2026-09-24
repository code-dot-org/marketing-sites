// Imports the variants directly; the full registration list trips Jest's
// ESM transforms (see code.org/__tests__/divider.registration.test.ts).

import {
  HourOfAiBadgeDefinition,
  HourOfAiBrandLinkDefinition,
  HourOfAiCustomTextDefinition,
  HourOfAiDividerDefinition,
  HourOfAiHeadingDefinition,
  HourOfAiIconDefinition,
  HourOfAiParagraphDefinition,
  HourOfAiSectionDefinition,
  HourOfAiSimpleListDefinition,
  HourOfAiTestimonialDefinition,
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

  it('offers palette Section backgrounds with no gradients', () => {
    expect(values(HourOfAiSectionDefinition, 'background')).toEqual([
      'white',
      'purpleDark',
      'pinkPrimary',
      'pinkLight',
      'bluePrimary',
      'blueLight',
      'black',
      'transparent',
    ]);
    expect(variable(HourOfAiSectionDefinition, 'background').defaultValue).toBe(
      'white',
    );
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

  it('offers a single Dark Purple Testimonial background', () => {
    expect(
      variable(HourOfAiTestimonialDefinition, 'background').validations?.in,
    ).toEqual([{value: 'Pattern Dark', displayName: 'Dark Purple'}]);
  });

  it('offers the palette in Studio design tokens', () => {
    expect(Object.keys(hourOfAiDesignTokens.color ?? {})).toEqual(PALETTE);
    expect(Object.keys(hourOfAiDesignTokens.border ?? {})).toEqual(PALETTE);
  });
});
