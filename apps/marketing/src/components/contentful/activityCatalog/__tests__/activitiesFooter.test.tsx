import {render, screen} from '@testing-library/react';

import {ActivityType} from '@/modules/activityCatalog/types/Activity';

import ActivitiesFooter from '../activitiesFooter';

describe('ActivitiesFooter', () => {
  it('renders "Legacy Hour of Code Activities" button on Hour of AI page', () => {
    render(<ActivitiesFooter activityType={ActivityType.HOUR_OF_AI} />);
    expect(
      screen.getByRole('link', {name: /Legacy Hour of Code Activities/i}),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('link', {name: /Hour of AI Activities/i}),
    ).not.toBeInTheDocument();
  });

  it('renders "Hour of AI Activities" button on Hour of Code page', () => {
    render(<ActivitiesFooter activityType={ActivityType.HOUR_OF_CODE} />);
    expect(
      screen.getByRole('link', {name: /Hour of AI Activities/i}),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('link', {name: /Legacy Hour of Code Activities/i}),
    ).not.toBeInTheDocument();
  });

  it('renders correct href for Hour of AI page', () => {
    render(<ActivitiesFooter activityType={ActivityType.HOUR_OF_AI} />);
    expect(
      screen.getByRole('link', {name: /Legacy Hour of Code Activities/i}),
    ).toHaveAttribute('href', '/activities/hour-of-code');
  });

  it('renders correct href for Hour of Code page', () => {
    render(<ActivitiesFooter activityType={ActivityType.HOUR_OF_CODE} />);
    expect(
      screen.getByRole('link', {name: /Hour of AI Activities/i}),
    ).toHaveAttribute('href', '/activities/hour-of-ai');
  });
});
