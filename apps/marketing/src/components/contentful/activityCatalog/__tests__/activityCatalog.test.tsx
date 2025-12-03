/* eslint-disable @typescript-eslint/no-explicit-any */
import {search} from '@orama/orama';
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

// Adjust mockContentfulActivities to match the Activity type
const mockContentfulActivities: any = [
  {
    sys: {
      id: '1',
      type: 'Entry',
      createdAt: '2025-01-01T00:00:00Z',
      updatedAt: '2025-01-01T00:00:00Z',
      locale: 'en-US',
      contentType: {
        sys: {id: 'activity', type: 'Link', linkType: 'ContentType'},
      },
      revision: 1,
      space: {sys: {id: 'space-id', type: 'Link', linkType: 'Space'}},
      environment: {sys: {id: 'env-id', type: 'Link', linkType: 'Environment'}},
      publishedVersion: 1,
    },
    metadata: {tags: []},
    fields: {
      title: 'Test Activity',
      image: 'https://localhost/test-image.jpg',
      organization: ['Test Organization'],
      ages: ['10-12'],
      languageProgramming: ['JavaScript'],
      shortDescription: 'A short description.',
      longDescription: 'A long description.',
      primaryLinkRef: 'https://example.com',
      technologyClassroom: ['Tech'],
      topic: ['Topic'],
      activityType: ['hour-of-code'],
      length: ['1 hour'],
      accessibilitys: ['Accessible'],
      languagesText: 'English',
      supportedLanguages: ['English'],
      standards: 'Standard',
      tutorialID: 'tutorial-1',
      featuredPosition: 1,
    },
  },
  {
    sys: {
      id: '2',
      type: 'Entry',
      createdAt: '2025-01-02T00:00:00Z',
      updatedAt: '2025-01-02T00:00:00Z',
      locale: 'en-US',
      contentType: {
        sys: {id: 'activity', type: 'Link', linkType: 'ContentType'},
      },
      revision: 1,
      space: {sys: {id: 'space-id', type: 'Link', linkType: 'Space'}},
      environment: {sys: {id: 'env-id', type: 'Link', linkType: 'Environment'}},
      publishedVersion: 1,
    },
    metadata: {tags: []},
    fields: {
      title: 'Another Activity',
      image: 'https://localhost/another-image.jpg',
      organization: ['Another Organization'],
      ages: ['13-15'],
      languageProgramming: ['Python'],
      shortDescription: 'Another short description.',
      longDescription: 'Another long description.',
      primaryLinkRef: 'https://example.org',
      technologyClassroom: ['Another Tech'],
      topic: ['Another Topic'],
      activityType: ['hour-of-ai'],
      length: ['2 hours'],
      accessibilitys: ['Accessible'],
      languagesText: 'Spanish',
      supportedLanguages: ['Spanish'],
      standards: 'Another Standard',
      tutorialID: 'tutorial-2',
      featuredPosition: 2,
    },
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
        contentfulActivities={mockContentfulActivities}
        activities={mockActivities}
        facets={mockFacets}
      />,
    );
    expect(screen.getByTestId('FacetDrawer')).toBeInTheDocument();
    expect(screen.getByTestId('FacetBar')).toBeInTheDocument();
    expect(screen.getByTestId('ActivityCollection')).toBeInTheDocument();
  });

  it('updates searchTerm when typing in search box', async () => {
    render(
      <ActivityCatalog
        contentfulActivities={mockContentfulActivities}
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
        contentfulActivities={mockContentfulActivities}
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
      get: (key: string) => (key === 'term' ? 'abc' : null),
      toString: () => 'subject=Math%2CScience&grade=1',
      forEach: (cb: (value: string, key: string) => void) => {
        cb('Math%2CScience', 'subject');
        cb('1', 'grade');
      },
    });
    render(
      <ActivityCatalog
        contentfulActivities={mockContentfulActivities}
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
        contentfulActivities={mockContentfulActivities}
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
        contentfulActivities={mockContentfulActivities}
        activities={mockActivities}
        facets={undefined}
      />,
    );
    expect(screen.getByTestId('FacetDrawer')).toBeInTheDocument();
    expect(screen.getByTestId('FacetBar')).toBeInTheDocument();
  });

  it('search box has correct aria-label', () => {
    render(
      <ActivityCatalog
        contentfulActivities={mockContentfulActivities}
        activities={mockActivities}
        facets={mockFacets}
      />,
    );
    expect(screen.getByLabelText('Search activities')).toBeInTheDocument();
  });
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
      contentfulActivities={mockContentfulActivities}
      activities={mockActivities}
      facets={mockFacets}
    />,
  );
  // Wait for "Test Activity" to not be on screen as it was excluded by organization
  await waitFor(() => {
    expect(screen.queryByText('Test Activity')).not.toBeInTheDocument();
  });
});
