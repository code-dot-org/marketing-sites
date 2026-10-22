import {render, screen} from '@testing-library/react';

import {ActivityType} from '@/modules/activityCatalog/types/Activity';

import ActivitiesHero from '../activitiesHero';

describe('ActivitiesHero', () => {
  it('renders Hour of Code hero content', () => {
    render(<ActivitiesHero activityType={ActivityType.HOUR_OF_CODE} />);
    expect(
      screen.getByRole('heading', {name: /Explore Hour of Code Activities/i}),
    ).toBeInTheDocument();
  });

  it('renders Hour of AI hero content', () => {
    render(<ActivitiesHero activityType={ActivityType.HOUR_OF_AI} />);
    expect(
      screen.getByRole('heading', {name: /Explore Hour of AI Activities/i}),
    ).toBeInTheDocument();
  });

  it('renders correct text for both activity types', () => {
    const {rerender} = render(
      <ActivitiesHero activityType={ActivityType.HOUR_OF_CODE} />,
    );
    expect(
      screen.getByText(/Explore Hour of Code Activities/i),
    ).toBeInTheDocument();
    rerender(<ActivitiesHero activityType={ActivityType.HOUR_OF_AI} />);
    expect(
      screen.getByText(/Explore Hour of AI Activities/i),
    ).toBeInTheDocument();
  });

  it('renders all-activities content without an activity type', () => {
    render(<ActivitiesHero hourOfAi />);
    expect(
      screen.getByRole('heading', {level: 1, name: 'Explore Activities'}),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        /^Dive into the Hour of AI and Hour of Code activities below!/,
      ),
    ).toBeInTheDocument();
  });

  it.each([
    [ActivityType.HOUR_OF_AI, 'Hour of AI'],
    [ActivityType.HOUR_OF_CODE, 'Hour of Code'],
  ])('matches the subtext to %s', (activityType, name) => {
    render(<ActivitiesHero activityType={activityType} hourOfAi />);
    expect(
      screen.getByText(new RegExp(`^Dive into the ${name} activities below!`)),
    ).toBeInTheDocument();
  });

  it('uses the legacy fixed title styles by default', () => {
    render(<ActivitiesHero activityType={ActivityType.HOUR_OF_AI} />);
    expect(screen.getByRole('heading', {level: 1})).not.toHaveClass(
      'MuiTypography-h1',
    );
  });

  it('uses the theme h1 variant on Hour of AI', () => {
    render(<ActivitiesHero activityType={ActivityType.HOUR_OF_AI} hourOfAi />);
    expect(screen.getByRole('heading', {level: 1})).toHaveClass(
      'MuiTypography-h1',
    );
  });
});
