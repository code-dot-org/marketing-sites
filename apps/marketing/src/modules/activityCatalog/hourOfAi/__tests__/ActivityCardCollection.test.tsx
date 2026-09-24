import {render, screen} from '@testing-library/react';
import '@testing-library/jest-dom';

import ActivityCardCollection from '@/modules/activityCatalog/hourOfAi/ActivityCardCollection';
import {Activity} from '@/modules/activityCatalog/types/Activity';

jest.mock('@/providers/statsig/client', () => ({
  useStatsigLogger: jest.fn(() => ({logEvent: jest.fn()})),
}));

const link = (label: string, primaryTarget: string) =>
  JSON.stringify({fields: {label, primaryTarget, isThisAnExternalLink: true}});

// Shaped like a createDatabase document.
const activity = {
  title: 'Machine Learning Magic',
  shortDescription: 'Train a model to sort pictures.',
  image: 'https://localhost/activity.png',
  organization: ['Example Org'],
  ages: ['9-12'],
  topic: ['Artificial Intelligence'],
  activityType: ['Lesson plan'],
  length: ['One hour'],
  tutorialID: 'ml-magic',
  primaryLinkRef: link('Start', 'https://example.org/start'),
  secondaryLinkRef: link('Teacher notes', 'https://example.org/notes'),
} as unknown as Activity;

describe('ActivityCardCollection', () => {
  it('renders an Activity Card per activity', () => {
    render(<ActivityCardCollection activities={[activity]} />);
    expect(
      screen.getByRole('heading', {level: 4, name: 'Machine Learning Magic'}),
    ).toBeInTheDocument();
    expect(screen.getByText('Example Org')).toBeInTheDocument();
    expect(screen.getByRole('link', {name: /Start/})).toHaveAttribute(
      'href',
      'https://example.org/start',
    );
    expect(
      screen.getByRole('link', {name: /Teacher notes/}),
    ).toBeInTheDocument();
  });

  it('renders Black titles', () => {
    render(<ActivityCardCollection activities={[activity]} />);
    expect(screen.getByRole('heading', {level: 4})).toHaveStyle({
      color: 'var(--palette-black)',
    });
  });

  it('hides topics, ages, activity type and length', () => {
    render(<ActivityCardCollection activities={[activity]} />);
    for (const text of [
      'Artificial Intelligence',
      'Ages 9-12',
      'Lesson plan',
      'One hour',
    ]) {
      expect(screen.queryByText(text)).toBeNull();
    }
  });

  it('renders without a teacher link', () => {
    render(
      <ActivityCardCollection
        activities={[{...activity, secondaryLinkRef: undefined}]}
      />,
    );
    expect(screen.queryByRole('link', {name: /Teacher notes/})).toBeNull();
  });

  it('says when nothing matches', () => {
    render(<ActivityCardCollection activities={[]} />);
    expect(screen.getByText('No activities found')).toBeInTheDocument();
  });
});
