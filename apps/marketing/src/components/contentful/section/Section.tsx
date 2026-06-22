import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import classNames from 'classnames';
import {ReactNode} from 'react';

import {
  BRAND_COLORS,
  BrandColor,
  backgroundToneFor,
} from '@/components/common/colors';
import {
  BrandGradient,
  gradientFamilyFor,
  isGradientBackground,
} from '@/components/common/gradients';
import type {SpacingProps} from '@/components/common/types';
import {SectionBackgroundProvider} from '@/components/contentful/section/SectionBackgroundContext';
import {getAbsoluteImageUrl} from '@/selectors/contentful/getImage';
import bgPatternImage from '@public/images/bg-pattern-lines.webp';

// Legacy backgrounds — Corporate Site theme primitives + CS for All brand
// backgrounds + pattern/transparent. Kept exactly as before.
type LegacySectionBackground =
  | 'primary'
  | 'secondary'
  | 'dark'
  | 'brandPrimary'
  | 'brandLightPrimary'
  | 'brandSecondary'
  | 'brandLightSecondary'
  | 'brandTertiary'
  | 'brandLightTertiary'
  | 'patternDark'
  | 'patternPrimary'
  | 'transparent';

// CodeAI brand-palette section backgrounds: every entry in BRAND_COLORS is a
// valid background value. Adding a color to BRAND_COLORS automatically widens
// this type.
type BrandColorSectionBackground = (typeof BRAND_COLORS)[number]['value'];

export type SectionBackground =
  | LegacySectionBackground
  | BrandColorSectionBackground
  | BrandGradient;

const LEGACY_SECTION_BACKGROUNDS = [
  'primary',
  'secondary',
  'dark',
  'brandPrimary',
  'brandLightPrimary',
  'brandSecondary',
  'brandLightSecondary',
  'brandTertiary',
  'brandLightTertiary',
  'patternDark',
  'patternPrimary',
  'transparent',
] as const satisfies readonly LegacySectionBackground[];

export const sectionBackground: {
  [key in SectionBackground]: SectionBackground;
} = Object.fromEntries([
  ...LEGACY_SECTION_BACKGROUNDS.map(v => [v, v] as const),
  ...BRAND_COLORS.map(({value}) => [value, value] as const),
]) as {[key in SectionBackground]: SectionBackground};

// Section's bottom-divider field is a separate concept from the Divider
// component's `color` prop. It supports a fixed three-value set rendered via
// `.container--divider-{value}` classes; the Divider component's color
// palette (which now includes the full CodeAI brand set) is irrelevant here.
export type SectionDivider = 'none' | 'primary' | 'strong';

export const sectionDivider: {
  [key in SectionDivider]: SectionDivider;
} = {
  none: 'none',
  primary: 'primary',
  strong: 'strong',
};

export type SectionBackgroundImageScaling =
  | 'cover'
  | 'contain'
  | 'auto'
  | 'manual';

export type SectionBackgroundImageRepeat =
  | 'no-repeat'
  | 'repeat'
  | 'repeat-x'
  | 'repeat-y';

export interface SectionProps {
  /** Background color */
  background?: SectionBackground;
  /** Vertical padding */
  padding?: keyof Exclude<SpacingProps, 'xs' | 's'>;
  /** Vertical gap (rem) between direct children. Undefined → no gap. */
  gap?: number;
  /** Background image URL or Contentful asset reference, layered over color */
  backgroundImage?: string;
  /** background-size: cover | contain | auto | manual (uses height %) */
  backgroundImageScaling?: SectionBackgroundImageScaling;
  /** Image height as % of section height when scaling === 'manual' */
  backgroundImageHeight?: number;
  /** background-position X in % (can exceed 0–100 to push past edge) */
  backgroundImagePositionX?: number;
  /** background-position Y in % */
  backgroundImagePositionY?: number;
  /** background-repeat */
  backgroundImageRepeat?: SectionBackgroundImageRepeat;
  /** Hide the bg image. Authored per-viewport in Contentful Studio. */
  backgroundImageUnset?: boolean;
  /** Section theme */
  theme?: 'Light' | 'Dark';
  /** Has bottom divider */
  divider?: SectionDivider;
  /** Section ID */
  id?: string;
  /** Section className */
  className?: string;
  /** Section content */
  children?: ReactNode;
}

const styles = {
  section: {
    display: 'block',
    boxSizing: 'border-box',
    paddingInline: '1.5rem',
    width: '100%',
  },
};

// Value-space guard for the new CodeAI brand palette. Only set when the
// background prop is one of the 22 new brand tokens — csforall and Corporate
// Site legacy values fall through and produce no data-bg-tone attribute on
// the rendered Section (research.md §10, FR-013 / FR-018).
//
// `primary` is excluded because it's a text-color manifest entry (theme-aware
// neutral text) that collides by name with the legacy SectionBackground value
// `primary` (which means the white Section background). Without this filter,
// `background="primary"` (legacy white) would be misread as a brand background
// → dark tone → flip descendant primary text to white.
const BRAND_BACKGROUND_VALUES = new Set<string>(
  BRAND_COLORS.filter(c => c.value !== 'primary').map(c => c.value),
);

