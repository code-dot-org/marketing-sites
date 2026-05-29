import {render} from '@testing-library/react';

import LogoTransitionModal from '../LogoTransitionModal';

// Mock the overlay so we can assert on the props the wrapper passes without
// the full overlay machinery (matchMedia, timers, singleton state).
const overlayPropsSpy = jest.fn();

jest.mock(
  '@code-dot-org/component-library/logoTransitionOverlay',
  () => ({
    __esModule: true,
    default: (props: Record<string, unknown>) => {
      overlayPropsSpy(props);
      return <div data-testid="mock-overlay" />;
    },
  }),
  // Subpath only resolves after the package is built; don't resolve from disk.
  {virtual: true},
);

// @public/images/* imports use next/jest's built-in image-asset mock; we just
// check the wrapper forwards the animation (children) and a non-empty SVG src
// to the overlay.

describe('LogoTransitionModal', () => {
  beforeEach(() => {
    overlayPropsSpy.mockClear();
  });

  it('renders the LogoTransitionOverlay with the animation and SVG source', () => {
    render(<LogoTransitionModal />);
    expect(overlayPropsSpy).toHaveBeenCalledTimes(1);
    const props = overlayPropsSpy.mock.calls[0][0];
    // The animation is passed as children (the CSS-animated SVG stage).
    expect(props.children).toBeDefined();
    expect(typeof props.svgSrc).toBe('string');
    expect(props.svgSrc.length).toBeGreaterThan(0);
  });

  it('passes the agreed destination selector', () => {
    render(<LogoTransitionModal />);
    const props = overlayPropsSpy.mock.calls[0][0];
    expect(props.destinationSelector).toBe('[data-logo-transition-target]');
  });

  it('passes a normalized end-frame rect with values in [0,1]', () => {
    render(<LogoTransitionModal />);
    const props = overlayPropsSpy.mock.calls[0][0];
    const rect = props.endFrameLogoNormalizedRect;
    expect(rect).toBeDefined();
    for (const key of ['x', 'y', 'width', 'height'] as const) {
      expect(rect[key]).toBeGreaterThanOrEqual(0);
      expect(rect[key]).toBeLessThanOrEqual(1);
    }
    // Logo must fit inside the animation bounds.
    expect(rect.x + rect.width).toBeLessThanOrEqual(1);
    expect(rect.y + rect.height).toBeLessThanOrEqual(1);
  });

  it('passes a positive animationDurationMs', () => {
    render(<LogoTransitionModal />);
    const props = overlayPropsSpy.mock.calls[0][0];
    expect(typeof props.animationDurationMs).toBe('number');
    expect(props.animationDurationMs).toBeGreaterThan(0);
  });
});
