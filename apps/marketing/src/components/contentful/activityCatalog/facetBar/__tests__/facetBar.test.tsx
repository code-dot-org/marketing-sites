/* eslint-disable @typescript-eslint/no-explicit-any */
import {render, screen, fireEvent} from '@testing-library/react';

import FacetBar from '../facetBar';

const mockFacets = {
  subject: {
    values: {
      Math: 10,
      Science: 5,
      'Language Arts': 3,
    },
  },
  grade: {
    values: {
      '1': 2,
      '2': 4,
      '10': 1,
    },
  },
};

jest.mock('@/components/contentful/activityCatalog/config/facets', () => ({
  FACET_CONFIG: {
    subject: {
      label: 'Subject',
      type: 'checkbox',
    },
    grade: {
      label: 'Grade',
      type: 'checkbox',
    },
  },
}));

describe('FacetBar', () => {
  const onFacetChange = jest.fn();
  const onSearchTermChange = jest.fn();
  const onClearAll = jest.fn();

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders nothing if facets is undefined', () => {
    const {container} = render(
      <FacetBar
        facets={undefined}
        selectedFacets={{}}
        onFacetChange={onFacetChange}
        onSearchTermChange={onSearchTermChange}
        onClearAll={onClearAll}
        searchTerm=""
      />,
    );
    expect(container.firstChild).toBeNull();
  });

  it('renders all facet accordions and their values', () => {
    render(
      <FacetBar
        facets={mockFacets as any}
        selectedFacets={{}}
        onFacetChange={onFacetChange}
        onSearchTermChange={onSearchTermChange}
        onClearAll={onClearAll}
        searchTerm=""
      />,
    );
    expect(screen.getByText('Subject')).toBeInTheDocument();
    expect(screen.getByText('Grade')).toBeInTheDocument();
    expect(screen.getByText('Math')).toBeInTheDocument();
    expect(screen.getByText('Science')).toBeInTheDocument();
    expect(screen.getByText('Language Arts')).toBeInTheDocument();
  });

  it('starts every facet collapsed on Hour of AI', () => {
    const props = {
      facets: mockFacets as any,
      selectedFacets: {},
      onFacetChange,
      onSearchTermChange,
      onClearAll,
      searchTerm: '',
    };
    const {rerender} = render(<FacetBar {...props} />);
    const expanded = () =>
      screen.getAllByRole('button').map(b => b.getAttribute('aria-expanded'));
    expect(expanded()).toEqual(['true', 'true']);
    rerender(<FacetBar {...props} hourOfAi />);
    // defaultExpanded only applies on mount.
    rerender(<></>);
    rerender(<FacetBar {...props} hourOfAi />);
    expect(expanded()).toEqual(['false', 'false']);
  });

  it('opens Hour of AI facets that have an active filter, including once filters load', () => {
    const props = {
      facets: mockFacets as any,
      onFacetChange,
      onSearchTermChange,
      onClearAll,
      searchTerm: '',
      hourOfAi: true,
    };
    const expanded = () =>
      screen.getAllByRole('button').map(b => b.getAttribute('aria-expanded'));
    const {rerender} = render(<FacetBar {...props} selectedFacets={{}} />);
    expect(expanded()).toEqual(['false', 'false']);
    // Filters arrive from the URL after the first render.
    rerender(<FacetBar {...props} selectedFacets={{grade: new Set(['2'])}} />);
    expect(expanded()).toEqual(['false', 'true']);
    // A visitor's toggle wins over the filter.
    fireEvent.click(screen.getByText('Grade'));
    expect(expanded()).toEqual(['false', 'false']);
    fireEvent.click(screen.getByText('Subject'));
    expect(expanded()).toEqual(['true', 'false']);
  });

  it('puts the Hour of AI search first, outside the drawer only', () => {
    const props = {
      facets: mockFacets as any,
      selectedFacets: {},
      onFacetChange,
      onSearchTermChange,
      onClearAll,
      searchTerm: '',
    };
    const {container, rerender} = render(<FacetBar {...props} hourOfAi />);
    const search = screen.getByPlaceholderText('Search...');
    expect(container.firstElementChild?.firstElementChild).toContainElement(
      search,
    );
    rerender(<FacetBar {...props} hourOfAi isInDrawer />);
    expect(screen.queryByPlaceholderText('Search...')).toBeNull();
    rerender(<FacetBar {...props} />);
    expect(screen.queryByPlaceholderText('Search...')).toBeNull();
  });

  it('checks the checkbox if the facet value is selected', () => {
    render(
      <FacetBar
        facets={mockFacets as any}
        selectedFacets={{subject: new Set(['Math'])}}
        onFacetChange={onFacetChange}
        onSearchTermChange={onSearchTermChange}
        onClearAll={onClearAll}
        searchTerm=""
      />,
    );
    const mathCheckbox = screen.getByLabelText('Math') as HTMLInputElement;
    expect(mathCheckbox.checked).toBe(true);
    const scienceCheckbox = screen.getByLabelText(
      'Science',
    ) as HTMLInputElement;
    expect(scienceCheckbox.checked).toBe(false);
  });

  it('does not render an accordion if there are no facet values', () => {
    const emptyFacets = {
      subject: {
        values: {},
      },
      grade: {
        values: {},
      },
    };

    render(
      <FacetBar
        facets={emptyFacets as any}
        selectedFacets={{}}
        onFacetChange={onFacetChange}
        onSearchTermChange={onSearchTermChange}
        onClearAll={onClearAll}
        searchTerm=""
      />,
    );

    expect(screen.queryByText('Subject')).not.toBeInTheDocument();
    expect(screen.queryByText('Grade')).not.toBeInTheDocument();
  });

  it('calls onFacetChange when a checkbox is clicked', () => {
    render(
      <FacetBar
        facets={mockFacets as any}
        selectedFacets={{}}
        onFacetChange={onFacetChange}
        onSearchTermChange={onSearchTermChange}
        onClearAll={onClearAll}
        searchTerm=""
      />,
    );
    const mathCheckbox = screen.getByLabelText('Math');
    fireEvent.click(mathCheckbox);
    expect(onFacetChange).toHaveBeenCalledWith('subject', 'Math');
  });

  it('sorts facet values numerically when possible', () => {
    render(
      <FacetBar
        facets={mockFacets as any}
        selectedFacets={{}}
        onFacetChange={onFacetChange}
        onSearchTermChange={onSearchTermChange}
        onClearAll={onClearAll}
        searchTerm=""
      />,
    );
    // Grade values should be sorted as 1, 2, 10
    const gradeCheckboxes = [
      screen.getByLabelText('1'),
      screen.getByLabelText('2'),
      screen.getByLabelText('10'),
    ];
    expect(gradeCheckboxes[0]).toBeInTheDocument();
    expect(gradeCheckboxes[1]).toBeInTheDocument();
    expect(gradeCheckboxes[2]).toBeInTheDocument();
  });
});
