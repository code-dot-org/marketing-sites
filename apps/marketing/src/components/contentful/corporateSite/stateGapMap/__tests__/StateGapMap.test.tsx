import {fireEvent, render, screen, waitFor} from '@testing-library/react';

import StateGapMap from '../StateGapMap';

describe('StateGapMap', () => {
  it('renders a default instructional panel', () => {
    render(<StateGapMap />);

    expect(screen.getByText('Select a state')).toBeInTheDocument();
    expect(
      screen.getByText(
        'Hover a state to preview its metrics. Click or tap a state to download the state report and presentation deck.',
      ),
    ).toBeInTheDocument();
  });

  it('updates the panel when a state is hovered', () => {
    render(<StateGapMap />);

    fireEvent.mouseEnter(screen.getByRole('button', {name: /California/i}));

    expect(screen.getByText('California')).toBeInTheDocument();
    expect(screen.getByText('Access')).toBeInTheDocument();
    expect(screen.getByText('Participation')).toBeInTheDocument();
    expect(screen.getByText('Gap')).toBeInTheDocument();
  });

  it('returns to the default panel when the pointer leaves the map without a lock', () => {
    render(<StateGapMap />);

    fireEvent.mouseEnter(screen.getByRole('button', {name: /California/i}));
    fireEvent.mouseLeave(
      screen.getByRole('img', {name: /United States state gap analysis map/i}),
    );

    expect(screen.queryByText('California')).not.toBeInTheDocument();
    expect(screen.getByText('Select a state')).toBeInTheDocument();
  });

  it('locks a state selection on click', () => {
    render(<StateGapMap />);

    fireEvent.click(screen.getByRole('button', {name: /California/i}));

    expect(screen.getByText('California')).toBeInTheDocument();
    expect(
      screen.getByRole('button', {name: /Close selected state panel/i}),
    ).toBeInTheDocument();
  });

  it('transfers the lock to a new state when clicked', () => {
    render(<StateGapMap />);

    fireEvent.click(screen.getByRole('button', {name: /California/i}));
    fireEvent.click(screen.getByRole('button', {name: /New York/i}));

    expect(screen.getByText('New York')).toBeInTheDocument();
  });

  it('clears a locked selection from the close button', () => {
    render(<StateGapMap />);

    fireEvent.click(screen.getByRole('button', {name: /California/i}));
    fireEvent.click(
      screen.getByRole('button', {name: /Close selected state panel/i}),
    );

    expect(screen.getByText('Select a state')).toBeInTheDocument();
    expect(
      screen.queryByRole('button', {name: /Close selected state panel/i}),
    ).not.toBeInTheDocument();
  });

  it('clears a locked selection from an outside click', async () => {
    render(<StateGapMap />);

    fireEvent.click(screen.getByRole('button', {name: /California/i}));
    fireEvent.mouseDown(screen.getByTestId('state-gap-map-backdrop'));

    await waitFor(() => {
      expect(screen.getByText('Select a state')).toBeInTheDocument();
    });
  });
});
