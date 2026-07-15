'use client';

import {styled} from '@mui/material/styles';
import React from 'react';

import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';

import Badge, {BadgeColor} from '@/components/contentful/badge/Badge';
import Link from '@/components/contentful/link';
import NextImage from '@/components/nextImage/NextImage';
import {getAbsoluteImageUrl} from '@/selectors/contentful/getImage';
import {codeaiRadius} from '@/themes/code.org/constants/radius';
import {
  CODE_ORG_DISPLAY_FONT_STACK,
  CODE_ORG_TEXT_FONT_STACK,
} from '@/themes/code.org/typography/fontStack';
import {LinkEntry} from '@/types/contentful/entries/Link';

import {mergeGradeBands} from './mergeGradeBands';

// Black renders the default gray-8 text; the rest map to the family's
// primary CSS variable. Shared by the title-color fields on Unit Card,
// Unit Carousel (heading + unit titles), and Course Catalog.
export type UnitTitleColor =
  | 'black'
  | 'purple'
  | 'blue'
  | 'green'
  | 'orange'
  | 'pink';

export const unitTitleColorCss = (color: UnitTitleColor): string =>
  color === 'black'
    ? 'var(--codeai-gray-8, #292f36)'
    : `var(--codeai-${color}-primary)`;

export interface UnitCardProps {
  /** Unit title */
  title?: string;
  /** Short description of the unit */
  shortDescription?: string;
  /** Grade-band values, merged into one span (e.g. ["K-5","6-8"] → K-8) */
  gradeBands?: string[];
  /** Duration values (the curriculum entry's Length field) */
  duration?: string[];
  /** Topic labels rendered as badges */
  topics?: string[];
  /** Image URL or Contentful asset */
  image?: string;
  /** Link content-type entry for the footer link */
  link?: LinkEntry;
  /** Whether to render the topics row */
  showTopics?: boolean;
  /** Badge color applied to every topic on the card */
  topicBadgeColor?: BadgeColor;
  /** Unit title color */
  titleColor?: UnitTitleColor;
  /** Grow to the surrounding container's width instead of the standard card width */
  fullWidth?: boolean;
  /** Custom classname */
  className?: string;
}

const IMAGE_HEIGHT_PX = 134;

const CardRoot = styled('article', {
  shouldForwardProp: prop => prop !== 'fullWidth',
})<{fullWidth: boolean}>(({fullWidth}) => ({
  display: 'flex',
  flexDirection: 'column',
  width: '100%',
  // 264px matches the Unit Carousel's slide width so standalone cards and
  // carousel cards render identically; fullWidth defers to the container.
  maxWidth: fullWidth ? 'none' : '264px',
  // Fills the row container so cards in a grid share one height.
  height: '100%',
  overflow: 'hidden',
  border: '1px solid var(--codeai-gray-2, #e4e6e9)',
  borderRadius: codeaiRadius('md', '0.625rem'),
  // The card surface stays white regardless of the enclosing Section tone.
  backgroundColor: '#ffffff',
}));

const ImageArea = styled('div')({
  position: 'relative',
  height: `${IMAGE_HEIGHT_PX}px`,
  backgroundColor: 'var(--codeai-gray-1, #f2f2f2)',
});

const Content = styled('div')({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'flex-start',
  flexGrow: 1,
  padding: '20px',
});

const TopicsRow = styled('div')({
  display: 'flex',
  flexWrap: 'wrap',
  gap: '4px',
  paddingBottom: '12px',
});

const Title = styled('h3', {
  shouldForwardProp: prop => prop !== 'titleColor',
})<{titleColor: UnitTitleColor}>(({titleColor}) => ({
  fontFamily: CODE_ORG_DISPLAY_FONT_STACK,
  fontSize: '1.25rem',
  lineHeight: '1.5rem',
  fontWeight: 500,
  color: unitTitleColorCss(titleColor),
  margin: 0,
  paddingBottom: '8px',
}));

