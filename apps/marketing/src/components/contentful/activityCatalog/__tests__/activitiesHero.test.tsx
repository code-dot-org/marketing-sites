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
});
