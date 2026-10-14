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
import {useSectionBackground} from '@/components/contentful/section/SectionBackgroundContext';
import UnitCard, {
  UnitTitleColor,
  unitTitleColorCss,
} from '@/components/contentful/unitCard';
import {
  CARD_WIDTH_PX,
  HeadingLevel,
  UnitCardType,
} from '@/components/contentful/unitCard/constants';
import {mergeGradeBands} from '@/components/contentful/unitCard/mergeGradeBands';
import {resolveContentfulLink} from '@/contentful/resolveLink';
import {CODE_ORG_TEXT_FONT_STACK} from '@/themes/code.org/typography/fontStack';
import {LinkEntry} from '@/types/contentful/entries/Link';
import {Entry} from '@/types/contentful/Entry';
import {ExperienceAsset} from '@/types/contentful/ExperienceAsset';

// Each card type accepts only its own entries; anything else bound is
// dropped.
const CONTENT_TYPE_BY_CARD_TYPE: Record<UnitCardType, string> = {
  unit: 'curriculum',
  course: 'course',
};

const NOUNS: Record<UnitCardType, {singular: string; plural: string}> = {
  unit: {singular: 'Unit', plural: 'Units'},
  course: {singular: 'Course', plural: 'Courses'},
};

// Curriculum entries carry two field vocabularies: curriculum units use
// grade/duration/topics, activity-catalog entries use ages/length/topic.
// Course entries use courseDescription and add a Marketing Link
// (secondaryLinkRef).
type CourseUnitFields = {
  title?: string;
  shortDescription?: string;
  courseDescription?: string;
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
  secondaryLinkRef?: LinkEntry;
};

export type CourseUnitEntry = Entry<CourseUnitFields>;

export interface UnitCarouselProps {
  /** Unit cards from Curriculum entries, or Course cards from Course entries */
  cardType?: UnitCardType;
  /** Course title */
  title?: string;
  /** Course description paragraph, shown beside the title */
  courseDescription?: string;
  /** Link content-type entry for the "View course details" link */
  courseDetailsLink?: LinkEntry;
  /** Course grade-band values, merged into one span in the subtitle */
  gradeBands?: string[];
  /** Curriculum entries (a Course's Units) or, for the course card type,
   *  Course entries (a Course Catalog's Courses) */
  units?: CourseUnitEntry[];
  /** Whether to render the unit count in the subtitle */
  showUnitCount?: boolean;
  /** Whether to render the topics row on every card */
  showTopics?: boolean;
  /** Overrides every card's Link entry label; empty uses the entry label */
  linkTextOverride?: string;
  /** Course title heading color */
  headingColor?: UnitTitleColor;
  /** Semantic tag for the carousel title; the visual size stays h3 */
  headingLevel?: HeadingLevel;
  /** Semantic tag for every card title; the visual size is unaffected */
  cardTitleHeadingLevel?: HeadingLevel;
  /** Custom classname */
  className?: string;
}

const Root = styled('div', {
  shouldForwardProp: prop => prop !== 'cardType',
})<{cardType: UnitCardType}>(({cardType}) => ({
  width: '100%',
  // slidesPerView="auto" takes slide width from CSS; 85vw guards tiny
  // viewports. At the 1216px content width, unit slides fit four full cards
  // plus a sliver of the fifth, course slides three plus part of a fourth. height
  // auto + flex let slides stretch to the tallest card (UnitCard fills them
  // via height: 100%).
  '& .swiper-slide': {
    width: `min(${CARD_WIDTH_PX[cardType]}px, 85vw)`,
    height: 'auto',
    display: 'flex',
  },
}));

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

