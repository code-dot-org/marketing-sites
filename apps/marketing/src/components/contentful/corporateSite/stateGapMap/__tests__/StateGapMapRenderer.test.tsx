import {act, fireEvent, render, screen} from '@testing-library/react';

import {stateGapMapData} from '../data';
import StateGapMapRenderer from '../StateGapMapRenderer';

describe('StateGapMapRenderer', () => {
  const renderComponent = (props = {}) =>
    render(
      <StateGapMapRenderer
        dataset={stateGapMapData}
        hoveredCode={null}
        lockedCode={null}
        onHover={() => {}}
        onSelect={() => {}}
        onClearHover={() => {}}
        {...props}
      />,
    );

  it('exposes interactive state regions by role and name', () => {
    renderComponent();

    expect(screen.getByRole('button', {name: /Alabama/i})).toBeInTheDocument();
    expect(
      screen.getByRole('button', {name: /Washington, D\.C\./i}),
    ).toBeInTheDocument();
  });

  it('allows keyboard selection for a state', () => {
    const onSelect = jest.fn();
    renderComponent({onSelect});

    const california = screen.getByRole('button', {name: /California/i});
    act(() => {
      california.focus();
    });
    fireEvent.keyDown(california, {key: 'Enter'});

    expect(onSelect).toHaveBeenCalledWith('CA');
  });

  it('renders Alaska and Hawaii as inset regions', () => {
    renderComponent();

    expect(screen.getByRole('button', {name: /Alaska/i})).toHaveAttribute(
      'data-display-region',
      'alaskaInset',
    );
    expect(screen.getByRole('button', {name: /Hawaii/i})).toHaveAttribute(
      'data-display-region',
      'hawaiiInset',
    );
  });

  it('renders small East Coast states as selectable regions', () => {
    renderComponent();

    expect(
      screen.getByRole('button', {name: /Rhode Island/i}),
    ).toBeInTheDocument();
    expect(screen.getByRole('button', {name: /Delaware/i})).toBeInTheDocument();
    expect(
      screen.getByRole('button', {name: /Washington, D\.C\./i}),
    ).toBeInTheDocument();
  });
});
