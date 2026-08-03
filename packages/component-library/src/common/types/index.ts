import {FontAwesomeV6IconProps} from '@/fontAwesomeV6Icon';

/**
 * Possible sizes for most(!) of Design System components
 */
export type ComponentSizeXSToL = 'xs' | 's' | 'm' | 'l';

/**
 * Text-scale size token used by SimpleList (per spec 009 amendment-5).
 * Aligns with the Paragraph Text scale (`text-xs` through `text-4xl`).
 */
export type TextScaleSize =
  | 'text-xs'
  | 'text-sm'
  | 'text-md'
  | 'text-lg'
  | 'text-xl'
  | 'text-2xl'
  | 'text-3xl'
  | 'text-4xl';

/**
 * Possible options for spacing related props in Design System components
 */
export type SpacingNoneToS = 'none' | 'xs' | 's';
export type SpacingNoneToM = SpacingNoneToS | 'm';
export type SpacingNoneToL = SpacingNoneToM | 'l';

/**
 * Possible colors for the dropdown components
 */
export type DropdownColor = 'white' | 'black' | 'gray';

/**
 * Possible component placement directions relative to target/connected element.
 * (Used for Tooltips, Popover, etc.)
 */
export type ComponentPlacementDirection =
  | 'onTop'
  | 'onRight'
  | 'onBottom'
  | 'onLeft'
  | 'none';

export interface DropdownFormFieldRelatedProps {
  /** Dropdown helper message */
  helperMessage?: string;
  /** Dropdown helper icon */
  helperIcon?: FontAwesomeV6IconProps;
  /** Dropdown error message */
  errorMessage?: string;
  /** Style Dropdown as a form field */
  styleAsFormField?: boolean;
}
