'use client';

import {styled} from '@mui/material/styles';
import React, {useId, useMemo, useRef, useState} from 'react';
import type {Swiper as SwiperInstance} from 'swiper';
import {A11y, Navigation} from 'swiper/modules';
import {Swiper, SwiperSlide} from 'swiper/react';

import 'swiper/css';

import NavIconButton from '@code-dot-org/component-library/button';

import {CardBadgeColor} from '@/components/contentful/badge/constants';
import ContentCard, {
  ContentCardColor,
  ContentCardStyle,
  ContentCardTitleAppearance,
  ContentCardTitleCase,
} from '@/components/contentful/contentCard';

import {
  CardEntry,
  DEFAULT_FIELD_MAPPING,
  FieldMapping,
  mapEntryToCardProps,
} from './mapEntryToCardProps';
import {useEqualOverlayPanelHeights} from './useEqualOverlayPanelHeights';

export const CARD_CAROUSEL_CARDS_PER_VIEW = ['3', '4'] as const;
export type CardCarouselCardsPerView =
  (typeof CARD_CAROUSEL_CARDS_PER_VIEW)[number];

export const CARD_CAROUSEL_NAV_POSITIONS = ['top', 'bottom'] as const;
export type CardCarouselNavPosition =
  (typeof CARD_CAROUSEL_NAV_POSITIONS)[number];

export interface CardCarouselProps {
  /** Entries of any content type; each becomes one card */
  cards?: CardEntry[];
  /** Full cards visible at the full content width */
  cardsPerView?: CardCarouselCardsPerView;
  /** Nav arrows above the cards (right-aligned) or below (left-aligned) */
  navPosition?: CardCarouselNavPosition;
  /** Comma-separated field ID(s) each card's title is read from */
  titleFields?: string;
  /** Comma-separated field ID(s) each card's description is read from */
  descriptionFields?: string;
  /** Comma-separated field ID(s) each card's image is read from */
  imageFields?: string;
  /** Comma-separated field ID(s) each card's link is read from */
  linkFields?: string;
  /** Comma-separated field ID(s) each card's badge is read from */
  badgeFields?: string;
  /** Truncates card descriptions to this many characters at a word boundary */
  maxDescriptionLength?: number;
  /** Card style options forwarded to every card */
  cardStyle?: ContentCardStyle;
  badgeColor?: CardBadgeColor;
  titleColor?: ContentCardColor;
  titleCase?: ContentCardTitleCase;
  titleAppearance?: ContentCardTitleAppearance;
  linkTextOverride?: string;
  linkIconOverride?: string;
  linkColor?: ContentCardColor;
  titleOverlay?: boolean;
  /** Custom classname */
  className?: string;
}

const SLIDE_WIDTHS: Record<CardCarouselCardsPerView, string> = {
  '3': '352px',
  '4': '264px',
};

const Root = styled('div', {
  shouldForwardProp: (prop: string) => prop !== 'cardsPerView',
})<{cardsPerView: CardCarouselCardsPerView}>(({cardsPerView}) => ({
  width: '100%',
  // slidesPerView="auto" takes slide width from CSS; 85vw guards tiny
  // viewports. At the 1216px content width with 32px gaps, 352px fits three
  // full cards plus a 64px sliver of the fourth; 264px fits four plus a
  // 32px sliver of the fifth (Unit Carousel parity). height auto + flex let
  // slides stretch to the tallest card (ContentCard fills via height: 100%).
  '& .swiper-slide': {
    width: `min(${SLIDE_WIDTHS[cardsPerView]}, 85vw)`,
    height: 'auto',
    display: 'flex',
  },
}));

