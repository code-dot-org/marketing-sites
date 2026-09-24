'use client';

import {styled} from '@mui/material/styles';
import React, {useId, useMemo, useState} from 'react';
import type {Swiper as SwiperInstance} from 'swiper';
import {A11y, Navigation} from 'swiper/modules';
import {Swiper, SwiperSlide} from 'swiper/react';

import 'swiper/css';

import NavIconButton from '@code-dot-org/component-library/button';

import {backgroundToneFor} from '@/components/common/colors';
import ActivityCard, {
  ActivityCardProps,
} from '@/components/contentful/activityCard';
import {cardWidthCss} from '@/components/contentful/activityCard/cardWidth';
import {CardBadgeColor} from '@/components/contentful/badge/constants';
import {useSectionBackground} from '@/components/contentful/section/SectionBackgroundContext';
import {resolveContentfulLink} from '@/contentful/resolveLink';
import {LinkEntry} from '@/types/contentful/entries/Link';
import {Entry} from '@/types/contentful/Entry';
import {ExperienceAsset} from '@/types/contentful/ExperienceAsset';

const ACTIVITY_CONTENT_TYPE_ID = 'activity';

type ActivityFields = {
  title?: string;
  shortDescription?: string;
  organization?: string;
  ages?: string[];
  topic?: string[];
  activityType?: string[];
  length?: string[];
  tutorialID?: string;
  // References arrive from the Experiences entity store as unresolved
  // {sys: {type: 'Link'}} stubs — resolved via resolveContentfulLink.
  image?: ExperienceAsset;
  primaryLinkRef?: LinkEntry;
  secondaryLinkRef?: LinkEntry;
};

export type ActivityEntry = Entry<ActivityFields>;

type CardToggles = Pick<
  ActivityCardProps,
  | 'showOrganization'
  | 'showAges'
  | 'showTopics'
  | 'showActivityType'
  | 'showLength'
  | 'showTutorialLink'
  | 'showTeacherLink'
>;

export interface ActivityCarouselProps extends CardToggles {
  /** Activity entries, e.g. from a List entry's items */
  activities?: ActivityEntry[];
  /** Width of every card in px or %; empty or invalid is auto */
  cardWidth?: string;
  /** Organization badge color on every card */
  organizationBadgeColor?: CardBadgeColor;
  /** Overrides every card's tutorial link label; empty uses the entry label */
  tutorialLinkTextOverride?: string;
  /** Overrides every card's teacher link label; empty uses the entry label */
  teacherLinkTextOverride?: string;
  /** Title color applied to every card */
  activityTitleColor?: string;
  /** Custom classname */
  className?: string;
}

const Root = styled('div', {
  shouldForwardProp: prop => prop !== 'slideWidth',
})<{slideWidth: string}>(({slideWidth}) => ({
  width: '100%',
  // slidesPerView="auto" takes slide width from CSS; the card fills its slide.
  '& .swiper-slide': {
    width: slideWidth === 'auto' ? 'auto' : `min(${slideWidth}, 85vw)`,
    height: 'auto',
    display: 'flex',
  },
}));

const NavButtons = styled('div')({
  display: 'flex',
  justifyContent: 'flex-end',
  gap: '6px',
  marginBottom: '24px',
  // Swiper's watchOverflow adds this class when every card already fits.
  '& .swiper-button-lock': {
    display: 'none',
  },
  'html[dir="rtl"] & svg, html[dir="rtl"] & i': {
    transform: 'scaleX(-1)',
  },
});

const END_FADE_WIDTH = '56px';

// Fades the clipped card at the trailing edge while more cards remain.
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

const relabel = (link: LinkEntry | undefined, label: string | undefined) =>
  link?.fields && label ? {...link, fields: {...link.fields, label}} : link;

