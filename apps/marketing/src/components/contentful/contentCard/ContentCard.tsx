'use client';

import {styled, type CSSObject} from '@mui/material/styles';
import React from 'react';

import {backgroundToneFor} from '@/components/common/colors';
import Badge from '@/components/contentful/badge/Badge';
import {
  CardBadgeColor,
  parseCardBadgeColor,
} from '@/components/contentful/badge/constants';
import {resolveHeadingStyles} from '@/components/contentful/heading/resolveHeadingStyles';
import Link from '@/components/contentful/link';
import {useSectionBackground} from '@/components/contentful/section/SectionBackgroundContext';
import NextImage from '@/components/nextImage/NextImage';
import {getAbsoluteImageUrl} from '@/selectors/contentful/getImage';
import {codeaiRadius} from '@/themes/code.org/constants/radius';
import {
  CODE_ORG_DISPLAY_FONT_STACK,
  CODE_ORG_TEXT_FONT_STACK,
} from '@/themes/code.org/typography/fontStack';
import {LinkEntry} from '@/types/contentful/entries/Link';

import {
  ContentCardColor,
  ContentCardStyle,
  ContentCardTitleAppearance,
  ContentCardTitleCase,
} from './constants';

// Size-only override from the Display scale, mirroring the Heading
// component's Visual Appearance: the chosen cell's size + line-height +
// letter-spacing (with its responsive step locks) apply while weight and
// font-family stay from the card. The heading level passed here only drives
// tags in the resolver, which the card ignores.
const titleAppearanceSx = (
  appearance: ContentCardTitleAppearance,
): CSSObject =>
  appearance === 'default'
    ? {}
    : (resolveHeadingStyles({visualAppearance: 'heading-lg', appearance})
        .sx as CSSObject);

export interface ContentCardProps {
  /** Badge label rendered above the title */
  badge?: string;
  /** Card title */
  title?: string;
  /** Card description */
  description?: string;
  /** Link content-type entry for the card link */
  link?: LinkEntry;
  /** Image URL or Contentful asset */
  image?: string;
  /** Visual treatment */
  cardStyle?: ContentCardStyle;
  /** Badge color. Light variants render Badge's light appearance (light
   *  background, dark text). */
  badgeColor?: CardBadgeColor;
  /** Title color; black follows the card style's default text color */
  titleColor?: ContentCardColor;
  /** Title casing */
  titleCase?: ContentCardTitleCase;
  /** Title size override from the Display scale; default keeps the card size */
  titleAppearance?: ContentCardTitleAppearance;
  /** Overrides the Link entry's label */
  linkTextOverride?: string;
  /** FontAwesome icon name for the link; defaults to arrow-right */
  linkIconOverride?: string;
  /** Link color; black follows the card style's default link color */
  linkColor?: ContentCardColor;
  /** Title over the image with a purple gradient (outline/flat only) */
  titleOverlay?: boolean;
  /** Custom classname */
  className?: string;
}

type StyledCardProps = {cardStyle: ContentCardStyle};

const forwardCardProps = {
  shouldForwardProp: (prop: string) => prop !== 'cardStyle',
};
const forwardLightProps = {
  shouldForwardProp: (prop: string) => prop !== 'light',
};

const CardRoot = styled(
  'article',
  forwardCardProps,
)<StyledCardProps>(({cardStyle}) => ({
  position: 'relative',
  display: 'flex',
  flexDirection: 'column',
  width: '100%',
  // Fills the row container so cards in a grid share one height.
  height: '100%',
  ...(cardStyle === 'outline' && {
    overflow: 'hidden',
    border: '1px solid var(--codeai-gray-2, #e4e6e9)',
    borderRadius: codeaiRadius('md', '0.625rem'),
    // The card surface stays white regardless of the enclosing Section tone.
    backgroundColor: '#ffffff',
  }),
  ...(cardStyle === 'overlay' && {
    overflow: 'hidden',
    borderRadius: codeaiRadius('md', '0.625rem'),
    // Pins the glass panel to the bottom of the background image.
    justifyContent: 'flex-end',
    // Gives the background image a canvas when the content is short.
    minHeight: '360px',
    backgroundColor: 'var(--codeai-gray-8, #292f36)',
  }),
}));

