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

type ParagraphSemanticTag = 'body1' | 'body2' | 'body3' | 'body4';

// Existing Contentful Paragraph visualAppearance values that
// were set before using the MUI Typography component.
type ParagraphVisualAppearance =
  | 'body-one'
  | 'body-two'
  | 'body-three'
  | 'body-four';

type ParagraphColor = BrandColor | LegacyParagraphColor;

type ParagraphTextTransform = 'none' | 'uppercase' | 'lowercase' | 'capitalize';

type ParagraphProps = RemoveMarginBottomProps & {
  /** Paragraph content */
  children: ReactNode;
  /** Paragraph visual appearance */
  visualAppearance?: ParagraphVisualAppearance;
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

// Maps Contentful Paragraph visualAppearance values with
// MUI Typography `variant` prop values.
const visualAppearanceToMuiTagMap: Record<
  ParagraphVisualAppearance,
  ParagraphSemanticTag
> = {
  'body-one': 'body1',
  'body-two': 'body2',
  'body-three': 'body3',
  'body-four': 'body4',
};

const isLegacyParagraphColor = (
  value: ParagraphColor,
): value is LegacyParagraphColor =>
  (LEGACY_PARAGRAPH_COLORS as readonly string[]).includes(value);

const Paragraph: React.FunctionComponent<ParagraphProps> = ({
  visualAppearance = 'body-two',
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
  // colorOverride wins over the contrast switch (FR-014).
  const inlineColor =
    colorOverride ||
    (legacy
      ? undefined
      : resolvedCssVarForBrandColor(color, enclosingBackground));
  const legacyClassName =
    legacy && !colorOverride ? `paragraph--color-${color}` : undefined;

  return (
    <Typography
      className={classNames(legacyClassName, className)}
      variant={visualAppearanceToMuiTagMap[visualAppearance]}
      gutterBottom={!removeMarginBottom}
      sx={{
        fontWeight: isStrong ? 600 : 400,
        fontStyle: isItalic ? 'italic' : 'normal',
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
