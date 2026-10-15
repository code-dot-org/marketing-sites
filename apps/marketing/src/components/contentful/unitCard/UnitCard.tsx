'use client';

import {styled} from '@mui/material/styles';
import React from 'react';

import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';

import Badge from '@/components/contentful/badge/Badge';
import {
  cardColorCss,
  type ContentCardColor,
} from '@/components/contentful/contentCard/constants';
import Link from '@/components/contentful/link';
import NextImage from '@/components/nextImage/NextImage';
import {getAbsoluteImageUrl} from '@/selectors/contentful/getImage';
import {codeaiRadius} from '@/themes/code.org/constants/radius';
import {CODE_ORG_TEXT_FONT_STACK} from '@/themes/code.org/typography/fontStack';
import {LinkEntry} from '@/types/contentful/entries/Link';

import {CARD_WIDTH_PX, HeadingLevel, UnitCardType} from './constants';
import {mergeGradeBands} from './mergeGradeBands';

// Full brand-color list plus the legacy family values (rendered via the
// family's primary token). Shared by the heading-color fields on Unit
// Carousel and Course Catalog.
export type UnitTitleColor = ContentCardColor;

export const unitTitleColorCss = cardColorCss;

export interface UnitCardProps {
  /** Unit or Course presentation */
  cardType?: UnitCardType;
  /** Unit title */
  title?: string;
  /** Short description of the unit */
  shortDescription?: string;
  /** Grade-band values, merged into one span (e.g. ["K-5","6-8"] → K-8) */
  gradeBands?: string[];
  /** Duration values; anything but exactly one reads "Flexible duration" */
  duration?: string[];
  /** Topic labels, rendered as a comma-separated list */
  topics?: string[];
  /** Image URL or Contentful asset */
  image?: string;
  /** Link content-type entry for the footer link */
  link?: LinkEntry;
  /** Whether to render the topics line */
  showTopics?: boolean;
  /** Semantic heading tag for the title; the visual size is unaffected */
  titleHeadingLevel?: HeadingLevel;
  /** Grow to the surrounding container's width instead of the standard card width */
  fullWidth?: boolean;
  /** Custom classname */
  className?: string;
}

const MAX_TOPICS = 4;

// Grows with the course card's width to keep the unit card's proportions.
const IMAGE_HEIGHT_PX: Record<UnitCardType, number> = {
  unit: 134,
  course: 161,
};

const forwardCardType = {
  shouldForwardProp: (prop: string) => prop !== 'cardType',
};

const CardRoot = styled('article', {
  shouldForwardProp: prop => prop !== 'fullWidth' && prop !== 'cardType',
})<{fullWidth: boolean; cardType: UnitCardType}>(({fullWidth, cardType}) => ({
  display: 'flex',
  flexDirection: 'column',
  width: '100%',
  // Matches the Unit Carousel's slide width so standalone cards and
  // carousel cards render identically; fullWidth defers to the container.
  maxWidth: fullWidth ? 'none' : `${CARD_WIDTH_PX[cardType]}px`,
  // Fills the row container so cards in a grid share one height.
  height: '100%',
  overflow: 'hidden',
  border: '1px solid var(--codeai-gray-2, #e4e6e9)',
  borderRadius: codeaiRadius('md', '0.625rem'),
  // The card surface stays white regardless of the enclosing Section tone.
  backgroundColor: '#ffffff',
}));

const ImageArea = styled(
  'div',
  forwardCardType,
)<{cardType: UnitCardType}>(({cardType}) => ({
  position: 'relative',
  height: `${IMAGE_HEIGHT_PX[cardType]}px`,
  backgroundColor: 'var(--codeai-gray-1, #f2f2f2)',
}));

const Content = styled('div')({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'flex-start',
  flexGrow: 1,
  padding: '20px',
});

const GradeBadgeRow = styled('div')({
  paddingBottom: '12px',
});

// Card-sized regardless of the semantic level (rendered via `as`) — the
// theme's heading scale is too large for the card.
const Title = styled('h4', {
  // Filtering `as` is what makes emotion swap the tag instead of forwarding
  // it as a DOM attribute.
  shouldForwardProp: prop => !['as', 'cardType'].includes(prop as string),
})<{cardType: UnitCardType}>(({cardType}) => ({
  fontFamily: CODE_ORG_TEXT_FONT_STACK,
  // Course titles sit one step up the type scale.
  ...(cardType === 'course'
    ? {fontSize: '1.5rem', lineHeight: '1.75rem'}
    : {fontSize: '1.25rem', lineHeight: '1.5rem'}),
  fontWeight: 500,
  color: '#000000',
  margin: 0,
  paddingBottom: '8px',
}));

const Description = styled('p')({
  fontFamily: CODE_ORG_TEXT_FONT_STACK,
  fontSize: '0.875rem',
  lineHeight: '1.25rem',
  // Black matches the site's default body text.
  color: '#000000',
  margin: 0,
  paddingBottom: '12px',
});