const ImageArea = styled(
  'div',
  forwardCardProps,
)<StyledCardProps>(({cardStyle}) => ({
  position: 'relative',
  aspectRatio: '16 / 9',
  flexShrink: 0,
  backgroundColor: 'var(--codeai-gray-1, #f2f2f2)',
  ...(cardStyle === 'flat' && {
    // Flat cards have no chrome; the image carries the Image component's
    // radius instead.
    overflow: 'hidden',
    borderRadius: codeaiRadius('lg', '1.25rem'),
  }),
}));

// Overlay style: the image is the card background behind the glass panel.
const BackgroundImage = styled('div')({
  position: 'absolute',
  inset: 0,
});

const Content = styled(
  'div',
  forwardCardProps,
)<StyledCardProps>(({cardStyle}) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'flex-start',
  flexGrow: 1,
  padding: '20px',
  ...(cardStyle === 'flat' && {
    // Text aligns to the image edge since the flat card has no chrome.
    padding: '20px 0',
  }),
  ...(cardStyle === 'overlay' && {
    position: 'relative',
    flexGrow: 0,
    margin: '16px',
    borderRadius: codeaiRadius('md', '0.625rem'),
    // Translucent dark glass keeps white text legible over any image.
    backgroundColor: 'rgba(41, 47, 54, 0.6)',
    backdropFilter: 'blur(8px)',
    WebkitBackdropFilter: 'blur(8px)',
  }),
}));

const BadgeRow = styled('div')({
  paddingBottom: '12px',
});

const Title = styled('h3', {
  shouldForwardProp: (prop: string) =>
    !['light', 'bold', 'titleColor', 'titleCase', 'titleAppearance'].includes(
      prop,
    ),
})<{
  light?: boolean;
  bold?: boolean;
  titleColor: ContentCardColor;
  titleCase: ContentCardTitleCase;
  titleAppearance: ContentCardTitleAppearance;
}>(({light, bold, titleColor, titleCase, titleAppearance}) => ({
  fontFamily: CODE_ORG_DISPLAY_FONT_STACK,
  fontSize: '1.25rem',
  lineHeight: '1.5rem',
  fontWeight: bold ? 700 : 500,
  textTransform: titleCase === 'uppercase' ? 'uppercase' : 'none',
  color:
    titleColor === 'black'
      ? light
        ? '#ffffff'
        : 'var(--codeai-gray-8, #292f36)'
      : `var(--codeai-${titleColor}-primary)`,
  margin: 0,
  paddingBottom: '8px',
  ...titleAppearanceSx(titleAppearance),
}));

const Description = styled(
  'p',
  forwardLightProps,
)<{light?: boolean}>(({light}) => ({
  fontFamily: CODE_ORG_TEXT_FONT_STACK,
  fontSize: '0.875rem',
  lineHeight: '1.25rem',
  color: light ? '#ffffff' : 'var(--codeai-gray-6, #5f6872)',
  margin: 0,
  paddingBottom: '12px',
}));

// Title Overlay: the title sits at the top of the image over a purple scrim
// that fades downward, keeping white text readable where it renders.
const TitleScrim = styled('div')({
  position: 'absolute',
  inset: 0,
  display: 'flex',
  alignItems: 'flex-start',
  padding: '16px 20px',
  background:
    'linear-gradient(to bottom, var(--codeai-purple-primary, #4c42cf) 0%, transparent 65%)',
});

const LinkRow = styled('div', {
  shouldForwardProp: (prop: string) => prop !== 'linkColor',
})<{linkColor: ContentCardColor}>(({linkColor}) => ({
  alignSelf: 'stretch',
  // In equal-height rows the flexible gap opens between the description and
  // the link, keeping links aligned across cards.
  marginTop: 'auto',
  // The Link component only styles purple/black/white hierarchies, so other
  // primary colors are applied from here. The attribute selector outweighs
  // the theme's data-hierarchy rules, including their hover states.
  ...(linkColor !== 'black' && {
    '& a.MuiLink-root, & a.MuiLink-root[data-hierarchy], & a.MuiLink-root[data-hierarchy]:hover':
      {
        color: `var(--codeai-${linkColor}-primary)`,
      },
  }),
}));

