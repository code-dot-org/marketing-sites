'use client';

import {styled} from '@mui/material/styles';
import React, {useId, useMemo, useState} from 'react';
import type {Swiper as SwiperInstance} from 'swiper';
import {A11y, Navigation} from 'swiper/modules';
import {Swiper, SwiperSlide} from 'swiper/react';

import 'swiper/css';

import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';

import {BadgeColor} from '@/components/contentful/badge/Badge';
import Link from '@/components/contentful/link';
import UnitCard from '@/components/contentful/unitCard';
import {mergeGradeBands} from '@/components/contentful/unitCard/mergeGradeBands';
import {resolveContentfulLink} from '@/contentful/resolveLink';
import {
  CODE_ORG_DISPLAY_FONT_STACK,
  CODE_ORG_TEXT_FONT_STACK,
} from '@/themes/code.org/typography/fontStack';
import {LinkEntry} from '@/types/contentful/entries/Link';
import {Entry} from '@/types/contentful/Entry';
import {ExperienceAsset} from '@/types/contentful/ExperienceAsset';

const CURRICULUM_CONTENT_TYPE_ID = 'curriculum';

// Curriculum entries carry two field vocabularies: curriculum units use
// grade/duration/topics, activity-catalog entries use ages/length/topic.
type CourseUnitFields = {
  title?: string;
  shortDescription?: string;
  grade?: string[];
  ages?: string[];
  duration?: string[];
  length?: string[];
  topics?: string[];
  topic?: string[];
  // References arrive from the Experiences entity store as unresolved
  // {sys: {type: 'Link'}} stubs — resolved via resolveContentfulLink.
  image?: ExperienceAsset;
  primaryLinkRef?: LinkEntry;
};

export type CourseUnitEntry = Entry<CourseUnitFields>;

export interface UnitCarouselProps {
  /** Course title */
  title?: string;
  /** Link content-type entry for the "View course details" link */
  courseDetailsLink?: LinkEntry;
  /** Course grade-band values, merged into one span in the subtitle */
  gradeBands?: string[];
  /** Curriculum entries from the Course entry's Units field */
  units?: CourseUnitEntry[];
  /** Whether to render the unit count in the subtitle */
  showUnitCount?: boolean;
  /** Whether to render the topics row on every card */
  showTopics?: boolean;
  /** Badge color applied to every topic on every card */
  topicBadgeColor?: BadgeColor;
  /** Custom classname */
  className?: string;
}

const Root = styled('div')({
  width: '100%',
  // slidesPerView="auto" takes slide width from CSS; 85vw guards tiny
  // viewports. 264px fits four full cards plus a 32px sliver of the fifth
  // at the 1216px content width. height auto + flex let slides stretch to
  // the tallest card (UnitCard fills them via height: 100%).
  '& .swiper-slide': {
    width: 'min(264px, 85vw)',
    height: 'auto',
    display: 'flex',
  },
});

const Header = styled('div')({
  display: 'flex',
  flexWrap: 'wrap',
  alignItems: 'flex-end',
  justifyContent: 'space-between',
  gap: '24px',
  marginBottom: '24px',
});

const TitleRow = styled('div')({
  display: 'flex',
  alignItems: 'baseline',
  flexWrap: 'wrap',
  columnGap: '16px',
  rowGap: '4px',
});

const Title = styled('h2')({
  fontFamily: CODE_ORG_DISPLAY_FONT_STACK,
  fontSize: '1.5rem',
  lineHeight: '2rem',
  fontWeight: 600,
  color: 'var(--codeai-gray-8, #292f36)',
  margin: 0,
});

const Subtitle = styled('p')({
  fontFamily: CODE_ORG_TEXT_FONT_STACK,
  fontSize: '0.875rem',
  lineHeight: '1.25rem',
  color: 'var(--codeai-gray-6, #5f6872)',
  margin: '4px 0 0',
});

const NavButtons = styled('div')({
  display: 'flex',
  gap: '16px',
  flexShrink: 0,
});

const NavButton = styled('button')({
  width: '56px',
  height: '56px',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  border: '1px solid var(--codeai-gray-2, #e4e6e9)',
  borderRadius: '50%',
  backgroundColor: '#ffffff',
  color: 'var(--codeai-gray-8, #292f36)',
  cursor: 'pointer',
  fontSize: '20px',
  '&:hover:not(:disabled)': {
    backgroundColor: 'var(--codeai-gray-1, #f2f2f2)',
  },
  '&:disabled': {
    cursor: 'not-allowed',
    color: 'var(--codeai-gray-4, #a0a7ae)',
  },
  // Swiper's watchOverflow adds this class when every card already fits.
  '&.swiper-button-lock': {
    display: 'none',
  },
  'html[dir="rtl"] & svg, html[dir="rtl"] & i': {
    transform: 'scaleX(-1)',
  },
});

// Narrow enough that at the exact content width it only covers the peeking
// sliver and trailing gap, never the last fully visible card.
const END_FADE_WIDTH = '56px';

