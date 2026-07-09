import {useInMemoryEntities} from '@contentful/experiences-sdk-react';
import {render, screen, within} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';

import CatalogInterstitial from '@/components/contentful/catalogInterstitial';
import CourseCatalog, {
  CourseCatalogProps,
  CourseEntry,
} from '@/components/contentful/courseCatalog';

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

// Seed the entity store with the full chain the catalog resolves:
// course → courseUnits (curriculum entries) → unit image/link.
/* eslint-disable @typescript-eslint/no-explicit-any */
useInMemoryEntities().addEntities([
  {
    sys: {id: 'catalog-asset-1', type: 'Asset'},
    fields: {
      file: {url: '//contentful-images.code.org/x/catalog-asset-1/y/unit.png'},
    },
  } as any,
  {
    sys: {
      id: 'catalog-link-1',
      type: 'Entry',
      contentType: {sys: {type: 'Link', linkType: 'ContentType', id: 'link'}},
    },
    fields: {
      label: 'Explore',
      primaryTarget: '/unit',
      isThisAnExternalLink: false,
    },
  } as any,
  {
    sys: {
      id: 'course-link-1',
      type: 'Entry',
      contentType: {sys: {type: 'Link', linkType: 'ContentType', id: 'link'}},
    },
    fields: {
      label: 'View course details',
      primaryTarget: '/course-details',
      isThisAnExternalLink: false,
    },
  } as any,
  ...['unit-1', 'unit-2', 'unit-3'].map(
    (id, index) =>
      ({
        sys: {
          id,
          type: 'Entry',
          contentType: {
            sys: {type: 'Link', linkType: 'ContentType', id: 'curriculum'},
          },
        },
        fields: {
          title: `Unit ${index + 1}`,
          shortDescription: `Unit ${index + 1} description`,
          grade: ['9-10'],
          duration: ['15 Hours'],
          topics: ['Artificial Intelligence'],
          image: {
            sys: {type: 'Link', linkType: 'Asset', id: 'catalog-asset-1'},
          },
          primaryLinkRef: {
            sys: {type: 'Link', linkType: 'Entry', id: 'catalog-link-1'},
          },
        },
      }) as any,
  ),
]);
/* eslint-enable @typescript-eslint/no-explicit-any */

const makeCourse = (
  id: string,
  title: string,
  grades: string[] | undefined,
  unitIds: string[] = ['unit-1', 'unit-2'],
): CourseEntry =>
  ({
    sys: {id, contentType: {sys: {id: 'course'}}},
    fields: {
      title,
      grade: grades,
      secondaryLinkRef: {
        sys: {type: 'Link', linkType: 'Entry', id: 'course-link-1'},
      },
      courseUnits: unitIds.map(unitId => ({
        sys: {type: 'Link', linkType: 'Entry', id: unitId},
      })),
    },
  }) as unknown as CourseEntry;

const defaultProps: CourseCatalogProps = {
  courses: [
    makeCourse('c1', 'CS Fundamentals', ['K-5']),
    makeCourse('c2', 'CS Discoveries', ['6-8']),
    makeCourse('c3', 'AI Foundations', ['9-10', '11-12']),
  ],
};

const getPill = (name: string) => screen.getByRole('button', {name});