const ContentCard: React.FC<ContentCardProps> = ({
  badge,
  title,
  description,
  link,
  image,
  cardStyle = 'outline',
  badgeColor = 'purple',
  titleColor = 'black',
  titleCase = 'none',
  titleAppearance = 'default',
  linkTextOverride,
  linkIconOverride,
  linkColor = 'black',
  titleOverlay = false,
  className,
}) => {
  const enclosingBackground = useSectionBackground();
  // Show placeholder text until a content entry is bound
  if (!title) {
    return (
      <em>
        <strong>🃏 Content Card placeholder.</strong> Please bind or enter a
        Title in the Content sidebar.
      </em>
    );
  }

  const imageUrl = getAbsoluteImageUrl(image);
  const linkFields = link?.fields;
  const isOverlayStyle = cardStyle === 'overlay';
  const showTitleOverlay = !isOverlayStyle && titleOverlay && !!imageUrl;
  const {color: badgeFamily, isLight: badgeIsLight} =
    parseCardBadgeColor(badgeColor);
  // Flat cards have no surface of their own — the Section background shows
  // through — so their text contrast-switches with the Section tone. Outline
  // (white surface) and overlay (dark glass) own their backgrounds and stay
  // fixed. 'transparent' Sections opt out (luminance can't be inferred).
  const isFlatOnDark =
    cardStyle === 'flat' &&
    enclosingBackground !== 'transparent' &&
    backgroundToneFor(enclosingBackground) === 'dark';
  const lightText = isOverlayStyle || isFlatOnDark;

  return (
    <CardRoot
      cardStyle={cardStyle}
      data-testid="content-card"
      data-card-style={cardStyle}
      className={className}
    >
      {imageUrl &&
        (isOverlayStyle ? (
          <BackgroundImage>
            <NextImage src={imageUrl} alt="" style={{objectFit: 'cover'}} />
          </BackgroundImage>
        ) : (
          <ImageArea cardStyle={cardStyle}>
            <NextImage src={imageUrl} alt="" style={{objectFit: 'cover'}} />
            {showTitleOverlay && (
              <TitleScrim data-testid="content-card-title-scrim">
                <Title
                  light
                  bold
                  titleColor={titleColor}
                  titleCase={titleCase}
                  titleAppearance={titleAppearance}
                >
                  {title}
                </Title>
              </TitleScrim>
            )}
          </ImageArea>
        ))}
      <Content
        cardStyle={cardStyle}
        data-testid={isOverlayStyle ? 'content-card-overlay-panel' : undefined}
      >
        {badge && (
          <BadgeRow>
            <Badge
              text={badge}
              size="small"
              color={badgeFamily}
              // Outline is white and overlay is dark glass, so Badge's
              // section-tone auto-detection would pick the wrong variant;
              // flat rides the Section tone. Light picks force the light
              // variant, which is also the dark-surface treatment.
              appearance={badgeIsLight || lightText ? 'light' : 'dark'}
            />
          </BadgeRow>
        )}
        {!showTitleOverlay && (
          <Title
            light={lightText}
            titleColor={titleColor}
            titleCase={titleCase}
            titleAppearance={titleAppearance}
          >
            {title}
          </Title>
        )}
        {description && (
          <Description light={lightText}>{description}</Description>
        )}
        {linkFields && (
          <LinkRow linkColor={linkColor}>
            <Link
              href={linkFields.primaryTarget}
              isLinkExternal={!!linkFields.isThisAnExternalLink}
              ariaLabel={linkFields.ariaLabel || undefined}
              color={lightText ? 'white' : 'black'}
              size="s"
              icon={linkIconOverride || 'arrow-right'}
              removeMarginBottom
            >
              {linkTextOverride || linkFields.label}
            </Link>
          </LinkRow>
        )}
      </Content>
    </CardRoot>
  );
};

export default ContentCard;