// Groups the topics line and footer at the card bottom; in equal-height
// rows the flexible gap opens between the description and this block, so
// these lines align across cards.
const BottomBlock = styled('div')({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'flex-start',
  alignSelf: 'stretch',
  marginTop: 'auto',
});

const FooterRow = styled('div')({
  display: 'flex',
  alignItems: 'end',
  justifyContent: 'space-between',
  gap: '8px',
  alignSelf: 'stretch',
  paddingTop: '12px',
  borderTop: '1px solid var(--codeai-gray-2, #e4e6e9)',
});

// Icon-led meta line (topics, duration). Baseline alignment keeps the icon
// on the first line when the text wraps.
const MetaLine = styled('span')({
  display: 'inline-flex',
  alignItems: 'baseline',
  gap: '6px',
  fontFamily: CODE_ORG_TEXT_FONT_STACK,
  fontSize: '0.75rem',
  lineHeight: '1.125rem',
  fontWeight: 500,
  color: 'var(--codeai-gray-6, #5f6872)',
});

// The "Topics:" label keeps the line's 500 weight; the list reads lighter.
const MetaValue = styled('span')({
  fontWeight: 400,
});

const MetaIcon: React.FC<{iconName: string}> = ({iconName}) => (
  <FontAwesomeV6Icon
    iconName={iconName}
    iconStyle="solid"
    style={{fontSize: '12px'}}
    aria-hidden="true"
  />
);

const TopicsLine = styled(MetaLine)({
  paddingBottom: '12px',
});

// Keeps the link on the right edge.
const ExploreSlot = styled('span')({
  marginInlineStart: 'auto',
});

const UnitCard: React.FC<UnitCardProps> = ({
  cardType = 'unit',
  title,
  shortDescription,
  gradeBands,
  duration,
  topics,
  image,
  link,
  showTopics = true,
  titleHeadingLevel = 'h4',
  fullWidth = false,
  className,
}) => {
  // Show placeholder text until a content entry is bound
  if (!title) {
    return (
      <em>
        <strong>🗂 Curriculum Card placeholder.</strong> Please bind a
        "Curriculum" or "Course" content type entry in the Content sidebar.
      </em>
    );
  }

  const imageUrl = getAbsoluteImageUrl(image);
  const gradeBand = mergeGradeBands(gradeBands);
  const durations = (duration ?? []).filter(Boolean);
  // Several lengths, or none, means the unit/course can run at any length.
  const durationText =
    durations.length === 1 ? durations[0] : 'Flexible duration';
  const visibleTopics = showTopics ? (topics ?? []).filter(Boolean) : [];
  // Long topic lists are capped so the line stays short; the ellipsis
  // signals the rest.
  const topicsText = [
    ...visibleTopics.slice(0, MAX_TOPICS),
    ...(visibleTopics.length > MAX_TOPICS ? ['...'] : []),
  ].join(', ');
  const linkFields = link?.fields;

  return (
    <CardRoot
      className={className}
      fullWidth={fullWidth}
      cardType={cardType}
      data-card-type={cardType}
    >
      {imageUrl && (
        <ImageArea cardType={cardType}>
          <NextImage src={imageUrl} alt="" style={{objectFit: 'cover'}} />
        </ImageArea>
      )}
      <Content>
        {gradeBand && (
          <GradeBadgeRow>
            <Badge
              text={`Grades ${gradeBand}`}
              size="small"
              color="blue"
              // The card interior is always white, so Badge's section-tone
              // auto-detection would pick the wrong variant on dark sections.
              appearance="light"
            />
          </GradeBadgeRow>
        )}
        <Title as={titleHeadingLevel} cardType={cardType}>
          {title}
        </Title>
        {shortDescription && <Description>{shortDescription}</Description>}
        <BottomBlock>
          {visibleTopics.length > 0 && (
            <TopicsLine data-testid="unit-card-topics">
              <MetaIcon iconName="tags" />
              <span>
                Topics: <MetaValue>{topicsText}</MetaValue>
              </span>
            </TopicsLine>
          )}
          <FooterRow>
            <MetaLine>
              <MetaIcon iconName="clock" />
              {durationText}
            </MetaLine>
            {linkFields && (
              <ExploreSlot>
                <Link
                  href={linkFields.primaryTarget}
                  isLinkExternal={!!linkFields.isThisAnExternalLink}
                  ariaLabel={linkFields.ariaLabel || undefined}
                  color="black"
                  size="s"
                  icon="angle-right"
                  removeMarginBottom
                >
                  {linkFields.label}
                </Link>
              </ExploreSlot>
            )}
          </FooterRow>
        </BottomBlock>
      </Content>
    </CardRoot>
  );
};

export default UnitCard;
