/* eslint-disable @typescript-eslint/no-explicit-any */
import {create, insertMultiple, search} from '@orama/orama';
import {render, screen, fireEvent, waitFor} from '@testing-library/react';
import {useSearchParams} from 'next/navigation';

import ActivityCatalog from '../activityCatalog';

// Mock child components

jest.mock(
  '@/components/contentful/activityCatalog/facetBar/facetBar',
  () => (props: any) => (
    <div data-testid="FacetBar">{JSON.stringify(props)}</div>
  ),
);
jest.mock(
  '@/components/contentful/activityCatalog/facetDrawer/facetDrawer',
  () => (props: any) => (
    <div data-testid="FacetDrawer">{JSON.stringify(props)}</div>
  ),
);
jest.mock(
  '@/components/csforall/activityCollection/ActivityCollection',
  () => (props: any) => (
    <div data-testid="ActivityCollection">
      {JSON.stringify(props.activities)}
    </div>
  ),
);

jest.mock(
  '@/modules/activityCatalog/hourOfAi/ActivityCardCollection',
  () => (props: any) => (
    <div data-testid="ActivityCardCollection">
      {JSON.stringify(props.activities)}
    </div>
  ),
);

// Mock Orama and plugin-data-persistence
jest.mock('@orama/orama', () => ({
  create: jest.fn().mockReturnValue({}),
  insertMultiple: jest.fn(),
  search: jest.fn().mockResolvedValue({
    hits: [
      {document: {id: 1, title: 'Test Activity', languagesText: 'English'}},
      {document: {id: 2, title: 'Another Activity', languagesText: 'Spanish'}},
    ],
  }),
}));

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useSearchParams: jest.fn(),
}));

const mockActivities: any = [
  {id: 1, title: 'Test Activity', languagesText: 'English'},
  {id: 2, title: 'Another Activity', languagesText: 'Spanish'},
];
const mockFacets: any = {
  subject: {values: {Math: 1, Science: 2}},
  grade: {values: {'1': 1, '2': 1}},
};

const useSearchParamsMock = useSearchParams as jest.Mock;

const mockDocuments: any = [
  {
    sortKey: '001Test Activity',
    title: 'Test Activity',
    image: 'https://localhost/test-image.jpg',
    organization: ['Test Organization'],
    ages: ['10-12'],
    languageProgramming: ['JavaScript'],
    shortDescription: 'A short description.',
    primaryLinkRef: '{"fields":{}}',
    technologyClassroom: ['Tech'],
    topic: ['Topic'],
    activityType: ['hour-of-code'],
    length: ['1 hour'],
    accessibilitys: ['Accessible'],
    languagesText: 'English',
    supportedLanguages: ['English'],
    tutorialID: 'tutorial-1',
    featuredPosition: 1,
  },
  {
    sortKey: '002Another Activity',
    title: 'Another Activity',
    image: 'https://localhost/another-image.jpg',
    organization: ['Another Organization'],
    ages: ['13-15'],
    languageProgramming: ['Python'],
    shortDescription: 'Another short description.',
    primaryLinkRef: '{"fields":{}}',
    technologyClassroom: ['Another Tech'],
    topic: ['Another Topic'],
    activityType: ['hour-of-ai'],
    length: ['2 hours'],
    accessibilitys: ['Accessible'],
    languagesText: 'Spanish',
    supportedLanguages: ['Spanish'],
    tutorialID: 'tutorial-2',
    featuredPosition: 2,
  },
];