describe('CourseCatalog component', () => {
  it('renders a Unit Carousel per course with resolved details link and units', () => {
    render(<CourseCatalog {...defaultProps} />);
    for (const title of ['CS Fundamentals', 'CS Discoveries', 'AI Foundations'])
      expect(
        screen.getByRole('heading', {level: 2, name: title}),
      ).toBeInTheDocument();
    const detailLinks = screen.getAllByRole('link', {
      name: 'View course details',
    });
    expect(detailLinks).toHaveLength(3);
    expect(detailLinks[0]).toHaveAttribute('href', '/course-details');
    // Unit chain resolves: card titles, explore links, and images render.
    expect(
      screen.getAllByRole('heading', {level: 3, name: 'Unit 1'}),
    ).not.toHaveLength(0);
    expect(screen.getAllByRole('link', {name: 'Explore'})).not.toHaveLength(0);
  });

  it('ignores bound entries of another content type', () => {
    const wrongEntry = {
      sys: {id: 'x', contentType: {sys: {id: 'curriculum'}}},
      fields: {title: 'Not a course'},
    } as unknown as CourseEntry;
    render(<CourseCatalog courses={[...defaultProps.courses!, wrongEntry]} />);
    expect(screen.queryByText('Not a course')).not.toBeInTheDocument();
    expect(screen.getAllByRole('heading', {level: 2})).toHaveLength(3);
  });

  it('shows all courses under the default All Grades selection', () => {
    render(<CourseCatalog {...defaultProps} />);
    expect(getPill('All Grades')).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getAllByRole('heading', {level: 2})).toHaveLength(3);
  });

  it('only renders band pills that match at least one course', () => {
    render(
      <CourseCatalog
        courses={[makeCourse('c3', 'AI Foundations', ['9-10', '11-12'])]}
      />,
    );
    expect(getPill('All Grades')).toBeInTheDocument();
    expect(getPill('Grades 9-12')).toBeInTheDocument();
    expect(
      screen.queryByRole('button', {name: 'Grades K-5'}),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole('button', {name: 'Grades 6-8'}),
    ).not.toBeInTheDocument();
  });

  it('filters courses by grade-band overlap', async () => {
    const user = userEvent.setup();
    render(<CourseCatalog {...defaultProps} />);
    await user.click(getPill('Grades 9-12'));
    expect(getPill('Grades 9-12')).toHaveAttribute('aria-pressed', 'true');
    expect(getPill('All Grades')).toHaveAttribute('aria-pressed', 'false');
    expect(
      screen.getByRole('heading', {level: 2, name: 'AI Foundations'}),
    ).toBeInTheDocument();
    expect(screen.queryByText('CS Fundamentals')).not.toBeInTheDocument();
    expect(screen.queryByText('CS Discoveries')).not.toBeInTheDocument();
  });

  it('matches single grades and spans that cross band boundaries', async () => {
    const user = userEvent.setup();
    render(
      <CourseCatalog
        courses={[
          makeCourse('c4', 'Single Grade', ['5']),
          makeCourse('c5', 'Cross Band', ['K-8']),
          makeCourse('c6', 'Unparseable', ['All grades']),
        ]}
      />,
    );
    await user.click(getPill('Grades K-5'));
    expect(screen.getByText('Single Grade')).toBeInTheDocument();
    expect(screen.getByText('Cross Band')).toBeInTheDocument();
    expect(screen.queryByText('Unparseable')).not.toBeInTheDocument();

    await user.click(getPill('Grades 6-8'));
    expect(screen.queryByText('Single Grade')).not.toBeInTheDocument();
    expect(screen.getByText('Cross Band')).toBeInTheDocument();

    await user.click(getPill('All Grades'));
    expect(screen.getByText('Unparseable')).toBeInTheDocument();
  });

  it('re-bases CSS order to the filtered index', async () => {
    const user = userEvent.setup();
    render(<CourseCatalog {...defaultProps} />);
    await user.click(getPill('Grades 6-8'));
    const heading = screen.getByRole('heading', {
      level: 2,
      name: 'CS Discoveries',
    });
    // The remaining course is first in the filtered list → order 10.
    const wrapper = heading.closest('[style]') as HTMLElement;
    expect(wrapper).toHaveStyle({order: '10'});
  });

  it('passes style options through to every carousel and card', () => {
    render(
      <CourseCatalog
        {...defaultProps}
        showTopics={false}
        showUnitCount={false}
      />,
    );
    expect(
      screen.queryByText('Artificial Intelligence'),
    ).not.toBeInTheDocument();
    expect(screen.queryByText(/2 Units/)).not.toBeInTheDocument();
  });

  it('applies the selected badge color across all cards', () => {
    render(<CourseCatalog {...defaultProps} topicBadgeColor="green" />);
    for (const badge of screen.getAllByText('Artificial Intelligence')) {
      expect(badge).toHaveStyle({
        backgroundColor: 'var(--codeai-green-primary)',
      });
    }
  });

  it('shows all courses with disabled pills in editor mode', async () => {
    const user = userEvent.setup();
    render(<CourseCatalog {...defaultProps} isEditorMode />);
    expect(
      screen.getByText('Filtering is disabled in the editor'),
    ).toBeInTheDocument();
    const pill = getPill('Grades 9-12');
    expect(pill).toHaveAttribute('aria-disabled', 'true');
    await user.click(pill);
    expect(screen.getAllByRole('heading', {level: 2})).toHaveLength(3);
  });

  it('does not show the editor hint in live mode', () => {
    render(<CourseCatalog {...defaultProps} />);
    expect(
      screen.queryByText('Filtering is disabled in the editor'),
    ).not.toBeInTheDocument();
  });

  it('renders a placeholder plus children when no courses are bound', () => {
    render(
      <CourseCatalog>
        <div>Dropped child</div>
      </CourseCatalog>,
    );
    expect(screen.getByText(/Course Catalog placeholder/)).toBeInTheDocument();
    expect(screen.getByText('Dropped child')).toBeInTheDocument();
    expect(screen.queryByTestId('swiper')).not.toBeInTheDocument();
  });

  it('constrains course sections and the filter row to the site content width', () => {
    render(<CourseCatalog {...defaultProps} />);
    const heading = screen.getByRole('heading', {
      level: 2,
      name: 'CS Fundamentals',
    });
    const section = heading.closest('[style]') as HTMLElement;
    expect(section).toHaveStyle({maxWidth: '1280px'});
    const filterRow = screen.getByRole('group', {
      name: 'Filter courses by grade',
    }).parentElement as HTMLElement;
    expect(filterRow).toHaveStyle({maxWidth: '1280px'});
  });

  it('renders interstitial children inside the flex order container', () => {
    render(
      <CourseCatalog {...defaultProps}>
        <CatalogInterstitial position={2}>
          <div>Interstitial banner</div>
        </CatalogInterstitial>
      </CourseCatalog>,
    );
    const banner = screen.getByText('Interstitial banner');
    const wrapper = banner.parentElement as HTMLElement;
    expect(wrapper).toHaveStyle({order: '25'});
    const flexContainer = wrapper.parentElement as HTMLElement;
    expect(flexContainer).toHaveStyle({
      display: 'flex',
      flexDirection: 'column',
    });
    expect(
      within(flexContainer).getAllByRole('heading', {level: 2}),
    ).toHaveLength(3);
  });
});
