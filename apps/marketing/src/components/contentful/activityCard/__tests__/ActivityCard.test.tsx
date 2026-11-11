import {fireEvent, render, screen} from '@testing-library/react';
import '@testing-library/jest-dom';

import ActivityCard, {
  ActivityCardProps,
} from '@/components/contentful/activityCard';
import {EVENT} from '@/providers/statsig/statsigConstants';
import {LinkEntry} from '@/types/contentful/entries/Link';

const mockLogEvent = jest.fn();
jest.mock('@/providers/statsig/client', () => ({
  useStatsigLogger: jest.fn(() => ({logEvent: mockLogEvent})),
}));

const link = (label: string, primaryTarget: string) =>
  ({
    fields: {label, primaryTarget, isThisAnExternalLink: true},
  }) as LinkEntry;

const defaultProps: ActivityCardProps = {
  title: 'Machine Learning Magic',
  shortDescription: 'Train a model to sort pictures.',
  organization: 'Example Org',
  ages: ['6-8', '9-12'],
  topics: ['Artificial Intelligence'],
  activityType: ['Lesson plan'],
  length: ['One hour'],
  image: '//contentful-images.code.org/space/asset/hash/activity.png',
  tutorialLink: link('Start', 'https://example.org/start'),
  teacherLink: link('Teacher notes', 'https://example.org/notes'),
  tutorialId: 'ml-magic',
};

