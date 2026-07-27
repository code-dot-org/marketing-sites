'use client';

import {styled} from '@mui/material/styles';
import React, {useId, useMemo, useState} from 'react';
import type {Swiper as SwiperInstance} from 'swiper';
import {A11y, Navigation} from 'swiper/modules';
import {Swiper, SwiperSlide} from 'swiper/react';

import 'swiper/css';

import NavIconButton, {
  LinkButton,
} from '@code-dot-org/component-library/button';

import {backgroundToneFor} from '@/components/common/colors';
import {CardBadgeColor} from '@/components/contentful/badge/constants';
import {useSectionBackground} from '@/components/contentful/section/SectionBackgroundContext';
import UnitCard, {
  UnitTitleColor,
  unitTitleColorCss,
} from '@/components/contentful/unitCard';
import {mergeGradeBands} from '@/components/contentful/unitCard/mergeGradeBands';
import {resolveContentfulLink} from '@/contentful/resolveLink';
import {CODE_ORG_TEXT_FONT_STACK} from '@/themes/code.org/typography/fontStack';
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
  /** Course description paragraph, shown beside the title */
  courseDescription?: string;
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
  topicBadgeColor?: CardBadgeColor;
  /** Overrides every card's Link entry label; empty uses the entry label */
  linkTextOverride?: string;
  /** Title color applied to every card's unit title */
  unitTitleColor?: UnitTitleColor;
  /** Course title heading color */
  headingColor?: UnitTitleColor;
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

// Header row: course info (title, metadata, description) on the left taking
// all leftover width, actions (details button, nav arrows) in an auto-width
// right column. Default stretch alignment gives both columns equal height.
const Header = styled('div')(({theme}) => ({
  display: 'flex',
  flexWrap: 'wrap',
  gap: '2rem',
  marginBottom: '24px',
  // Mobile: stack vertically — actions drop below the heading content.
  [theme.breakpoints.down('sm')]: {
    flexDirection: 'column',
  },
}));

const HeaderInfo = styled('div')(({theme}) => ({
  flex: '1 1 260px',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'flex-start',
  // Mobile: the header stacks vertically, so the 260px flex-basis would
  // become a min-height — size to content instead.
  [theme.breakpoints.down('sm')]: {
    flex: '0 0 auto',
  },
}));

// Details button pinned to the top, nav arrows to the bottom (margin-top
// auto on NavButtons), both aligned to the right edge. margin-inline-start
// keeps the column on the right when flex-wrap drops it to its own row.
const HeaderActions = styled('div')(({theme}) => ({
  flex: '0 0 auto',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'flex-end',
  rowGap: '16px',
  marginInlineStart: 'auto',
  // Mobile: single row under the heading content — details button on the
  // left, nav arrows on the right, vertically centered. Wraps on its own
  // when the pair doesn't fit.
  [theme.breakpoints.down('sm')]: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '16px',
    alignSelf: 'stretch',
    marginInlineStart: 0,
  },
}));

// Default paragraph style (theme body2), left aligned.
const DescriptionParagraph = styled('p', {
  shouldForwardProp: prop => prop !== 'light',
})<{light?: boolean}>(({theme, light}) => ({
  ...theme.typography.body2,
  textAlign: 'left',
  color: light ? '#ffffff' : '#000000',
  maxWidth: '550px',
  margin: '8px 0 0',
}));

// The course heading is a standard H3 — everything inherits from the theme's
// h3 variant (family, weight, sizes, responsive steps); only color is custom.
const Title = styled('h3', {
  shouldForwardProp: prop => prop !== 'headingColor' && prop !== 'light',
})<{headingColor: UnitTitleColor; light?: boolean}>(
  ({theme, headingColor, light}) => ({
    ...theme.typography.h3,
    // Black contrast-switches to white on dark Sections; explicit family
    // picks pass through (same rule as the cards' titles).
    color:
      light && headingColor === 'black'
        ? '#ffffff'
        : unitTitleColorCss(headingColor),
    margin: 0,
  }),
);

