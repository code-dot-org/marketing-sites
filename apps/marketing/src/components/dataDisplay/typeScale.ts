import {SCALE_DISPLAY, SCALE_TEXT} from '@/themes/code.org/typography/tokens';
import type {SizeToken} from '@/themes/common/typography/types';

const rem = (value: string) => parseFloat(value);

const cell = (scale: typeof SCALE_TEXT, size: SizeToken) => ({
  fontSize: rem(scale[size].fontSize),
  lineHeight: rem(scale[size].lineHeight) / rem(scale[size].fontSize),
});

/**
 * A Text-track type-scale cell as the `fontSize` (rem) and unitless
 * `lineHeight` props our Heading and Custom Text take.
 */
export const textCell = (size: SizeToken) => cell(SCALE_TEXT, size);

/** The same for the Display track. */
export const displayCell = (size: SizeToken) => cell(SCALE_DISPLAY, size);