describe('ActivityCard', () => {
  beforeEach(() => mockLogEvent.mockClear());

  it('renders the activity fields', () => {
    render(<ActivityCard {...defaultProps} />);
    expect(
      screen.getByRole('heading', {level: 4, name: 'Machine Learning Magic'}),
    ).toBeInTheDocument();
    expect(screen.getByText('Example Org')).toBeInTheDocument();
    expect(
      screen.getByText('Train a model to sort pictures.'),
    ).toBeInTheDocument();
    expect(screen.getByText('Artificial Intelligence')).toBeInTheDocument();
    expect(screen.getByText('6-12')).toBeInTheDocument();
    expect(screen.getByText('Lesson plan')).toBeInTheDocument();
    expect(screen.getByText('One hour')).toBeInTheDocument();
  });

  it('renders the tutorial button and teacher notes link', () => {
    render(<ActivityCard {...defaultProps} />);
    expect(screen.getByRole('link', {name: /Start/})).toHaveAttribute(
      'href',
      'https://example.org/start',
    );
    expect(screen.getByRole('link', {name: /Teacher notes/})).toHaveAttribute(
      'target',
      '_blank',
    );
  });

  it('renders the organization as a Light Blue badge by default', () => {
    const {rerender} = render(<ActivityCard {...defaultProps} />);
    expect(screen.getByText('Example Org')).toHaveStyle({
      backgroundColor: 'var(--codeai-blue-light)',
    });
    rerender(<ActivityCard {...defaultProps} organizationBadgeColor="pink" />);
    expect(screen.getByText('Example Org')).toHaveStyle({
      backgroundColor: 'var(--codeai-pink-primary)',
    });
  });

  it('places the organization badge under the title', () => {
    render(<ActivityCard {...defaultProps} />);
    const title = screen.getByRole('heading', {level: 4});
    expect(
      title.compareDocumentPosition(screen.getByText('Example Org')) &
        Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
  });

  it('lists labeled topics and ages first, then the other details', () => {
    render(
      <ActivityCard
        {...defaultProps}
        topics={['Math', 'Artificial Intelligence']}
      />,
    );
    const details = screen.getAllByRole('listitem').map(li => li.textContent);
    expect(details).toEqual([
      'Topics: Math, Artificial Intelligence',
      'Ages: 6-12',
      'Activity type: Lesson plan',
      'Length: One hour',
    ]);
  });

  it('caps the topics at four', () => {
    render(
      <ActivityCard
        {...defaultProps}
        topics={[
          'Math',
          'Science',
          'Library',
          'Social Studies',
          'Language Arts',
        ]}
      />,
    );
    expect(screen.getAllByRole('listitem')[0]).toHaveTextContent(
      'Topics: Math, Science, Library, Social Studies, ...',
    );
  });

  it('labels non-age audiences as ages too', () => {
    render(<ActivityCard {...defaultProps} ages={['Educators']} />);
    expect(screen.getAllByRole('listitem')[1]).toHaveTextContent(
      'Ages: Educators',
    );
  });

  it('pins teacher notes, details and Start under a gap after the description', () => {
    render(<ActivityCard {...defaultProps} />);
    const notes = screen.getByRole('link', {name: /Teacher notes/});
    const list = screen.getByRole('list');
    const start = screen.getByRole('link', {name: /Start/});
    expect(notes).toHaveClass('MuiLink-root');
    expect(start).toHaveStyle({width: '100%'});
    // Order: Teacher notes, then the details, then Start.
    const follows = (a: Element, b: Element) =>
      !!(a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING);
    expect(follows(notes, list)).toBe(true);
    expect(follows(list, start)).toBe(true);
    // The flexible gap opens under the description.
    expect(list.parentElement).toHaveStyle({marginTop: 'auto'});
    expect(start.parentElement).not.toHaveStyle({marginTop: 'auto'});
  });

  it('hides each field when its toggle is off', () => {
    render(
      <ActivityCard
        {...defaultProps}
        showOrganization={false}
        showAges={false}
        showTopics={false}
        showActivityType={false}
        showLength={false}
        showTutorialLink={false}
        showTeacherLink={false}
      />,
    );
    for (const text of [
      'Example Org',
      '6-12',
      'Artificial Intelligence',
      'Lesson plan',
      'One hour',
    ]) {
      expect(screen.queryByText(text)).not.toBeInTheDocument();
    }
    expect(screen.queryByRole('link')).not.toBeInTheDocument();
  });

  it('logs the Card click events', () => {
    render(<ActivityCard {...defaultProps} />);
    fireEvent.click(screen.getByRole('link', {name: /Start/}));
    fireEvent.click(screen.getByRole('link', {name: /Teacher notes/}));
    expect(mockLogEvent).toHaveBeenNthCalledWith(
      1,
      EVENT.CARD_PRIMARY_BUTTON_CLICKED,
      'ml-magic',
      expect.objectContaining({
        cardId: 'ml-magic',
        cardTitle: 'Machine Learning Magic',
        buttonTarget: 'https://example.org/start',
      }),
    );
    expect(mockLogEvent).toHaveBeenNthCalledWith(
      2,
      EVENT.CARD_SECONDARY_BUTTON_CLICKED,
      'ml-magic',
      expect.objectContaining({buttonTarget: 'https://example.org/notes'}),
    );
  });

  describe('long descriptions', () => {
    // jsdom has no layout; fake a description taller than its four lines.
    let scrollHeight: jest.SpyInstance | undefined;
    const mockOverflow = (overflowing: boolean) => {
      scrollHeight = jest
        .spyOn(HTMLElement.prototype, 'scrollHeight', 'get')
        .mockReturnValue(overflowing ? 120 : 0);
    };

    afterEach(() => scrollHeight?.mockRestore());

    it('clamps to four lines and toggles Read more / Read less', () => {
      mockOverflow(true);
      render(<ActivityCard {...defaultProps} />);
      const text = screen.getByText('Train a model to sort pictures.');
      // jsdom drops -webkit-line-clamp; overflow is the clamp's visible half.
      expect(text).toHaveStyle({overflow: 'hidden'});

      fireEvent.click(
        screen.getByRole('button', {
          name: 'Read more about Machine Learning Magic',
        }),
      );
      const less = screen.getByRole('button', {name: /Read less/});
      expect(less).toHaveAttribute('aria-expanded', 'true');
      expect(less).toHaveFocus();
      expect(text).not.toHaveStyle({overflow: 'hidden'});

      fireEvent.click(less);
      expect(screen.getByRole('button', {name: /Read more/})).toHaveAttribute(
        'aria-expanded',
        'false',
      );
    });

    it('shows no Read more when the text fits', () => {
      mockOverflow(false);
      render(<ActivityCard {...defaultProps} />);
      expect(screen.queryByRole('button', {name: /Read more/})).toBeNull();
    });
  });

  it('uses the authored width, or auto', () => {
    const {container, rerender} = render(
      <ActivityCard {...defaultProps} width="325px" />,
    );
    expect(container.querySelector('article')).toHaveStyle({width: '325px'});
    rerender(<ActivityCard {...defaultProps} />);
    expect(container.querySelector('article')).toHaveStyle({width: 'auto'});
  });

  it('shows a placeholder until a title is bound', () => {
    render(<ActivityCard />);
    expect(screen.getByText(/Activity Card placeholder/)).toBeInTheDocument();
  });
});
