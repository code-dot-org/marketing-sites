// Typography token shapes shared by every brand; values live in themes/<brand>/typography.

export type TypographicTrack = 'display' | 'text';

export type SizeToken =
  | 'xs'
  | 'sm'
  | 'md'
  | 'lg'
  | 'xl'
  | '2xl'
  | '3xl'
  | '4xl';

export type WeightToken = 'regular' | 'medium' | 'semibold' | 'bold';

export type Breakpoint = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

export interface ScaleCell {
  fontSize: string;
  lineHeight: string;
  letterSpacing?: string;
}

export interface RoleToken {
  track: TypographicTrack;
  size: SizeToken;
  weight: WeightToken;
  steps?: Partial<Record<Breakpoint, SizeToken>>;
}

export type RoleTokenName =
  | 'h1'
  | 'h2'
  | 'h3'
  | 'h4'
  | 'h5'
  | 'h6'
  | 'body1'
  | 'body2'
  | 'body3'
  | 'body4'
  | 'overline'
  | 'caption';

export type DisplayAppearanceValue =
  | 'display-xs'
  | 'display-sm'
  | 'display-md'
  | 'display-lg'
  | 'display-xl'
  | 'display-2xl'
  | 'display-3xl'
  | 'display-4xl';

export type TextAppearanceValue =
  | 'text-xs'
  | 'text-sm'
  | 'text-md'
  | 'text-lg'
  | 'text-xl'
  | 'text-2xl'
  | 'text-3xl'
  | 'text-4xl';

/** A brand's full type system, carried on its MUI theme as `typographyTokens`. */
export interface BrandTypographyTokens {
  fontStacks: Record<TypographicTrack, string>;
  weights: Record<WeightToken, number>;
  scales: Record<TypographicTrack, Record<SizeToken, ScaleCell>>;
  roles: Record<RoleTokenName, RoleToken>;
  displayAppearanceRoles: Record<DisplayAppearanceValue, RoleToken>;
  paragraphAppearanceRoles: Record<TextAppearanceValue, RoleToken>;
}
