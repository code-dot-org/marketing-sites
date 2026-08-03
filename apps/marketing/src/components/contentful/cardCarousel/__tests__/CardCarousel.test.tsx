import {useInMemoryEntities} from '@contentful/experiences-sdk-react';
import {render, screen} from '@testing-library/react';
import '@testing-library/jest-dom';

import CardCarousel, {
  CardCarouselProps,
  CardEntry,
} from '@/components/contentful/cardCarousel';

jest.mock('swiper/react', () => {
  const mockReact = jest.requireActual('react');
  return {
    Swiper: ({children}: {children: React.ReactNode}) =>
      mockReact.createElement('div', {'data-testid': 'swiper'}, children),
    SwiperSlide: ({children}: {children: React.ReactNode}) =>
      mockReact.createElement('div', {'data-testid': 'swiper-slide'}, children),
  };
});
jest.mock('swiper/modules', () => ({A11y: {}, Navigation: {}}));

// Seed the real in-memory entity store so mapEntryToCardProps resolves the
// entries' image/link reference stubs (same pattern as .storybook/preview.ts).
useInMemoryEntities().addEntities([
  {
    sys: {id: 'card-asset-1', type: 'Asset'},
    fields: {
      file: {url: '//contentful-images.code.org/x/card-asset-1/y/card.png'},
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } as any,
  {
    sys: {
      id: 'card-link-1',
      type: 'Entry',
      contentType: {sys: {type: 'Link', linkType: 'ContentType', id: 'link'}},
    },
    fields: {
      label: 'Read post',
      primaryTarget: '/post-1',
      isThisAnExternalLink: false,
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } as any,
]);

const imageStub = {sys: {type: 'Link', linkType: 'Asset', id: 'card-asset-1'}};
const linkStub = {sys: {type: 'Link', linkType: 'Entry', id: 'card-link-1'}};

const makeEntry = (
  id: string,
  contentTypeId: string,
  fields: Record<string, unknown>,
): CardEntry =>
  ({
    sys: {id, contentType: {sys: {id: contentTypeId}}},
    fields,
  }) as unknown as CardEntry;

const makeCurriculum = (id: string, title: string) =>
  makeEntry(id, 'curriculum', {
    title,
    shortDescription: `${title} description`,
    topics: ['Artificial Intelligence'],
    image: imageStub,
    primaryLinkRef: linkStub,
  });

const makeResource = (id: string, title: string) =>
  makeEntry(id, 'resourcesAndTools', {
    title,
    shortDescription: `${title} description`,
    actionBlockOverline: 'Tools',
    image: imageStub,
    primaryLinkRef: linkStub,
  });

const makePerson = (id: string, name: string) =>
  makeEntry(id, 'person', {
    name,
    bio: `${name} bio`,
    image: imageStub,
    personalLink: linkStub,
  });

const defaultProps: CardCarouselProps = {
  cards: [
    makeCurriculum('c1', 'Problem Solving with AI'),
    makeResource('r1', 'AI Teaching Assistant'),
    makePerson('p1', 'Karim Meghji'),
  ],
};

describe('CardCarousel component', () => {
  it('renders one slide per entry with level-3 card titles', () => {
    render(<CardCarousel {...defaultProps} />);
    expect(screen.getAllByTestId('swiper-slide')).toHaveLength(3);
    expect(screen.getAllByRole('heading', {level: 3})).toHaveLength(3);
  });

  it('skips entries with no title in the mapped fields', () => {
    render(
      <CardCarousel
        cards={[
          makeCurriculum('c1', 'Problem Solving with AI'),
          makeEntry('x1', 'curriculum', {shortDescription: 'No title here'}),
        ]}
      />,
    );
    expect(screen.getAllByTestId('swiper-slide')).toHaveLength(1);
    expect(screen.queryByText('No title here')).not.toBeInTheDocument();
  });

  it('maps person entries through the fallback chain', () => {
    render(<CardCarousel cards={[makePerson('p1', 'Karim Meghji')]} />);
    expect(
      screen.getByRole('heading', {level: 3, name: 'Karim Meghji'}),
    ).toBeInTheDocument();
    expect(screen.getByText('Karim Meghji bio')).toBeInTheDocument();
    expect(screen.getByRole('link', {name: 'Read post'})).toHaveAttribute(
      'href',
      '/post-1',
    );
  });

  it('maps nonstandard entries via custom field IDs', () => {
    render(
      <CardCarousel
        cards={[
          makeEntry('n1', 'video', {
            label: 'A video card',
            summary: 'Video summary',
          }),
        ]}
        titleFields="label"
        descriptionFields="summary"
      />,
    );
    expect(
      screen.getByRole('heading', {level: 3, name: 'A video card'}),
    ).toBeInTheDocument();
    expect(screen.getByText('Video summary')).toBeInTheDocument();
  });

  it('maps the badge from the overline field and omits it when absent', () => {
    render(<CardCarousel {...defaultProps} />);
    // Only the resourcesAndTools entry has actionBlockOverline.
    expect(screen.getByText('Tools')).toBeInTheDocument();
  });

  it('uses the first item of an array badge field', () => {
    render(
      <CardCarousel
        cards={[makeCurriculum('c1', 'Problem Solving with AI')]}
        badgeFields="topics"
      />,
    );
    expect(screen.getByText('Artificial Intelligence')).toBeInTheDocument();
  });

  it('truncates long descriptions at a word boundary with an ellipsis', () => {
    // Description is 'Problem Solving with AI description' (35 chars).
    render(
      <CardCarousel
        cards={[makeCurriculum('c1', 'Problem Solving with AI')]}
        maxDescriptionLength={20}
      />,
    );
    // 20-char slice is 'Problem Solving with'; the cut lands mid-word
    // boundary so it backs up to the previous space.
    expect(screen.getByText('Problem Solving…')).toBeInTheDocument();
  });

  it('leaves descriptions within the max length untouched', () => {
    render(
      <CardCarousel
        cards={[makeCurriculum('c1', 'Card')]}
        maxDescriptionLength={200}
      />,
    );
    expect(screen.getByText('Card description')).toBeInTheDocument();
  });

  it('resolves each card image through the entity store', () => {
    const {container} = render(
      <CardCarousel cards={[makeCurriculum('c1', 'Card')]} />,
    );
    const img = container.querySelector('img');
    expect(img).not.toBeNull();
    expect(decodeURIComponent(img!.getAttribute('src') || '')).toContain(
      'card.png',
    );
  });

  it('forwards card style options to every card', () => {
    render(<CardCarousel {...defaultProps} cardStyle="overlay" />);
    for (const card of screen.getAllByTestId('content-card')) {
      expect(card).toHaveAttribute('data-card-style', 'overlay');
    }
  });

  it('applies the selected badge color to card badges', () => {
    render(
      <CardCarousel
        cards={[makeResource('r1', 'AI Teaching Assistant')]}
        badgeColor="green"
      />,
    );
    expect(screen.getByText('Tools')).toHaveStyle({
      backgroundColor: 'var(--codeai-green-primary)',
    });
  });

  it('overrides every card link label with the link text override', () => {
    render(<CardCarousel {...defaultProps} linkTextOverride="Explore" />);
    expect(screen.getAllByRole('link', {name: 'Explore'})).toHaveLength(3);
    expect(screen.queryByText('Read post')).not.toBeInTheDocument();
  });

  it('defaults to 3 cards per view and reflects the option on the root', () => {
    const {rerender} = render(<CardCarousel {...defaultProps} />);
    expect(screen.getByTestId('card-carousel')).toHaveAttribute(
      'data-cards-per-view',
      '3',
    );
    rerender(<CardCarousel {...defaultProps} cardsPerView="4" />);
    expect(screen.getByTestId('card-carousel')).toHaveAttribute(
      'data-cards-per-view',
      '4',
    );
  });

  it('renders a placeholder when no cards are bound', () => {
    render(<CardCarousel />);
    expect(screen.getByText(/Card Carousel placeholder/)).toBeInTheDocument();
    expect(screen.queryByTestId('swiper')).not.toBeInTheDocument();
  });

  it('renders a placeholder when every entry is skipped', () => {
    render(
      <CardCarousel cards={[makeEntry('x1', 'curriculum', {noTitle: true})]} />,
    );
    expect(screen.getByText(/Card Carousel placeholder/)).toBeInTheDocument();
  });

  it('renders nav buttons with accessible labels and chevron icons', () => {
    render(<CardCarousel {...defaultProps} />);
    const prev = screen.getByRole('button', {name: 'Previous cards'});
    expect(prev).toBeInTheDocument();
    expect(
      screen.getByRole('button', {name: 'Next cards'}),
    ).toBeInTheDocument();
    expect(prev.querySelector('.fa-chevron-left')).not.toBeNull();
  });

  it('places nav buttons above the cards by default and below when set', () => {
    const {rerender} = render(<CardCarousel {...defaultProps} />);
    const root = screen.getByTestId('card-carousel');
    expect(root).toHaveAttribute('data-nav-position', 'top');
    const positionOf = () => {
      const prev = screen.getByRole('button', {name: 'Previous cards'});
      const swiper = screen.getByTestId('swiper');
      return prev.compareDocumentPosition(swiper) &
        Node.DOCUMENT_POSITION_FOLLOWING
        ? 'top'
        : 'bottom';
    };
    expect(positionOf()).toBe('top');
    rerender(<CardCarousel {...defaultProps} navPosition="bottom" />);
    expect(root).toHaveAttribute('data-nav-position', 'bottom');
    expect(positionOf()).toBe('bottom');
  });
});
