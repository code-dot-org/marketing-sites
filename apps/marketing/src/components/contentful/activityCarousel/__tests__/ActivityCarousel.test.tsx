import {useInMemoryEntities} from '@contentful/experiences-sdk-react';
import {render, screen} from '@testing-library/react';
import '@testing-library/jest-dom';

import ActivityCarousel, {
  ActivityCarouselProps,
  ActivityEntry,
} from '@/components/contentful/activityCarousel';

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
jest.mock('@/providers/statsig/client', () => ({
  useStatsigLogger: jest.fn(() => ({logEvent: jest.fn()})),
}));

const linkEntry = (id: string, label: string) =>
  ({
    sys: {
      id,
      type: 'Entry',
      contentType: {sys: {type: 'Link', linkType: 'ContentType', id: 'link'}},
    },
    fields: {label, primaryTarget: `/${id}`, isThisAnExternalLink: false},
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  }) as any;

// Seed the in-memory entity store so resolveContentfulLink resolves the
// activities' link stubs.
useInMemoryEntities().addEntities([
  linkEntry('start-link', 'Start'),
  linkEntry('notes-link', 'Teacher notes'),
]);

const linkStub = (id: string) => ({
  sys: {type: 'Link', linkType: 'Entry', id},
});

const makeActivity = (
  id: string,
  title: string,
  contentType = 'activity',
): ActivityEntry =>
  ({
    sys: {id, contentType: {sys: {id: contentType}}},
    fields: {
      title,
      shortDescription: `${title} description`,
      organization: 'Example Org',
      ages: ['9-12'],
      topic: ['Artificial Intelligence'],
      activityType: ['Lesson plan'],
      length: ['One hour'],
      tutorialID: id,
      primaryLinkRef: linkStub('start-link'),
      secondaryLinkRef: linkStub('notes-link'),
    },
  }) as unknown as ActivityEntry;

const defaultProps: ActivityCarouselProps = {
  activities: [
    makeActivity('a1', 'First activity'),
    makeActivity('a2', 'Second activity'),
  ],
};

describe('ActivityCarousel', () => {
  it('renders a card per activity with no header text', () => {
    render(<ActivityCarousel {...defaultProps} />);
    expect(screen.queryByRole('heading', {level: 3})).not.toBeInTheDocument();
    expect(screen.getAllByTestId('swiper-slide')).toHaveLength(2);
    expect(screen.getAllByRole('link', {name: 'Start'})[0]).toHaveAttribute(
      'href',
      '/start-link',
    );
  });

  it('skips entries that are not activities', () => {
    render(
      <ActivityCarousel
        {...defaultProps}
        activities={[
          makeActivity('a1', 'First activity'),
          makeActivity('x1', 'Not an activity', 'link'),
        ]}
      />,
    );
    expect(screen.getAllByTestId('swiper-slide')).toHaveLength(1);
  });

  it('applies the field toggles to every card', () => {
    render(
      <ActivityCarousel
        {...defaultProps}
        showOrganization={false}
        showTeacherLink={false}
      />,
    );
    expect(screen.queryByText('Example Org')).not.toBeInTheDocument();
    expect(
      screen.queryByRole('link', {name: 'Teacher notes'}),
    ).not.toBeInTheDocument();
  });

  it('makes each card fill its slide', () => {
    const {container} = render(
      <ActivityCarousel {...defaultProps} cardWidth="325px" />,
    );
    for (const card of container.querySelectorAll('article')) {
      expect(card).toHaveStyle({width: '100%'});
    }
  });

  it('relabels links with the text overrides', () => {
    render(
      <ActivityCarousel
        {...defaultProps}
        tutorialLinkTextOverride="Try it"
        teacherLinkTextOverride="Lesson plan"
      />,
    );
    expect(screen.getAllByRole('link', {name: 'Try it'})).toHaveLength(2);
    expect(screen.getAllByRole('link', {name: 'Lesson plan'})).toHaveLength(2);
  });

  it('shows a placeholder until activities are bound', () => {
    render(<ActivityCarousel />);
    expect(
      screen.getByText(/Activity Carousel placeholder/),
    ).toBeInTheDocument();
  });
});