// Fades the clipped card out at the trailing edge to signal there is more to
// scroll — masking the content works over any page background. Removed once
// the last card is fully visible.
const CarouselViewport = styled('div', {
  shouldForwardProp: prop => prop !== 'showEndFade',
})<{showEndFade: boolean}>(({showEndFade}) => {
  const mask = (direction: string) =>
    `linear-gradient(to ${direction}, #000 calc(100% - ${END_FADE_WIDTH}), transparent)`;
  return showEndFade
    ? {
        maskImage: mask('right'),
        WebkitMaskImage: mask('right'),
        'html[dir="rtl"] &': {
          maskImage: mask('left'),
          WebkitMaskImage: mask('left'),
        },
      }
    : {};
});

const UnitCarousel: React.FC<UnitCarouselProps> = ({
  title,
  courseDetailsLink,
  gradeBands,
  units,
  showUnitCount = true,
  showTopics = true,
  topicBadgeColor = 'purple',
  className,
}) => {
  const carouselId = `id-${useId().replaceAll(':', '')}`;

  // Fade the trailing edge only while more cards remain to scroll to.
  // Driven by progress (fires on every translate change, including drags
  // and slide-set updates) rather than discrete slide changes.
  const [showEndFade, setShowEndFade] = useState(false);
  const updateEndFade = (swiper: SwiperInstance) => {
    // isLocked covers the everything-fits case (same signal that hides the
    // arrows), progress < 1 covers reaching the end by any scroll method.
    setShowEndFade(!swiper.isLocked && swiper.progress < 0.999);
  };

  const cards = useMemo(
    () =>
      (units ?? [])
        .filter(
          unit =>
            unit?.sys?.contentType?.sys?.id === CURRICULUM_CONTENT_TYPE_ID,
        )
        .map(({sys, fields}) => {
          const image = resolveContentfulLink<ExperienceAsset>(fields.image);
          const resolvedLink = resolveContentfulLink<LinkEntry>(
            fields.primaryLinkRef,
          );
          // Carousel cards always label the link "Explore"; target and aria
          // label stay inherited from the bound Link entry.
          const link = resolvedLink?.fields && {
            ...resolvedLink,
            fields: {...resolvedLink.fields, label: 'Explore'},
          };
          return {
            id: sys.id,
            props: {
              title: fields.title,
              shortDescription: fields.shortDescription,
              gradeBands: fields.grade ?? fields.ages,
              duration: fields.duration ?? fields.length,
              topics: fields.topics ?? fields.topic,
              image: image?.fields?.file?.url,
              link,
              showTopics,
              topicBadgeColor,
            },
          };
        }),
    [units, showTopics, topicBadgeColor],
  );

  // Show placeholder text until a content entry is bound
  if (!cards.length) {
    return (
      <em>
        <strong>🎠 Unit Carousel placeholder.</strong> Please bind a "Course"
        content type entry with Units in the Content sidebar.
      </em>
    );
  }

  const linkFields =
    courseDetailsLink?.fields?.label && courseDetailsLink.fields.primaryTarget
      ? courseDetailsLink.fields
      : undefined;

  const gradeBand = mergeGradeBands(gradeBands);
  const subtitle = [
    showUnitCount && `${cards.length} ${cards.length === 1 ? 'Unit' : 'Units'}`,
    gradeBand && `Grades ${gradeBand} Pathway`,
  ]
    .filter(Boolean)
    .join(' • ');

  return (
    <Root className={className}>
      <Header>
        <div>
          <TitleRow>
            {title && <Title>{title}</Title>}
            {linkFields && (
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
            )}
          </TitleRow>
          {subtitle && <Subtitle>{subtitle}</Subtitle>}
        </div>
        <NavButtons>
          <NavButton id={`${carouselId}-prev`} aria-label="Previous units">
            <FontAwesomeV6Icon iconName="arrow-left" iconStyle="solid" />
          </NavButton>
          <NavButton id={`${carouselId}-next`} aria-label="Next units">
            <FontAwesomeV6Icon iconName="arrow-right" iconStyle="solid" />
          </NavButton>
        </NavButtons>
      </Header>
      <CarouselViewport showEndFade={showEndFade}>
        <Swiper
          modules={[Navigation, A11y]}
          slidesPerView="auto"
          spaceBetween={32}
          navigation={{
            prevEl: `#${carouselId}-prev`,
            nextEl: `#${carouselId}-next`,
          }}
          // The A11y module rewrites the nav buttons' aria-labels; keep ours.
          a11y={{
            prevSlideMessage: 'Previous units',
            nextSlideMessage: 'Next units',
          }}
          onSwiper={updateEndFade}
          onProgress={updateEndFade}
          onResize={updateEndFade}
          onLock={updateEndFade}
          onUnlock={updateEndFade}
        >
          {cards.map(({id, props}) => (
            <SwiperSlide key={id}>
              <UnitCard {...props} />
            </SwiperSlide>
          ))}
        </Swiper>
      </CarouselViewport>
    </Root>
  );
};

export default UnitCarousel;