// The course heading looks like a standard H3 at any semantic level
// (rendered via `as`) — everything inherits from the theme's h3 variant
// (family, weight, sizes, responsive steps); only color is custom.
const Title = styled('h3', {
  // Filtering `as` is what makes emotion swap the tag instead of forwarding
  // it as a DOM attribute.
  shouldForwardProp: prop =>
    !['as', 'headingColor', 'light'].includes(prop as string),
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
  cardType = 'unit',
  title,
  courseDescription,
  courseDetailsLink,
  gradeBands,
  units,
  showUnitCount = true,
  showTopics = true,
  linkTextOverride = 'Explore',
  headingColor = 'black',
  headingLevel = 'h3',
  cardTitleHeadingLevel = 'h4',
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
            unit?.sys?.contentType?.sys?.id ===
            CONTENT_TYPE_BY_CARD_TYPE[cardType],
        )
        .map(({sys, fields}) => {
          const image = resolveContentfulLink<ExperienceAsset>(fields.image);
          // Course cards prefer the Marketing Link; not every course has
          // one, so they fall back to the Curriculum Link.
          const resolvedLink =
            (cardType === 'course' &&
              resolveContentfulLink<LinkEntry>(fields.secondaryLinkRef)) ||
            resolveContentfulLink<LinkEntry>(fields.primaryLinkRef);
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
              cardType,
              title: fields.title,
              shortDescription:
                fields.shortDescription ?? fields.courseDescription,
              gradeBands: fields.grade ?? fields.ages,
              duration: fields.duration ?? fields.length,
              topics: fields.topics ?? fields.topic,
              image: image?.fields?.file?.url,
              link,
              showTopics,
              titleHeadingLevel: cardTitleHeadingLevel,
            },
          };
        }),
    [cardType, units, showTopics, linkTextOverride, cardTitleHeadingLevel],
  );

  const noun = NOUNS[cardType];

  // Show placeholder text until a content entry is bound
  if (!cards.length) {
    // Entries bound for the other card type are all dropped by the filter;
    // point the author at the Card Type picker instead of the binding.
    const otherType: UnitCardType = cardType === 'unit' ? 'course' : 'unit';
    const boundOtherType = (units ?? []).some(
      unit =>
        unit?.sys?.contentType?.sys?.id ===
        CONTENT_TYPE_BY_CARD_TYPE[otherType],
    );
    return (
      <em>
        <strong>🎠 Curriculum Carousel placeholder.</strong>{' '}
        {boundOtherType
          ? `These are ${NOUNS[otherType].singular} entries. Set Card Type to ${NOUNS[otherType].singular} in the Design tab.`
          : cardType === 'course'
            ? 'Please bind a "Course Catalog" content type entry with Courses in the Content sidebar.'
            : 'Please bind a "Course" entry (Units) or a "Course Catalog" entry (Courses) in the Content sidebar.'}
      </em>
    );
  }

  const linkFields =
    courseDetailsLink?.fields?.label && courseDetailsLink.fields.primaryTarget
      ? courseDetailsLink.fields
      : undefined;

  // Course cards show their own grade bands, so the pathway summary is
  // unit-only.
  const gradeBand = cardType === 'unit' && mergeGradeBands(gradeBands);
  const subtitle = [
    showUnitCount &&
      `${cards.length} ${cards.length === 1 ? noun.singular : noun.plural}`,
    gradeBand && `Grades ${gradeBand} Pathway`,
  ]
    .filter(Boolean)
    .join(' • ');

  return (
    <Root className={className} cardType={cardType}>
      <Header>
        <HeaderInfo>
          {title && (
            <Title
              as={headingLevel}
              headingColor={headingColor}
              light={onDarkSection}
            >
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
              ariaLabel={`Previous ${noun.plural.toLowerCase()}`}
              onClick={() => undefined}
            />
            <NavIconButton
              id={`${carouselId}-next`}
              type="secondary"
              color="purple"
              size="l"
              isIconOnly
              icon={{iconName: 'chevron-right', iconStyle: 'solid'}}
              ariaLabel={`Next ${noun.plural.toLowerCase()}`}
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
            prevSlideMessage: `Previous ${noun.plural.toLowerCase()}`,
            nextSlideMessage: `Next ${noun.plural.toLowerCase()}`,
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