const Description = styled('p')({
  fontFamily: CODE_ORG_TEXT_FONT_STACK,
  fontSize: '0.875rem',
  lineHeight: '1.25rem',
  color: 'var(--codeai-gray-6, #5f6872)',
  margin: 0,
  paddingBottom: '12px',
});

const GradeChip = styled('span')({
  display: 'inline-block',
  minWidth: '90px',
  padding: '2px 12px',
  border: '1px solid var(--codeai-gray-2, #e4e6e9)',
  // No CodeAI radius token this small — sm (8px) is buttons-only.
  borderRadius: '2px',
  fontFamily: CODE_ORG_TEXT_FONT_STACK,
  fontSize: '0.75rem',
  lineHeight: '1.125rem',
  fontWeight: 600,
  textAlign: 'center',
  color: 'var(--codeai-gray-8, #292f36)',
  marginBottom: '12px',
});

// Groups the grade chip and footer at the card bottom; in equal-height rows
// the flexible gap opens between the description and this block.
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

const DurationLabel = styled('span')({
  display: 'inline-flex',
  alignItems: 'center',
  gap: '6px',
  fontFamily: CODE_ORG_TEXT_FONT_STACK,
  fontSize: '0.75rem',
  lineHeight: '1.125rem',
  fontWeight: 500,
  color: 'var(--codeai-gray-6, #5f6872)',
});

// Keeps the link on the right edge when there is no duration.
const ExploreSlot = styled('span')({
  marginInlineStart: 'auto',
});

const UnitCard: React.FC<UnitCardProps> = ({
  title,
  shortDescription,
  gradeBands,
  duration,
  topics,
  image,
  link,
  showTopics = true,
  topicBadgeColor = 'purple',
  titleColor = 'black',
  fullWidth = false,
  className,
}) => {
  // Show placeholder text until a content entry is bound
  if (!title) {
    return (
      <em>
        <strong>🗂 Unit Card placeholder.</strong> Please bind a "Curriculum"
        content type entry in the Content sidebar.
      </em>
    );
  }

  const imageUrl = getAbsoluteImageUrl(image);
  const gradeBand = mergeGradeBands(gradeBands);
  const durationText = (duration ?? []).filter(Boolean).join(', ');
  const visibleTopics = showTopics ? (topics ?? []).filter(Boolean) : [];
  const linkFields = link?.fields;

  return (
    <CardRoot className={className} fullWidth={fullWidth}>
      {imageUrl && (
        <ImageArea>
          <NextImage src={imageUrl} alt="" style={{objectFit: 'cover'}} />
        </ImageArea>
      )}
      <Content>
        {visibleTopics.length > 0 && (
          <TopicsRow data-testid="unit-card-topics">
            {visibleTopics.map(topic => (
              <Badge
                key={topic}
                text={topic}
                size="small"
                color={topicBadgeColor}
                // The card interior is always white, so Badge's section-tone
                // auto-detection would pick the wrong variant on dark sections.
                appearance="dark"
              />
            ))}
          </TopicsRow>
        )}
        <Title titleColor={titleColor}>{title}</Title>
        {shortDescription && <Description>{shortDescription}</Description>}
        <BottomBlock>
          {gradeBand && <GradeChip>Grades {gradeBand}</GradeChip>}
          {(durationText || linkFields) && (
            <FooterRow>
              {durationText && (
                <DurationLabel>
                  <FontAwesomeV6Icon
                    iconName="clock"
                    iconStyle="solid"
                    style={{fontSize: '12px'}}
                    aria-hidden="true"
                  />
                  {durationText}
                </DurationLabel>
              )}
              {linkFields && (
                <ExploreSlot>
                  <Link
                    href={linkFields.primaryTarget}
                    isLinkExternal={!!linkFields.isThisAnExternalLink}
                    ariaLabel={linkFields.ariaLabel || undefined}
                    color="black"
                    size="s"
                    icon="arrow-right"
                    removeMarginBottom
                  >
                    {linkFields.label}
                  </Link>
                </ExploreSlot>
              )}
            </FooterRow>
          )}
        </BottomBlock>
      </Content>
    </CardRoot>
  );
};

export default UnitCard;
