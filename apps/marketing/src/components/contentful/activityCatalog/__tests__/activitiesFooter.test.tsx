import {render, screen} from '@testing-library/react';

import {Brand} from '@/config/brand';
import {ActivityType} from '@/modules/activityCatalog/types/Activity';

import ActivitiesFooter from '../activitiesFooter';

describe('ActivitiesFooter', () => {
  it('renders "Legacy Hour of Code Activities" button on Hour of AI page', () => {
    render(
      <ActivitiesFooter
        brand={Brand.CODE_DOT_ORG}
        activityType={ActivityType.HOUR_OF_AI}
      />,
    );
    expect(
      screen.getByRole('link', {name: /Legacy Hour of Code Activities/i}),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('link', {name: /Hour of AI Activities/i}),
    ).not.toBeInTheDocument();
  });

  it('renders "Hour of AI Activities" button on Hour of Code page', () => {
    render(
      <ActivitiesFooter
        brand={Brand.CODE_DOT_ORG}
        activityType={ActivityType.HOUR_OF_CODE}
      />,
    );
    expect(
      screen.getByRole('link', {name: /Hour of AI Activities/i}),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('link', {name: /Legacy Hour of Code Activities/i}),
    ).not.toBeInTheDocument();
  });

  it('links to the Code.org URL structure on the Code.org brand', () => {
    render(
      <ActivitiesFooter
        brand={Brand.CODE_DOT_ORG}
        activityType={ActivityType.HOUR_OF_AI}
      />,
    );
    expect(
      screen.getByRole('link', {name: /Legacy Hour of Code Activities/i}),
    ).toHaveAttribute('href', '/hour-of-code/activities');
  });

  it('links back to Hour of AI on the Code.org brand', () => {
    render(
      <ActivitiesFooter
        brand={Brand.CODE_DOT_ORG}
        activityType={ActivityType.HOUR_OF_CODE}
      />,
    );
    expect(
      screen.getByRole('link', {name: /Hour of AI Activities/i}),
    ).toHaveAttribute('href', '/hour-of-ai/activities');
  });

  // CSFORALL-COMPAT: remove with the CSforAll brand when csforall is retired.
  it('keeps the legacy URL structure on the CSforAll brand', () => {
    render(
      <ActivitiesFooter
        brand={Brand.CS_FOR_ALL}
        activityType={ActivityType.HOUR_OF_AI}
      />,
    );
    expect(
      screen.getByRole('link', {name: /Legacy Hour of Code Activities/i}),
    ).toHaveAttribute('href', '/activities/hour-of-code');
  });
});