const ActivityCarousel: React.FC<ActivityCarouselProps> = ({
  activities,
  cardWidth,
  showOrganization = true,
  showAges = true,
  showTopics = true,
  showActivityType = true,
  showLength = true,
  showTutorialLink = true,
  showTeacherLink = true,
  organizationBadgeColor = 'blueLight',
  tutorialLinkTextOverride,
  teacherLinkTextOverride,
  activityTitleColor = 'purpleDark',
  className,
}) => {
  const carouselId = `id-${useId().replaceAll(':', '')}`;

  // The nav arrows sit on the Section background; the cards stay white.
  const enclosingBackground = useSectionBackground();
  const onDarkSection =
    enclosingBackground !== 'transparent' &&
    backgroundToneFor(enclosingBackground) === 'dark';

  const [showEndFade, setShowEndFade] = useState(false);
  const updateEndFade = (swiper: SwiperInstance) => {
    setShowEndFade(!swiper.isLocked && swiper.progress < 0.999);
  };

  const cards = useMemo(
    () =>
      (activities ?? [])
        .filter(
          activity =>
            activity?.sys?.contentType?.sys?.id === ACTIVITY_CONTENT_TYPE_ID,
        )
        .map(({sys, fields}): {id: string; props: ActivityCardProps} => {
          const image = resolveContentfulLink<ExperienceAsset>(fields.image);
          return {
            id: sys.id,
            props: {
              title: fields.title,
              shortDescription: fields.shortDescription,
              organization: fields.organization,
              ages: fields.ages,
              topics: fields.topic,
              activityType: fields.activityType,
              length: fields.length,
              image: image?.fields?.file?.url,
              tutorialLink: relabel(
                resolveContentfulLink<LinkEntry>(fields.primaryLinkRef),
                tutorialLinkTextOverride,
              ),
              teacherLink: relabel(
                resolveContentfulLink<LinkEntry>(fields.secondaryLinkRef),
                teacherLinkTextOverride,
              ),
              tutorialId: fields.tutorialID,
              showOrganization,
              showAges,
              showTopics,
              showActivityType,
              showLength,
              showTutorialLink,
              showTeacherLink,
              organizationBadgeColor,
              titleColor: activityTitleColor,
              // The slide carries the width; the card fills it.
              width: '100%',
            },
          };
        }),
    [
      activities,
      tutorialLinkTextOverride,
      teacherLinkTextOverride,
      showOrganization,
      showAges,
      showTopics,
      showActivityType,
      showLength,
      showTutorialLink,
      showTeacherLink,
      organizationBadgeColor,
      activityTitleColor,
    ],
  );

  // Show placeholder text until a content entry is bound
  if (!cards.length) {
    return (
      <em>
        <strong>🎠 Activity Carousel placeholder.</strong> Please bind a
        &quot;List&quot; entry&apos;s items (Activity entries) in the Content
        sidebar.
      </em>
    );
  }

  const buttonColor = onDarkSection ? 'white' : 'purple';

  return (
    <Root className={className} slideWidth={cardWidthCss(cardWidth)}>
      <NavButtons>
        {/* Swiper binds the real click handlers to these ids; the no-op
          onClick only satisfies GenericButton's non-link contract. */}
        <NavIconButton
          id={`${carouselId}-prev`}
          type="secondary"
          color={buttonColor}
          size="l"
          isIconOnly
          icon={{iconName: 'chevron-left', iconStyle: 'solid'}}
          ariaLabel="Previous activities"
          onClick={() => undefined}
        />
        <NavIconButton
          id={`${carouselId}-next`}
          type="secondary"
          color={buttonColor}
          size="l"
          isIconOnly
          icon={{iconName: 'chevron-right', iconStyle: 'solid'}}
          ariaLabel="Next activities"
          onClick={() => undefined}
        />
      </NavButtons>
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
            prevSlideMessage: 'Previous activities',
            nextSlideMessage: 'Next activities',
          }}
          onSwiper={updateEndFade}
          onProgress={updateEndFade}
          onResize={updateEndFade}
          onLock={updateEndFade}
          onUnlock={updateEndFade}
        >
          {cards.map(({id, props}) => (
            <SwiperSlide key={id}>
              <ActivityCard {...props} />
            </SwiperSlide>
          ))}
        </Swiper>
      </CarouselViewport>
    </Root>
  );
};

export default ActivityCarousel;
