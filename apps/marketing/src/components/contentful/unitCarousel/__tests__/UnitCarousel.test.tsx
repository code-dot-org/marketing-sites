import {useInMemoryEntities} from '@contentful/experiences-sdk-react';
import {render, screen} from '@testing-library/react';
import '@testing-library/jest-dom';

import UnitCarousel, {
  CourseUnitEntry,
  UnitCarouselProps,
} from '@/components/contentful/unitCarousel';
import {LinkEntry} from '@/types/contentful/entries/Link';

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

// Seed the real in-memory entity store so resolveContentfulLink resolves the
// units' image/link reference stubs (same pattern as .storybook/preview.ts).
useInMemoryEntities().addEntities([
  {
    sys: {id: 'unit-asset-1', type: 'Asset'},
    fields: {
      file: {url: '//contentful-images.code.org/x/unit-asset-1/y/unit.png'},
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } as any,
  {
    sys: {
      id: 'unit-link-1',
      type: 'Entry',
      contentType: {sys: {type: 'Link', linkType: 'ContentType', id: 'link'}},
    },
    fields: {
      label: 'Explore this unit',
      primaryTarget: '/unit-1',
      isThisAnExternalLink: false,
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } as any,
]);

const makeUnit = (
  id: string,
  title: string,
  fields: Record<string, unknown> = {},
): CourseUnitEntry =>
  ({
    sys: {
      id,
      contentType: {sys: {id: 'curriculum'}},
    },
    fields: {
      title,
      shortDescription: `${title} description`,
      grade: ['9-10'],
      duration: ['15 Hours'],
      topics: ['Artificial Intelligence'],
      image: {sys: {type: 'Link', linkType: 'Asset', id: 'unit-asset-1'}},
      primaryLinkRef: {
        sys: {type: 'Link', linkType: 'Entry', id: 'unit-link-1'},
      },
      ...fields,
    },
  }) as unknown as CourseUnitEntry;

const courseDetailsLink = {
  fields: {
    label: 'View course details',
    primaryTarget: '/ai-foundations',
    isThisAnExternalLink: false,
  },
} as LinkEntry;

const defaultProps: UnitCarouselProps = {
  title: 'AI Foundations',
  courseDetailsLink,
  gradeBands: ['9-10', '11-12'],
  units: [
    makeUnit('u1', 'Problem Solving with AI'),
    makeUnit('u2', 'Foundations of AI Programming'),
    makeUnit('u3', 'AI and the Systems that Power It'),
  ],
};

describe('UnitCarousel component', () => {
  it('renders the course title as a level-2 heading above level-3 card titles', () => {
    render(<UnitCarousel {...defaultProps} />);
    expect(
      screen.getByRole('heading', {level: 2, name: 'AI Foundations'}),
    ).toBeInTheDocument();
    expect(screen.getAllByRole('heading', {level: 3})).toHaveLength(3);
  });

  it('renders the course details link', () => {
    render(<UnitCarousel {...defaultProps} />);
    const link = screen.getByRole('link', {name: 'View course details'});
    expect(link).toHaveAttribute('href', '/ai-foundations');
  });

  it('omits the course details link when not bound', () => {
    render(<UnitCarousel {...defaultProps} courseDetailsLink={undefined} />);
    expect(
      screen.queryByRole('link', {name: 'View course details'}),
    ).not.toBeInTheDocument();
  });

  it('renders the subtitle with unit count and merged grade bands', () => {
    render(<UnitCarousel {...defaultProps} />);
    expect(
      screen.getByText('3 Units • Grades 9-12 Pathway'),
    ).toBeInTheDocument();
  });

  it('uses the singular form for a single unit', () => {
    render(
      <UnitCarousel
        {...defaultProps}
        units={[makeUnit('u1', 'Problem Solving with AI')]}
      />,
    );
    expect(
      screen.getByText('1 Unit • Grades 9-12 Pathway'),
    ).toBeInTheDocument();
  });

  it('hides the unit count when showUnitCount is false', () => {
    render(<UnitCarousel {...defaultProps} showUnitCount={false} />);
    expect(screen.getByText('Grades 9-12 Pathway')).toBeInTheDocument();
    expect(screen.queryByText(/Units/)).not.toBeInTheDocument();
  });

  it('omits the subtitle entirely when both segments are hidden', () => {
    render(
      <UnitCarousel
        {...defaultProps}
        showUnitCount={false}
        gradeBands={undefined}
      />,
    );
    expect(screen.queryByText(/Units?/)).not.toBeInTheDocument();
    expect(screen.queryByText(/Pathway/)).not.toBeInTheDocument();
  });

  it('omits the grades segment when no grade bands are bound', () => {
    render(<UnitCarousel {...defaultProps} gradeBands={undefined} />);
    expect(screen.getByText('3 Units')).toBeInTheDocument();
    expect(screen.queryByText(/Pathway/)).not.toBeInTheDocument();
  });

  it('renders one slide per unit and filters non-curriculum entries', () => {
    const labEntry = {
      sys: {id: 'l1', contentType: {sys: {id: 'lab'}}},
      fields: {title: 'Not a unit'},
    } as unknown as CourseUnitEntry;
    render(
      <UnitCarousel
        {...defaultProps}
        units={[...defaultProps.units!, labEntry]}
      />,
    );
    expect(screen.getAllByTestId('swiper-slide')).toHaveLength(3);
    expect(screen.queryByText('Not a unit')).not.toBeInTheDocument();
  });

  it('supports the activity-catalog field names on units', () => {
    render(
      <UnitCarousel
        {...defaultProps}
        units={[
          makeUnit('u1', 'Hour of AI', {
            grade: undefined,
            duration: undefined,
            topics: undefined,
            ages: ['8-10'],
            length: ['1 hour'],
            topic: ['AI'],
          }),
        ]}
      />,
    );
    expect(screen.getByText('Grades 8-10')).toBeInTheDocument();
    expect(screen.getByText('1 hour')).toBeInTheDocument();
    expect(screen.getByText('AI')).toBeInTheDocument();
  });

  it('resolves each unit image through the entity store', () => {
    const {container} = render(<UnitCarousel {...defaultProps} />);
    const img = container.querySelector('img');
    expect(img).not.toBeNull();
    expect(decodeURIComponent(img!.getAttribute('src') || '')).toContain(
      'unit.png',
    );
  });

  it('resolves each unit link and overrides its label with "Explore" by default', () => {
    render(<UnitCarousel {...defaultProps} />);
    // The bound Link entry's label ("Explore this unit") is replaced, while
    // its target is inherited.
    const links = screen.getAllByRole('link', {name: 'Explore'});
    expect(links).toHaveLength(3);
    expect(links[0]).toHaveAttribute('href', '/unit-1');
    expect(screen.queryByText('Explore this unit')).not.toBeInTheDocument();
  });

  it('applies a custom link text override to every card', () => {
    render(<UnitCarousel {...defaultProps} linkTextOverride="View unit" />);
    expect(screen.getAllByRole('link', {name: 'View unit'})).toHaveLength(3);
  });

  it('falls back to each entry label when the override is cleared', () => {
    render(<UnitCarousel {...defaultProps} linkTextOverride="" />);
    expect(
      screen.getAllByRole('link', {name: 'Explore this unit'}),
    ).toHaveLength(3);
  });

  it('applies the heading color and the unit title color', () => {
    render(
      <UnitCarousel
        {...defaultProps}
        headingColor="blue"
        unitTitleColor="green"
      />,
    );
    expect(
      screen.getByRole('heading', {level: 2, name: 'AI Foundations'}),
    ).toHaveStyle({color: 'var(--codeai-blue-primary)'});
    for (const cardTitle of screen.getAllByRole('heading', {level: 3})) {
      expect(cardTitle).toHaveStyle({color: 'var(--codeai-green-primary)'});
    }
  });

  it('hides topics on every card when showTopics is false', () => {
    render(<UnitCarousel {...defaultProps} showTopics={false} />);
    expect(
      screen.queryByText('Artificial Intelligence'),
    ).not.toBeInTheDocument();
  });

  it('applies the selected badge color to every card', () => {
    render(<UnitCarousel {...defaultProps} topicBadgeColor="green" />);
    for (const badge of screen.getAllByText('Artificial Intelligence')) {
      expect(badge).toHaveStyle({
        backgroundColor: 'var(--codeai-green-primary)',
      });
    }
  });

  it('renders a placeholder when no units are bound', () => {
    render(<UnitCarousel title="AI Foundations" />);
    expect(screen.getByText(/Unit Carousel placeholder/)).toBeInTheDocument();
    expect(screen.queryByTestId('swiper')).not.toBeInTheDocument();
  });

  it('renders nav buttons with accessible labels', () => {
    render(<UnitCarousel {...defaultProps} />);
    expect(
      screen.getByRole('button', {name: 'Previous units'}),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', {name: 'Next units'}),
    ).toBeInTheDocument();
  });
});