// Nav arrows are design-system icon-only buttons (secondary purple, size l),
// mirroring the Unit Carousel's. Swiper drives their disabled state through
// the id selectors.
const NavButtons = styled('div', {
  shouldForwardProp: (prop: string) => prop !== 'navPosition',
})<{navPosition: CardCarouselNavPosition}>(({navPosition}) => ({
  display: 'flex',
  gap: '6px',
  flexShrink: 0,
  ...(navPosition === 'top'
    ? {justifyContent: 'flex-end', marginBottom: '24px'}
    : {justifyContent: 'flex-start', marginTop: '24px'}),
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

const CardCarousel: React.FC<CardCarouselProps> = ({
  cards,
  cardsPerView = '3',
  navPosition = 'top',
  titleFields = DEFAULT_FIELD_MAPPING.titleFields,
  descriptionFields = DEFAULT_FIELD_MAPPING.descriptionFields,
  imageFields = DEFAULT_FIELD_MAPPING.imageFields,
  linkFields = DEFAULT_FIELD_MAPPING.linkFields,
  badgeFields = DEFAULT_FIELD_MAPPING.badgeFields,
  maxDescriptionLength,
  cardStyle,
  badgeColor,
  titleColor,
  titleCase,
  titleAppearance,
  linkTextOverride,
  linkIconOverride,
  linkColor,
  titleOverlay,
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

  const mappedCards = useMemo(() => {
    const mapping: FieldMapping = {
      titleFields,
      descriptionFields,
      imageFields,
      linkFields,
      badgeFields,
    };
    return (cards ?? [])
      .map(entry => mapEntryToCardProps(entry, mapping, maxDescriptionLength))
      .filter(card => card !== undefined);
  }, [
    cards,
    titleFields,
    descriptionFields,
    imageFields,
    linkFields,
    badgeFields,
    maxDescriptionLength,
  ]);

  // Overlay glass panels have content-driven heights; equalize them across
  // the carousel so every card's panel matches the tallest.
  const rootRef = useRef<HTMLDivElement>(null);
  useEqualOverlayPanelHeights(
    rootRef,
    cardStyle === 'overlay',
    mappedCards.length,
  );

  // Show placeholder text until content entries are bound
  if (!mappedCards.length) {
    return (
      <em>
        <strong>🎠 Card Carousel placeholder.</strong> Please bind entries to
        the Cards field in the Content sidebar.
      </em>
    );
  }

  // Style options applied uniformly to every card; undefined values fall
  // back to ContentCard's own defaults.
  const styleProps = {
    cardStyle,
    badgeColor,
    titleColor,
    titleCase,
    titleAppearance,
    linkTextOverride,
    linkIconOverride,
    linkColor,
    titleOverlay,
  };

  const navButtons = (
    <NavButtons navPosition={navPosition}>
      {/* Swiper binds the real click handlers to these ids; the no-op
          onClick only satisfies GenericButton's non-link contract. */}
      <NavIconButton
        id={`${carouselId}-prev`}
        type="secondary"
        color="purple"
        size="l"
        isIconOnly
        icon={{iconName: 'chevron-left', iconStyle: 'solid'}}
        ariaLabel="Previous cards"
        onClick={() => undefined}
      />
      <NavIconButton
        id={`${carouselId}-next`}
        type="secondary"
        color="purple"
        size="l"
        isIconOnly
        icon={{iconName: 'chevron-right', iconStyle: 'solid'}}
        ariaLabel="Next cards"
        onClick={() => undefined}
      />
    </NavButtons>
  );

  return (
    <Root
      ref={rootRef}
      cardsPerView={cardsPerView}
      data-testid="card-carousel"
      data-cards-per-view={cardsPerView}
      data-nav-position={navPosition}
      className={className}
    >
      {navPosition === 'top' && navButtons}
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
            prevSlideMessage: 'Previous cards',
            nextSlideMessage: 'Next cards',
          }}
          onSwiper={updateEndFade}
          onProgress={updateEndFade}
          onResize={updateEndFade}
          onLock={updateEndFade}
          onUnlock={updateEndFade}
        >
          {mappedCards.map(({id, props}) => (
            <SwiperSlide key={id}>
              <ContentCard {...props} {...styleProps} />
            </SwiperSlide>
          ))}
        </Swiper>
      </CarouselViewport>
      {navPosition === 'bottom' && navButtons}
    </Root>
  );
};

export default CardCarousel;
