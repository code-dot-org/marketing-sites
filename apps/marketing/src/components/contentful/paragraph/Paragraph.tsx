import Typography from '@mui/material/Typography';
import classNames from 'classnames';
import {ReactNode} from 'react';

import {
  BrandColor,
  LEGACY_PARAGRAPH_COLORS,
  LegacyParagraphColor,
  resolvedCssVarForBrandColor,
} from '@/components/common/colors';
import {RemoveMarginBottomProps} from '@/components/common/types';
import {useSectionBackground} from '@/components/contentful/section/SectionBackgroundContext';

import {
  resolveParagraphStyles,
  type ParagraphVisualAppearanceValue,
} from './resolveParagraphStyles';

type ParagraphColor = BrandColor | LegacyParagraphColor;

type ParagraphTextTransform = 'none' | 'uppercase' | 'lowercase' | 'capitalize';

type ParagraphProps = RemoveMarginBottomProps & {
  /** Paragraph content */
  children: ReactNode;
  /**
   * Paragraph visual appearance. Spec 009 US3 widened the enum from 4 legacy
   * `body-*` values to 12 (4 legacy + 8 new `text-*` cells). Legacy values
   * keep their existing role-token bindings.
   */
  visualAppearance?: ParagraphVisualAppearanceValue;
  /** Whether the paragraph text is bold */
  isStrong?: boolean;
  /** Whether the paragraph text is italic */
  isItalic?: boolean;
  /** Paragraph color */
  color?: ParagraphColor;
  /** Hex color override; takes precedence over `color` */
  colorOverride?: string;
  /** Text-case transform; 'none' is treated as unset */
  textTransform?: ParagraphTextTransform;
  /** ClassName passed by contentful to apply styles that are set through contentful native editor*/
  className?: string;
  /** Custom styles */
  sx?: React.CSSProperties;
};

const isLegacyParagraphColor = (
  value: ParagraphColor,
): value is LegacyParagraphColor =>
  (LEGACY_PARAGRAPH_COLORS as readonly string[]).includes(value);

const Paragraph: React.FunctionComponent<ParagraphProps> = ({
  visualAppearance = 'text-md',
  isStrong = false,
  isItalic = false,
  color = 'black',
  colorOverride,
  textTransform = 'none',
  children,
  removeMarginBottom = false,
  className,
  sx,
}) => {
  const legacy = isLegacyParagraphColor(color);
  const enclosingBackground = useSectionBackground();
  // colorOverride wins over the contrast switch (spec 006 FR-014).
  const inlineColor =
    colorOverride ||
    (legacy
      ? undefined
      : resolvedCssVarForBrandColor(color, enclosingBackground));
  const legacyClassName =
    legacy && !colorOverride ? `paragraph--color-${color}` : undefined;

  const {variantTag, sx: resolvedSx} = resolveParagraphStyles({
    visualAppearance,
    isStrong,
    isItalic,
  });

  return (
    <Typography
      className={classNames(legacyClassName, className)}
      variant={variantTag}
      gutterBottom={!removeMarginBottom}
      sx={{
        ...resolvedSx,
        ...(inlineColor && {color: inlineColor}),
        ...(textTransform !== 'none' && {textTransform}),
        ...sx,
      }}
    >
      {children}
    </Typography>
  );
};

export default Paragraph;
