import {
  HOUR_OF_AI_COLORS,
  type HourOfAiColorValue,
} from '@/themes/hourofai/colors/palette';

type Option = {value: string; displayName: string};

const withDefault = (
  colors: readonly {value: string; displayName: string}[],
  defaultValue?: string,
): Option[] =>
  colors.map(({value, displayName}) => ({
    value,
    displayName:
      value === defaultValue ? `${displayName} (default)` : displayName,
  }));

/** Every palette color, in palette order. */
export const hourOfAiColorOptions = (defaultValue?: HourOfAiColorValue) =>
  withDefault(HOUR_OF_AI_COLORS, defaultValue);

/**
 * Text colors. Blue and Light Blue are below AA for body text, so they're
 * offered only where `largeText` is set.
 */
export const hourOfAiTextColorOptions = (
  defaultValue?: HourOfAiColorValue,
  {largeText = false}: {largeText?: boolean} = {},
) =>
  withDefault(
    HOUR_OF_AI_COLORS.filter(c => largeText || !c.largeTextOnly),
    defaultValue,
  );
