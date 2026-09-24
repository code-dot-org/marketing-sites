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
    expect(screen.getByText('Ages 6-12')).toBeInTheDocument();
    expect(screen.getByText('Lesson plan')).toBeInTheDocument();
    expect(screen.getByText('One hour')).toBeInTheDocument();
  });

  it('renders the tutorial and teacher links as buttons', () => {
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

  it('lists topics with the details, after the length', () => {
    render(
      <ActivityCard
        {...defaultProps}
        topics={['Math', 'Artificial Intelligence']}
      />,
    );
    const details = screen.getAllByRole('listitem').map(li => li.textContent);
    expect(details.at(-1)).toBe('Topics: Math, Artificial Intelligence');
    expect(details.at(-2)).toBe('Length: One hour');
  });

  it('renders both buttons at full width', () => {
    render(<ActivityCard {...defaultProps} />);
    for (const name of [/Start/, /Teacher notes/]) {
      expect(screen.getByRole('link', {name})).toHaveStyle({width: '100%'});
    }
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
      'Ages 6-12',
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
