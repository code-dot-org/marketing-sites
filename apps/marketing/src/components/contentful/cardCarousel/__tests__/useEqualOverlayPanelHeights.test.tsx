import {renderHook} from '@testing-library/react';
import {createRef} from 'react';

import {
  OVERLAY_PANEL_SELECTOR,
  useEqualOverlayPanelHeights,
} from '../useEqualOverlayPanelHeights';

class MockResizeObserver {
  static instances: MockResizeObserver[] = [];
  observed: Element[] = [];
  callback: ResizeObserverCallback;
  constructor(callback: ResizeObserverCallback) {
    this.callback = callback;
    MockResizeObserver.instances.push(this);
  }
  observe(el: Element) {
    this.observed.push(el);
  }
  unobserve() {}
  disconnect() {
    this.observed = [];
  }
}

const panelTestId = OVERLAY_PANEL_SELECTOR.match(/"(.+)"/)![1];

// Builds a container holding `heights.length` panels whose offsetHeight is
// stubbed (jsdom has no layout).
const buildContainer = (heights: number[]) => {
  const container = document.createElement('div');
  const panels = heights.map(height => {
    const panel = document.createElement('div');
    panel.setAttribute('data-testid', panelTestId);
    Object.defineProperty(panel, 'offsetHeight', {
      get: () => height,
      configurable: true,
    });
    container.appendChild(panel);
    return panel;
  });
  document.body.appendChild(container);
  return {container, panels};
};

describe('useEqualOverlayPanelHeights', () => {
  let originalResizeObserver: typeof ResizeObserver | undefined;
  let rafSpy: jest.SpyInstance;

  beforeEach(() => {
    MockResizeObserver.instances = [];
    originalResizeObserver = global.ResizeObserver;
    global.ResizeObserver =
      MockResizeObserver as unknown as typeof ResizeObserver;
    // Run measurement frames synchronously.
    rafSpy = jest
      .spyOn(window, 'requestAnimationFrame')
      .mockImplementation((cb: FrameRequestCallback) => {
        cb(0);
        return 0;
      });
  });

  afterEach(() => {
    global.ResizeObserver = originalResizeObserver as typeof ResizeObserver;
    rafSpy.mockRestore();
    document.body.innerHTML = '';
  });

  const renderTheHook = (
    container: HTMLElement,
    enabled = true,
    cardCount = 2,
  ) => {
    const ref = createRef<HTMLElement>();
    (ref as {current: HTMLElement | null}).current = container;
    return renderHook(
      ({on, count}) => useEqualOverlayPanelHeights(ref, on, count),
      {initialProps: {on: enabled, count: cardCount}},
    );
  };

  it('applies the tallest natural height as min-height on every panel', () => {
    const {container, panels} = buildContainer([120, 180, 150]);
    renderTheHook(container, true, 3);
    panels.forEach(panel => {
      expect(panel.style.minHeight).toBe('180px');
    });
  });

  it('observes every panel and re-equalizes on resize', () => {
    const {container, panels} = buildContainer([120, 180]);
    renderTheHook(container);
    const observer = MockResizeObserver.instances[0];
    expect(observer.observed).toEqual(panels);

    // Content reflow: the second panel shrinks below the first.
    Object.defineProperty(panels[1], 'offsetHeight', {
      get: () => 100,
      configurable: true,
    });
    observer.callback([], observer as unknown as ResizeObserver);
    panels.forEach(panel => {
      expect(panel.style.minHeight).toBe('120px');
    });
  });

  it('does nothing when disabled or with fewer than two panels', () => {
    const {container, panels} = buildContainer([120, 180]);
    renderTheHook(container, false);
    expect(panels[0].style.minHeight).toBe('');

    const single = buildContainer([140]);
    renderTheHook(single.container, true, 1);
    expect(single.panels[0].style.minHeight).toBe('');
    expect(MockResizeObserver.instances).toHaveLength(0);
  });

  it('clears the applied min-heights on unmount', () => {
    const {container, panels} = buildContainer([120, 180]);
    const {unmount} = renderTheHook(container);
    expect(panels[0].style.minHeight).toBe('180px');
    unmount();
    panels.forEach(panel => {
      expect(panel.style.minHeight).toBe('');
    });
  });
});
