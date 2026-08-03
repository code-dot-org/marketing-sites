// Brand gradient manifest. Two-stop vertical gradients (0deg → family-primary
// at top, family-light at bottom). Kept separate from `BRAND_COLORS` so
// gradients don't leak into text-color dropdowns (Heading/Paragraph/Link/
// SimpleList), where they would be meaningless.

import type {BrandColorFamily} from './colors';

export const BRAND_GRADIENTS = [
  {
    value: 'gradientPurple',
    displayName: 'Gradient Purple',
    family: 'purple',
    css: 'linear-gradient(0deg, var(--codeai-purple-light) 0%, var(--codeai-purple-primary) 100%)',
  },
  {
    value: 'gradientBlue',
    displayName: 'Gradient Blue',
    family: 'blue',
    css: 'linear-gradient(0deg, var(--codeai-blue-light) 0%, var(--codeai-blue-primary) 100%)',
  },
  {
    value: 'gradientGreen',
    displayName: 'Gradient Green',
    family: 'green',
    css: 'linear-gradient(0deg, var(--codeai-green-light) 0%, var(--codeai-green-primary) 100%)',
  },
  {
    value: 'gradientOrange',
    displayName: 'Gradient Orange',
    family: 'orange',
    css: 'linear-gradient(0deg, var(--codeai-orange-light) 0%, var(--codeai-orange-primary) 100%)',
  },
  {
    value: 'gradientPink',
    displayName: 'Gradient Pink',
    family: 'pink',
    css: 'linear-gradient(0deg, var(--codeai-pink-light) 0%, var(--codeai-pink-primary) 100%)',
  },
] as const satisfies readonly {
  value: string;
  displayName: string;
  family: BrandColorFamily;
  css: string;
}[];

export type BrandGradient = (typeof BRAND_GRADIENTS)[number]['value'];

// Drop-in for Section's `validations.in`.
export const SECTION_GRADIENT_OPTIONS = BRAND_GRADIENTS.map(
  ({value, displayName}) => ({value, displayName}),
);

const GRADIENT_VALUE_SET = new Set<string>(BRAND_GRADIENTS.map(g => g.value));

export const isGradientBackground = (
  value: string | undefined,
): value is BrandGradient => !!value && GRADIENT_VALUE_SET.has(value);

export const gradientFamilyFor = (value: BrandGradient): BrandColorFamily =>
  BRAND_GRADIENTS.find(g => g.value === value)!.family;
