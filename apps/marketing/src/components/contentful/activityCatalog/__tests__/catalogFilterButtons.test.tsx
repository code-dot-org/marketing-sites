import {fireEvent, render, screen} from '@testing-library/react';

import {ActivityType} from '@/modules/activityCatalog/types/Activity';

import CatalogFilterButtons from '../catalogFilterButtons';

describe('CatalogFilterButtons', () => {
  it('renders the three filters in a labelled group', () => {
    render(<CatalogFilterButtons value={undefined} onChange={jest.fn()} />);

    const group = screen.getByRole('group', {name: 'Activity catalog'});
    expect(
      Array.from(group.querySelectorAll('button')).map(b => b.textContent),
    ).toEqual(['All activities', 'Hour of AI', 'Hour of Code']);
  });

  it.each([
    [undefined, 'All activities'],
    [ActivityType.HOUR_OF_AI, 'Hour of AI'],
    [ActivityType.HOUR_OF_CODE, 'Hour of Code'],
  ])('marks only the %s filter as pressed', (value, label) => {
    render(<CatalogFilterButtons value={value} onChange={jest.fn()} />);

    screen.getAllByRole('button').forEach(button => {
      expect(button).toHaveAttribute(
        'aria-pressed',
        String(button.textContent === label),
      );
    });
  });

  it('reports the clicked catalog, and undefined for All activities', () => {
    const onChange = jest.fn();
    render(
      <CatalogFilterButtons
        value={ActivityType.HOUR_OF_AI}
        onChange={onChange}
      />,
    );

    fireEvent.click(screen.getByRole('button', {name: 'Hour of Code'}));
    fireEvent.click(screen.getByRole('button', {name: 'All activities'}));

    expect(onChange.mock.calls).toEqual([
      [ActivityType.HOUR_OF_CODE],
      [undefined],
    ]);
  });
});
