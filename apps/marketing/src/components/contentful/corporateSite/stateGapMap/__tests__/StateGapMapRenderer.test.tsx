import {fireEvent, render} from '@testing-library/react';

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

  const getStateElement = (container: HTMLElement, code: string) => {
    const element = container.querySelector<SVGElement>(
      `[data-name="${code}"]`,
    );

    if (!element) {
      throw new Error(`Missing state element for ${code}`);
    }

    return element;
  };

  it('renders state elements for the default U.S. map', () => {
    const {container} = renderComponent();

    expect(getStateElement(container, 'AL')).toBeInTheDocument();
    expect(getStateElement(container, 'AK')).toBeInTheDocument();
    expect(getStateElement(container, 'HI')).toBeInTheDocument();
  });

  it('forwards click selection for a state', () => {
    const onSelect = jest.fn();
    const {container} = renderComponent({onSelect});

    fireEvent.click(getStateElement(container, 'CA'));

    expect(onSelect).toHaveBeenCalledWith('CA');
  });

  it('keeps Alaska and Hawaii on the rendered map', () => {
    const {container} = renderComponent();

    expect(getStateElement(container, 'AK')).toBeInTheDocument();
    expect(getStateElement(container, 'HI')).toBeInTheDocument();
  });

  it('renders small East Coast states as selectable regions', () => {
    const {container} = renderComponent();

    expect(getStateElement(container, 'RI')).toBeInTheDocument();
    expect(getStateElement(container, 'DE')).toBeInTheDocument();
    expect(getStateElement(container, 'DC')).toBeInTheDocument();
  });
});