const Section: React.FC<SectionProps> = ({
  background = 'primary',
  padding = 'l',
  gap,
  backgroundImage,
  backgroundImageScaling,
  backgroundImageHeight,
  backgroundImagePositionX,
  backgroundImagePositionY,
  backgroundImageRepeat,
  backgroundImageUnset,
  theme = 'Light',
  divider = sectionDivider.none,
  id,
  className,
  children,
  ...experienceProps
}: SectionProps) => {
  // This is used for the Corporate Site only to determine
  // if the section has a hardcoded pattern.
  const hasPatternBackground =
    background === sectionBackground.patternDark ||
    background === sectionBackground.patternPrimary;

  // This is used for the Corporate Site only to determine
  // if the section should use a dark theme.
  const useDarkTheme =
    hasPatternBackground || background === sectionBackground.dark;

  // CodeAI brand-palette guards. Both undefined for non-brand backgrounds so
  // React renders no extra attribute / no provider change.
  const isBrandBackground = BRAND_BACKGROUND_VALUES.has(background);
  const brandBackgroundValue = isBrandBackground
    ? (background as BrandColor)
    : undefined;

  // Gradient backgrounds are treated as primary-tone for the contrast switch:
  // the top of the gradient is family-primary, so default text needs to flip
  // to white. We normalize the gradient to its family's primary token before
  // it reaches the SectionBackgroundProvider — descendants stay gradient-naive.
  const gradientBackgroundValue = isGradientBackground(background)
    ? background
    : undefined;
  const normalizedBrandBgFromGradient = gradientBackgroundValue
    ? (`${gradientFamilyFor(gradientBackgroundValue)}Primary` as BrandColor)
    : undefined;

  const dataBgTone = isBrandBackground
    ? backgroundToneFor(brandBackgroundValue)
    : gradientBackgroundValue
      ? 'dark'
      : undefined;

  // Transparent sections opt their descendants out of contrast switching —
  // the visible background lives on an ancestor (Contentful native parent,
  // background image, custom layout), so the Section can't infer luminance.
  // Authors pick "Default" (which still inherits from data-theme cascades on
  // legacy parents) or an explicit color, and we render it verbatim.
  const providerValue =
    background === 'transparent'
      ? 'transparent'
      : (normalizedBrandBgFromGradient ?? brandBackgroundValue);

  const resolvedBackgroundSize =
    backgroundImageScaling === 'manual'
      ? `auto ${backgroundImageHeight ?? 100}%`
      : (backgroundImageScaling ?? 'cover');

  const backgroundImageUrl =
    backgroundImage && !backgroundImageUnset
      ? `url(${getAbsoluteImageUrl(backgroundImage)})`
      : undefined;

  const backgroundImageSx = backgroundImageUrl
    ? {
        backgroundImage: backgroundImageUrl,
        backgroundSize: resolvedBackgroundSize,
        backgroundPosition: `${backgroundImagePositionX ?? 50}% ${backgroundImagePositionY ?? 50}%`,
        backgroundRepeat: backgroundImageRepeat ?? 'no-repeat',
      }
    : undefined;

  const gapStyle =
    gap !== undefined
      ? {display: 'flex', flexDirection: 'column' as const, gap: `${gap}rem`}
      : undefined;

  return (
    <Box
      id={id}
      component="section"
      // Dark theme is used on the Corporate Site only
      data-theme={hasPatternBackground || useDarkTheme ? 'Dark' : theme}
      data-bg-tone={dataBgTone}
      className={classNames(`section-background-${background}`, className)}
      sx={{
        ...styles.section,
        // Fallback dark bg color for older browsers that don't support CSS :has()
        ...(useDarkTheme && {
          backgroundColor: '#212121',
        }),
        // This hardcoded bg pattern is used on the Corporate Site only
        ...(background === 'patternDark' || background === 'patternPrimary'
          ? {
              backgroundImage: `url(${bgPatternImage.src})`,
              backgroundRepeat: 'repeat',
              backgroundSize: '18rem',
            }
          : {}),
        // User-supplied background image overrides the legacy pattern above
        // when both happen to be present.
        ...backgroundImageSx,
      }}
      {...experienceProps}
    >
      <Container
        className={classNames(
          'container',
          `container--spacing-${padding}`,
          divider !== 'none' && `container--divider-${divider}`,
        )}
      >
        <SectionBackgroundProvider value={providerValue}>
          {gapStyle ? <div style={gapStyle}>{children}</div> : children}
        </SectionBackgroundProvider>
      </Container>
    </Box>
  );
};

export default Section;
