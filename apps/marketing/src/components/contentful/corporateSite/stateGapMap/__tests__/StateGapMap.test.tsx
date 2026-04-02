import {fireEvent, render, screen, waitFor} from '@testing-library/react';

import StateGapMap from '../StateGapMap';

describe('StateGapMap', () => {
  const getStateElement = (container: HTMLElement, code: string) => {
    const element = container.querySelector<SVGElement>(
      `[data-name="${code}"]`,
    );

    if (!element) {
      throw new Error(`Missing state element for ${code}`);
    }

    return element;
  };

  it('renders a default instructional panel', () => {
    render(<StateGapMap />);

    expect(screen.getByText('Select a state')).toBeInTheDocument();
    expect(
      screen.getByText(
        'Hover a state to preview its metrics. Click or tap a state to download the state report and presentation deck.',
      ),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('group', {name: /policy tier and availability legend/i}),
    ).toBeInTheDocument();
    expect(screen.getByText('Data unavailable')).toBeInTheDocument();
  });

  it('updates the panel when a state is hovered', () => {
    const {container} = render(<StateGapMap />);

    fireEvent.mouseEnter(getStateElement(container, 'CA'));

    expect(screen.getByText('California')).toBeInTheDocument();
    expect(screen.getByText('Access')).toBeInTheDocument();
    expect(screen.getByText('Participation')).toBeInTheDocument();
    expect(screen.getByText('Gap')).toBeInTheDocument();
  });

  it('returns to the default panel when the pointer leaves the map without a lock', () => {
    const {container} = render(<StateGapMap />);

    fireEvent.mouseEnter(getStateElement(container, 'CA'));
    fireEvent.mouseLeave(
      screen.getByRole('group', {
        name: /United States state gap analysis map/i,
      }),
    );

    expect(screen.queryByText('California')).not.toBeInTheDocument();
    expect(screen.getByText('Select a state')).toBeInTheDocument();
  });

  it('locks a state selection on click', () => {
    const {container} = render(<StateGapMap />);

    fireEvent.click(getStateElement(container, 'CA'));

    expect(screen.getByText('California')).toBeInTheDocument();
    expect(
      screen.getByRole('button', {name: /Close selected state panel/i}),
    ).toBeInTheDocument();
  });

  it('transfers the lock to a new state when clicked', () => {
    const {container} = render(<StateGapMap />);

    fireEvent.click(getStateElement(container, 'CA'));
    fireEvent.click(getStateElement(container, 'NY'));

    expect(screen.getByText('New York')).toBeInTheDocument();
  });

  it('clears a locked selection from the close button', () => {
    const {container} = render(<StateGapMap />);

    fireEvent.click(getStateElement(container, 'CA'));
    fireEvent.click(
      screen.getByRole('button', {name: /Close selected state panel/i}),
    );

    expect(screen.getByText('Select a state')).toBeInTheDocument();
    expect(
      screen.queryByRole('button', {name: /Close selected state panel/i}),
    ).not.toBeInTheDocument();
  });

  it('clears a locked selection from an outside click', async () => {
    const {container} = render(<StateGapMap />);

    fireEvent.click(getStateElement(container, 'CA'));
    fireEvent.mouseDown(screen.getByTestId('state-gap-map-backdrop'));

    await waitFor(() => {
      expect(screen.getByText('Select a state')).toBeInTheDocument();
    });
  });
});
