import type {
  BackgroundTone,
  EnclosingBackground,
} from '@/components/common/colors';

/**
 * A brand's color behavior, carried on its MUI theme as
 * `theme.mixins.brandColors`. Values are stored Contentful color keys.
 */
export interface BrandColorTokens {
  /** CSS color for a stored value. */
  cssVar: (value: string) => string;
  /** Stored value to render for text of `value` on `background`. */
  resolveText: (value: string, background?: EnclosingBackground) => string;
  /** Contrast tone of a Section background value. */
  backgroundTone: (value: string | null | undefined) => BackgroundTone;
  /** Text color for content on a solid fill of `value`, if the brand sets one. */
  textOnFill?: (value: string) => string | undefined;
}