const Subtitle = styled('p', {
  shouldForwardProp: prop => prop !== 'light',
})<{light?: boolean}>(({light}) => ({
  fontFamily: CODE_ORG_TEXT_FONT_STACK,
  fontSize: '0.875rem',
  lineHeight: '1.25rem',
  color: light ? '#ffffff' : 'var(--codeai-gray-6, #5f6872)',
  margin: '4px 0 0',
}));

// Nav arrows are design-system icon-only buttons (secondary purple, size l).
// Swiper drives their disabled state through the id selectors.
const NavButtons = styled('div')(({theme}) => ({
  display: 'flex',
  gap: '6px',
  flexShrink: 0,
  // Sinks to the bottom of the stretched actions column.
  marginTop: 'auto',
  // Mobile: the actions column becomes a centered row — drop the auto
  // margin so the arrows don't pin to the row's cross-axis bottom.
  [theme.breakpoints.down('sm')]: {
    marginTop: 0,
  },
  // Swiper's watchOverflow adds this class when every card already fits.
  '& .swiper-button-lock': {
    display: 'none',
  },
  'html[dir="rtl"] & svg, html[dir="rtl"] & i': {
    transform: 'scaleX(-1)',
  },
}));

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
  courseDescription,
  courseDetailsLink,
  gradeBands,
  units,
  showUnitCount = true,
  showTopics = true,
  topicBadgeColor = 'purple',
  linkTextOverride = 'Explore',
  unitTitleColor = 'black',
  headingColor = 'black',
  className,
}) => {
  const carouselId = `id-${useId().replaceAll(':', '')}`;

  // Header text (title, details link, subtitle) sits directly on the Section
  // background — the cards are white surfaces and stay fixed. The Course
  // Catalog renders outside the custom Section, so the context is empty
  // there and this never flips.
  const enclosingBackground = useSectionBackground();
  const onDarkSection =
    enclosingBackground !== 'transparent' &&
    backgroundToneFor(enclosingBackground) === 'dark';

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
          // Link Text Override relabels every card's link; when cleared, the
          // bound Link entry's label shows. Target and aria label always stay
          // inherited from the entry.
          const link =
            resolvedLink?.fields &&
            (linkTextOverride
              ? {
                  ...resolvedLink,
                  fields: {...resolvedLink.fields, label: linkTextOverride},
                }
              : resolvedLink);
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
              titleColor: unitTitleColor,
            },
          };
        }),
    [units, showTopics, topicBadgeColor, linkTextOverride, unitTitleColor],
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
        <HeaderInfo>
          {title && (
            <Title headingColor={headingColor} light={onDarkSection}>
              {title}
            </Title>
          )}
          {subtitle && <Subtitle light={onDarkSection}>{subtitle}</Subtitle>}
          {courseDescription && (
            <DescriptionParagraph light={onDarkSection}>
              {courseDescription}
            </DescriptionParagraph>
          )}
        </HeaderInfo>
        <HeaderActions>
          {linkFields && (
            <LinkButton
              text={linkFields.label}
              type="primary"
              color="purple"
              size="m"
              href={linkFields.primaryTarget}
              target={linkFields.isThisAnExternalLink ? '_blank' : undefined}
              iconRight={{iconName: 'angle-right', iconStyle: 'solid'}}
              ariaLabel={linkFields.ariaLabel || undefined}
            />
          )}
          <NavButtons>
            {/* Swiper binds the real click handlers to these ids; the no-op
              onClick only satisfies GenericButton's non-link contract. */}
            <NavIconButton
              id={`${carouselId}-prev`}
              type="secondary"
              color="purple"
              size="l"
              isIconOnly
              icon={{iconName: 'chevron-left', iconStyle: 'solid'}}
              ariaLabel="Previous units"
              onClick={() => undefined}
            />
            <NavIconButton
              id={`${carouselId}-next`}
              type="secondary"
              color="purple"
              size="l"
              isIconOnly
              icon={{iconName: 'chevron-right', iconStyle: 'solid'}}
              ariaLabel="Next units"
              onClick={() => undefined}
            />
          </NavButtons>
        </HeaderActions>
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
