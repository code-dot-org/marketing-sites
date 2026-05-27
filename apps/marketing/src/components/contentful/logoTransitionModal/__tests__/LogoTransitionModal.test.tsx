import {render} from '@testing-library/react';

import LogoTransitionModal from '../LogoTransitionModal';

// Mock the LogoTransitionOverlay so we can assert on the props the wrapper
// passes to it without spinning up the full overlay machinery (matchMedia,
// timers, singleton state, etc.).
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
  // The new component-library subpath only resolves once the package has been
  // built; tell Jest not to try resolving it from disk.
  {virtual: true},
);

// Image imports under @public/images/* are handled by next/jest's built-in
// image-asset mock. We only need to validate that the wrapper forwards a
// non-empty src for both the animation and the SVG to the overlay.

describe('LogoTransitionModal', () => {
  beforeEach(() => {
    overlayPropsSpy.mockClear();
  });

  it('renders the LogoTransitionOverlay with bundled asset sources', () => {
    render(<LogoTransitionModal />);
    expect(overlayPropsSpy).toHaveBeenCalledTimes(1);
    const props = overlayPropsSpy.mock.calls[0][0];
    expect(typeof props.mediaSrc).toBe('string');
    expect(props.mediaSrc.length).toBeGreaterThan(0);
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
    const rect = props.mediaEndFrameLogoNormalizedRect;
    expect(rect).toBeDefined();
    for (const key of ['x', 'y', 'width', 'height'] as const) {
      expect(rect[key]).toBeGreaterThanOrEqual(0);
      expect(rect[key]).toBeLessThanOrEqual(1);
    }
    // Logo must fit inside the animation bounds.
    expect(rect.x + rect.width).toBeLessThanOrEqual(1);
    expect(rect.y + rect.height).toBeLessThanOrEqual(1);
  });

  it('passes a positive mediaAspectRatio', () => {
    render(<LogoTransitionModal />);
    const props = overlayPropsSpy.mock.calls[0][0];
    expect(typeof props.mediaAspectRatio).toBe('number');
    expect(props.mediaAspectRatio).toBeGreaterThan(0);
  });

  it('passes a positive animationDurationMs', () => {
    render(<LogoTransitionModal />);
    const props = overlayPropsSpy.mock.calls[0][0];
    expect(typeof props.animationDurationMs).toBe('number');
    expect(props.animationDurationMs).toBeGreaterThan(0);
  });
});