describe('ActivityCatalog', () => {
  beforeEach(() => {
    useSearchParamsMock.mockReturnValue({
      get: (key: string) => (key === 'term' ? '' : null),
      toString: () => '',
    });
    window.history.pushState = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders FacetDrawer, FacetBar, and ActivityCollection', async () => {
    render(
      <ActivityCatalog
        documents={mockDocuments}
        activities={mockActivities}
        facets={mockFacets}
      />,
    );
    expect(screen.getByTestId('FacetDrawer')).toBeInTheDocument();
    expect(screen.getByTestId('FacetBar')).toBeInTheDocument();
    expect(screen.getByTestId('ActivityCollection')).toBeInTheDocument();
  });

  it('renders the CSforAll cards by default and Activity Cards when asked', () => {
    const {rerender} = render(
      <ActivityCatalog
        documents={mockDocuments}
        activities={mockActivities}
        facets={mockFacets}
      />,
    );
    expect(screen.getByTestId('ActivityCollection')).toBeInTheDocument();
    expect(screen.queryByTestId('ActivityCardCollection')).toBeNull();

    rerender(
      <ActivityCatalog
        documents={mockDocuments}
        activities={mockActivities}
        facets={mockFacets}
        hourOfAi
      />,
    );
    expect(screen.getByTestId('ActivityCardCollection')).toBeInTheDocument();
    expect(screen.queryByTestId('ActivityCollection')).toBeNull();
  });

  it('adds the Hour of AI Filters column only when asked', () => {
    const {rerender} = render(
      <ActivityCatalog
        documents={mockDocuments}
        activities={mockActivities}
        facets={mockFacets}
      />,
    );
    expect(screen.queryByRole('heading', {name: 'Filters'})).toBeNull();
    expect(screen.getByTestId('FacetBar').textContent).toContain(
      '"hourOfAi":false',
    );

    rerender(
      <ActivityCatalog
        documents={mockDocuments}
        activities={mockActivities}
        facets={mockFacets}
        hourOfAi
      />,
    );
    expect(
      screen.getByRole('heading', {level: 2, name: 'Filters'}),
    ).toBeInTheDocument();
    expect(screen.getByTestId('FacetBar').textContent).toContain(
      '"hourOfAi":true',
    );
  });

  it('updates searchTerm when typing in search box', async () => {
    render(
      <ActivityCatalog
        documents={mockDocuments}
        activities={mockActivities}
        facets={mockFacets}
      />,
    );
    const input = screen.getByPlaceholderText('Search...');
    fireEvent.change(input, {target: {value: 'robot'}});
    expect((input as HTMLInputElement).value).toBe('robot');
    await waitFor(() => {
      expect(window.history.pushState).toHaveBeenCalled();
    });
  });

  it('opens and closes facet drawer', () => {
    render(
      <ActivityCatalog
        documents={mockDocuments}
        activities={mockActivities}
        facets={mockFacets}
      />,
    );
    const button = screen.getByRole('button', {name: /filters/i});
    fireEvent.click(button);
    expect(screen.getByTestId('FacetDrawer').textContent).toContain(
      '"isOpen":true',
    );
  });

  it('serializes and deserializes selected facets correctly', async () => {
    useSearchParamsMock.mockReturnValue({
      get: (key: string) => (key === 'term' ? '' : null),
      toString: () => 'subject=Math%2CScience&grade=1',
      forEach: (cb: (value: string, key: string) => void) => {
        cb('Math%2CScience', 'subject');
        cb('1', 'grade');
      },
    });
    render(
      <ActivityCatalog
        documents={mockDocuments}
        activities={mockActivities}
        facets={mockFacets}
      />,
    );
    await waitFor(() => {
      expect(screen.getByTestId('FacetBar').textContent).toContain('Math');
    });
  });

  it('does not include unknown facets from URL', async () => {
    useSearchParamsMock.mockReturnValue({
      get: (key: string) => (key === 'term' ? '' : null),
      toString: () => 'unknown=foo&subject=Math',
      forEach: (cb: (value: string, key: string) => void) => {
        cb('foo', 'unknown');
        cb('Math', 'subject');
      },
    });
    render(
      <ActivityCatalog
        documents={mockDocuments}
        activities={mockActivities}
        facets={mockFacets}
      />,
    );
    await waitFor(() => {
      expect(screen.getByTestId('FacetBar').textContent).toContain('Math');
      expect(screen.getByTestId('FacetBar').textContent).not.toContain(
        'unknown',
      );
    });
  });

  it('renders with undefined facets', () => {
    render(
      <ActivityCatalog
        documents={mockDocuments}
        activities={mockActivities}
        facets={undefined}
      />,
    );
    expect(screen.getByTestId('FacetDrawer')).toBeInTheDocument();
    expect(screen.getByTestId('FacetBar')).toBeInTheDocument();
  });

  it('builds the search index once across re-renders', () => {
    render(
      <ActivityCatalog
        documents={mockDocuments}
        activities={mockActivities}
        facets={mockFacets}
      />,
    );
    fireEvent.change(screen.getByPlaceholderText('Search...'), {
      target: {value: 'robot'},
    });
    expect(create).toHaveBeenCalledTimes(1);
    expect(insertMultiple).toHaveBeenCalledWith({}, mockDocuments);
  });

  it('asks Orama for every match, not its default page of 10', async () => {
    render(
      <ActivityCatalog
        documents={mockDocuments}
        activities={mockActivities}
        facets={mockFacets}
      />,
    );
    await waitFor(() => {
      expect(search).toHaveBeenCalledWith(
        {},
        expect.objectContaining({limit: mockDocuments.length}),
      );
    });
  });

  it('search box has correct aria-label', () => {
    render(
      <ActivityCatalog
        documents={mockDocuments}
        activities={mockActivities}
        facets={mockFacets}
      />,
    );
    expect(screen.getByLabelText('Search activities')).toBeInTheDocument();
  });
  it('excludes activities from specified organizations', async () => {
    useSearchParamsMock.mockReturnValue({
      get: (key: string) => (key === 'term' ? 'abc' : null),
      toString: () =>
        'organization=Test%20Organization&excludedOrganizations=Test%20Organization',
    });

    // Mock Orama search to return activities from "Test Organization"
    jest.mocked(search).mockResolvedValueOnce({
      hits: [
        {
          document: {
            id: 1,
            title: 'Test Activity',
            organization: ['Test Organization'],
            languagesText: 'English',
          },
        },
        {
          document: {
            id: 2,
            title: 'Another Activity',
            organization: ['Another Organization'],
            languagesText: 'Spanish',
          },
        },
      ],
    } as any);

    render(
      <ActivityCatalog
        documents={mockDocuments}
        activities={mockActivities}
        facets={mockFacets}
      />,
    );
    // Wait for "Test Activity" to not be on screen as it was excluded by organization
    await waitFor(() => {
      expect(screen.queryByText(/Test Activity/)).not.toBeInTheDocument();
      expect(screen.getByText(/Another Activity/)).toBeInTheDocument();
    });
  });

  describe('catalog filter', () => {
    const mockQuery = (query: string) =>
      useSearchParamsMock.mockReturnValue(new URLSearchParams(query));

    const catalogFacets: any = {
      'hour-of-ai': {subject: {values: {Science: 2}}},
      'hour-of-code': {subject: {values: {Math: 1}}},
    };

    const renderCatalog = (props: any = {}) =>
      render(
        <ActivityCatalog
          documents={mockDocuments}
          activities={mockActivities}
          facets={mockFacets}
          catalogFacets={catalogFacets}
          hourOfAi
          {...props}
        />,
      );

    const lastSearch = () => jest.mocked(search).mock.calls.at(-1)?.[1] as any;

    const facetBarProps = () =>
      JSON.parse(screen.getAllByTestId('FacetBar')[0].textContent!);

    it('is only shown on Hour of AI', () => {
      renderCatalog({hourOfAi: false});
      expect(
        screen.queryByRole('group', {name: 'Activity catalog'}),
      ).toBeNull();
    });

    it('starts on All activities, searching both catalogs in one order', async () => {
      mockQuery('term=');
      renderCatalog();

      expect(
        screen.getByRole('button', {name: 'All activities'}),
      ).toHaveAttribute('aria-pressed', 'true');
      await waitFor(() => expect(search).toHaveBeenCalled());
      expect(lastSearch().where).not.toHaveProperty('catalogs');
      expect(lastSearch().sortBy).toEqual({property: 'sortKey', order: 'ASC'});
    });

    it('restores the catalog from cat', async () => {
      mockQuery('term=&cat=hour-of-code');
      renderCatalog();

      await waitFor(() =>
        expect(
          screen.getByRole('button', {name: 'Hour of Code'}),
        ).toHaveAttribute('aria-pressed', 'true'),
      );
      expect(lastSearch().where.catalogs).toEqual({
        containsAny: ['hour-of-code'],
      });
      expect(lastSearch().sortBy).toEqual({property: 'sortKey', order: 'ASC'});
    });

    it('ignores an unknown cat value', async () => {
      mockQuery('term=&cat=nope');
      renderCatalog();

      await waitFor(() => expect(search).toHaveBeenCalled());
      expect(
        screen.getByRole('button', {name: 'All activities'}),
      ).toHaveAttribute('aria-pressed', 'true');
      expect(lastSearch().where).not.toHaveProperty('catalogs');
    });

    it('ignores cat outside Hour of AI', async () => {
      mockQuery('term=&cat=hour-of-code');
      renderCatalog({hourOfAi: false});

      await waitFor(() => expect(search).toHaveBeenCalled());
      expect(lastSearch().where).not.toHaveProperty('catalogs');
    });

    it('writes the selected catalog to the URL right away', () => {
      mockQuery('term=');
      renderCatalog();

      fireEvent.click(screen.getByRole('button', {name: 'Hour of Code'}));
      expect(window.history.pushState).toHaveBeenLastCalledWith(
        null,
        '',
        '?cat=hour-of-code',
      );

      fireEvent.click(screen.getByRole('button', {name: 'All activities'}));
      expect(window.history.pushState).toHaveBeenLastCalledWith(
        null,
        '',
        window.location.pathname,
      );
    });

    it('clears the search and facets when a catalog is picked', async () => {
      mockQuery('term=robot&subject=Math');
      renderCatalog();
      await waitFor(() =>
        expect(screen.getAllByPlaceholderText('Search...')[0]).toHaveValue(
          'robot',
        ),
      );
      expect(facetBarProps().selectedFacets).toEqual({subject: {}});

      fireEvent.click(screen.getByRole('button', {name: 'Hour of AI'}));

      expect(window.history.pushState).toHaveBeenLastCalledWith(
        null,
        '',
        '?cat=hour-of-ai',
      );
      expect(screen.getAllByPlaceholderText('Search...')[0]).toHaveValue('');
      expect(facetBarProps().selectedFacets).toEqual({});
    });

    it('leaves out an empty search term but keeps a typed one', async () => {
      mockQuery('cat=hour-of-code');
      renderCatalog();

      fireEvent.change(screen.getAllByPlaceholderText('Search...')[0], {
        target: {value: 'robot'},
      });
      await waitFor(() =>
        expect(window.history.pushState).toHaveBeenLastCalledWith(
          null,
          '',
          '?term=robot&cat=hour-of-code',
        ),
      );
    });

    it('does not touch the URL when the selected filter is clicked again', () => {
      mockQuery('term=');
      renderCatalog();

      fireEvent.click(screen.getByRole('button', {name: 'All activities'}));
      expect(window.history.pushState).not.toHaveBeenCalled();
    });

    it("shows the selected catalog's facets", async () => {
      mockQuery('term=&cat=hour-of-ai');
      renderCatalog();

      await waitFor(() =>
        expect(facetBarProps().facets).toEqual({
          subject: {values: {Science: 2}},
        }),
      );
    });

    it('keeps selected values the catalog does not have', async () => {
      mockQuery('term=&cat=hour-of-ai&subject=Math');
      renderCatalog();

      await waitFor(() =>
        expect(facetBarProps().facets).toEqual({
          subject: {values: {Science: 2, Math: 0}},
        }),
      );
    });

    it('shows every facet value for All activities', async () => {
      mockQuery('term=');
      renderCatalog();

      await waitFor(() => expect(facetBarProps().facets).toEqual(mockFacets));
    });
  });
});
