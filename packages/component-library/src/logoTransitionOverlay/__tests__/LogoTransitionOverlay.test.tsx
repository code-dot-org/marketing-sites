import {act, fireEvent, render, screen} from '@testing-library/react';
import '@testing-library/jest-dom';

import {
  DEFAULT_HANDOFF_TRIGGER_MS,
  DEFAULT_MAX_SHOWS_PER_WINDOW,
  DEFAULT_SHOW_WINDOW_MS,
  LOGO_TRANSITION_OVERLAY_SESSION_STORAGE_KEY,
  LOGO_TRANSITION_OVERLAY_SHOWS_STORAGE_KEY,
} from '../constants';
import LogoTransitionOverlay, {
  LogoTransitionOverlayProps,
  __resetSingletonForTests,
} from '../LogoTransitionOverlay';

// The animation is passed as children; a plain div stands in for the real
// CSS-animated SVG stage.
const SAMPLE_CHILDREN = <div data-testid="animation-stage" />;
const SAMPLE_SVG = '/test-fixtures/cdo-logo-inverse.svg';
const TEST_ANIMATION_DURATION_MS = 2000;
const TEST_POST_PLAY_HOLD_MS = 1000;
const DEFAULT_PROPS: LogoTransitionOverlayProps = {
  children: SAMPLE_CHILDREN,
  svgSrc: SAMPLE_SVG,
  destinationSelector: '[data-test-destination]',
  endFrameLogoNormalizedRect: {x: 0.25, y: 0.25, width: 0.5, height: 0.5},
  animationDurationMs: TEST_ANIMATION_DURATION_MS,
  postPlayHoldMs: TEST_POST_PLAY_HOLD_MS,
};

type MatchMediaMock = (query: string) => MediaQueryList;

const mockMatchMedia = (reducedMotion: boolean) => {
  const impl: MatchMediaMock = query => ({
    matches: query.includes('reduce') ? reducedMotion : false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(() => false),
  });
  Object.defineProperty(window, 'matchMedia', {
    configurable: true,
    writable: true,
    value: impl,
  });
};

const mountDestination = () => {
  const destination = document.createElement('div');
  destination.setAttribute('data-test-destination', '');
  destination.style.position = 'fixed';
  destination.style.left = '10px';
  destination.style.top = '10px';
  destination.style.width = '40px';
  destination.style.height = '40px';
  destination.getBoundingClientRect = () =>
    ({
      left: 10,
      top: 10,
      right: 50,
      bottom: 50,
      width: 40,
      height: 40,
      x: 10,
      y: 10,
      toJSON: () => ({}),
    }) as DOMRect;
  document.body.appendChild(destination);
  return destination;
};

// The 'fading' phase adds .mediaWrapper--fading; tests check it to detect a fade.
const getMediaWrapper = () => document.querySelector('.mediaWrapper');

// The overlay commits synchronously on mount (no decode gate). This just flushes
// any pending effect-driven re-renders (commit -> 'playing').
const revealOverlay = async () => {
  await act(async () => {
    await Promise.resolve();
  });
};

let storageSnapshot: {
  cookies: string;
  localKeys: string[];
  sessionKeys: string[];
};

// Throttle storage keys (imported so the tests can't drift from the source).
const SESSION_KEY = LOGO_TRANSITION_OVERLAY_SESSION_STORAGE_KEY;
const SHOWS_KEY = LOGO_TRANSITION_OVERLAY_SHOWS_STORAGE_KEY;

// Seed `count` in-window show timestamps, as prior shows would have.
const seedRecentShows = (count: number) => {
  const now = Date.now();
  const shows = Array.from({length: count}, (_, i) => now - i * 1000);
  window.localStorage.setItem(SHOWS_KEY, JSON.stringify(shows));
};

beforeEach(() => {
  jest.useFakeTimers();
  __resetSingletonForTests();
  mockMatchMedia(false);
  // Start every test with empty local/session storage so throttle state
  // doesn't bleed across tests.
  window.localStorage.clear();
  window.sessionStorage.clear();
  // capture storage baseline so each test can assert no writes
  storageSnapshot = {
    cookies: document.cookie,
    localKeys: Object.keys(window.localStorage),
    sessionKeys: Object.keys(window.sessionStorage),
  };
});

afterEach(() => {
  jest.useRealTimers();
  document.body.innerHTML = '';
  __resetSingletonForTests();
  window.localStorage.clear();
  window.sessionStorage.clear();
});

// No storage of any kind changed; for tests that short-circuit before playing.
const expectNoStorageWritten = () => {
  expect(document.cookie).toBe(storageSnapshot.cookies);
  expect(Object.keys(window.localStorage)).toEqual(storageSnapshot.localKeys);
  expect(Object.keys(window.sessionStorage)).toEqual(
    storageSnapshot.sessionKeys,
  );
};

// On commit (from cleared storage): no cookies, one new sessionStorage key (the
// session flag) and one new localStorage key (the shows list, >=1 timestamp).
const expectThrottleStateRecorded = () => {
  expect(document.cookie).toBe(storageSnapshot.cookies);

  const newSessionKeys = Object.keys(window.sessionStorage).filter(
    k => !storageSnapshot.sessionKeys.includes(k),
  );
  expect(newSessionKeys).toEqual([SESSION_KEY]);
  expect(window.sessionStorage.getItem(SESSION_KEY)).toBe('1');

  const newLocalKeys = Object.keys(window.localStorage).filter(
    k => !storageSnapshot.localKeys.includes(k),
  );
  expect(newLocalKeys).toEqual([SHOWS_KEY]);
  const shows = JSON.parse(window.localStorage.getItem(SHOWS_KEY) ?? '[]');
  expect(Array.isArray(shows)).toBe(true);
  expect(shows.length).toBeGreaterThanOrEqual(1);
  shows.forEach((ts: unknown) => expect(typeof ts).toBe('number'));
};

describe('LogoTransitionOverlay', () => {
  // 1. Reduced-motion bypass
  it('renders null when prefers-reduced-motion is set', () => {
    mockMatchMedia(true);
    const onDismiss = jest.fn();
    const {container} = render(
      <LogoTransitionOverlay {...DEFAULT_PROPS} onDismiss={onDismiss} />,
    );
    expect(container).toBeEmptyDOMElement();
    // onDismiss is fired synchronously in the mount effect for this case; tick
    // any pending timers to let effects settle, then assert nothing was stored.
    act(() => {
      jest.runOnlyPendingTimers();
    });
    expect(onDismiss).toHaveBeenCalled();
    expectNoStorageWritten();
  });

  // 2. Singleton guard
  it('second concurrent instance renders null', async () => {
    const {container: c1} = render(
      <LogoTransitionOverlay {...DEFAULT_PROPS} />,
    );
    const {container: c2} = render(
      <LogoTransitionOverlay {...DEFAULT_PROPS} />,
    );
    // Singleton is claimed synchronously on mount, so the second instance is
    // rejected before it ever decodes.
    await revealOverlay();
    // First instance owns the singleton and renders the dialog.
    expect(c1.querySelector('[role="dialog"]')).not.toBeNull();
    // Second instance is null.
    expect(c2).toBeEmptyDOMElement();
    // Only the first instance committed to playing, so only its throttle state.
    expectThrottleStateRecorded();
  });

  // 3. Successful play -> hold -> fade -> handoff
  it('plays once then holds, fades, and runs handoff to destination', async () => {
    mountDestination();
    const onDismiss = jest.fn();
    render(<LogoTransitionOverlay {...DEFAULT_PROPS} onDismiss={onDismiss} />);
    // Decode-gate resolves -> overlay commits and enters 'playing'.
    await revealOverlay();
    expect(screen.getByRole('dialog')).toBeInTheDocument();

    // The animation-duration timer elapses -> transitions to 'holding'.
    act(() => {
      jest.advanceTimersByTime(TEST_ANIMATION_DURATION_MS);
    });
    // After postPlayHoldMs the fade begins (SVG revealed behind the animation).
    act(() => {
      jest.advanceTimersByTime(TEST_POST_PLAY_HOLD_MS);
    });
    // Once the animation has fully faded (DEFAULT_HANDOFF_TRIGGER_MS) we enter
    // 'handoff' and the SVG begins travelling to the header.
    act(() => {
      jest.advanceTimersByTime(DEFAULT_HANDOFF_TRIGGER_MS);
    });
    // Handoff animation completes (1500ms), overlay unmounts.
    act(() => {
      jest.advanceTimersByTime(1500);
    });
    expect(screen.queryByRole('dialog')).toBeNull();
    expect(onDismiss).toHaveBeenCalled();
    // Played flag set on commit; nothing else written.
    expectThrottleStateRecorded();
  });

  // 3b. Hand-off FLIP maps the logo sub-rect (not the wrapper corner) onto the
  // destination. The wrapper's transform-origin is its top-left, so the logo's
  // offset must be scaled -- otherwise the animation drifts away from the SVG
  // mid-slide (the "out of sync" bug).
  it('FLIPs the animation logo onto the destination with a scaled offset', async () => {
    mountDestination(); // destination rect: left/top 10, 40x40
    render(<LogoTransitionOverlay {...DEFAULT_PROPS} />);
    await revealOverlay();
    // jsdom has no layout; stub the wrapper's on-screen rect.
    const wrapper = getMediaWrapper() as HTMLElement;
    wrapper.getBoundingClientRect = () =>
      ({
        left: 0,
        top: 0,
        right: 1000,
        bottom: 400,
        width: 1000,
        height: 400,
        x: 0,
        y: 0,
        toJSON: () => ({}),
      }) as DOMRect;
    // playing -> holding -> fading -> handoff.
    act(() => jest.advanceTimersByTime(TEST_ANIMATION_DURATION_MS));
    act(() => jest.advanceTimersByTime(TEST_POST_PLAY_HOLD_MS));
    act(() => jest.advanceTimersByTime(DEFAULT_HANDOFF_TRIGGER_MS));
    // endFrameLogoNormalizedRect {x:.25, y:.25, w:.5, h:.5} -> logoWidth 500,
    // scale 40/500 = 0.08, offset (250, 100). dx = 10 - 0.08*250 = -10;
    // dy = 10 - 0.08*100 = 2. (An unscaled offset would give dy = 10 - 100 = -90.)
    expect(wrapper.style.transform).toBe('translate(-10px, 2px) scale(0.08)');
  });

  // 4. Close-button dismissal: overlay disappears immediately, no fade.
  it('dismisses immediately when close button is clicked', async () => {
    const onDismiss = jest.fn();
    const onActiveChange = jest.fn();
    render(
      <LogoTransitionOverlay
        {...DEFAULT_PROPS}
        onDismiss={onDismiss}
        onActiveChange={onActiveChange}
      />,
    );
    await revealOverlay();
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    const closeButton = screen.getByRole('button', {name: 'Close'});
    act(() => {
      fireEvent.click(closeButton);
    });
    // The dialog is removed in the same render pass -- no need to advance
    // timers.
    expect(screen.queryByRole('dialog')).toBeNull();
    expect(onDismiss).toHaveBeenCalled();
    // onActiveChange must have flipped back to false so the header logo
    // is revealed immediately.
    expect(onActiveChange).toHaveBeenCalledWith(false);
  });

  // 5. ESC dismissal: same behavior as the close button.
  it('dismisses immediately when ESC is pressed', async () => {
    const onDismiss = jest.fn();
    const onActiveChange = jest.fn();
    render(
      <LogoTransitionOverlay
        {...DEFAULT_PROPS}
        onDismiss={onDismiss}
        onActiveChange={onActiveChange}
      />,
    );
    await revealOverlay();
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    act(() => {
      fireEvent.keyDown(document, {key: 'Escape'});
    });
    expect(screen.queryByRole('dialog')).toBeNull();
    expect(onDismiss).toHaveBeenCalled();
    expect(onActiveChange).toHaveBeenCalledWith(false);
  });

  // 6. Other key press does not dismiss
  it('does NOT dismiss on non-ESC key presses', async () => {
    render(<LogoTransitionOverlay {...DEFAULT_PROPS} />);
    await revealOverlay();
    act(() => {
      fireEvent.keyDown(document, {key: 'A'});
      fireEvent.keyDown(document, {key: ' '});
      fireEvent.keyDown(document, {key: 'Enter'});
    });
    act(() => {
      jest.advanceTimersByTime(100);
    });
    // The animation must not have begun fading (phase stayed 'playing').
    expect(getMediaWrapper()?.className).not.toContain('mediaWrapper--fading');
    // Committing to play records the throttle state (session flag + shows
    // list); nothing in cookies.
    expectThrottleStateRecorded();
  });

  // 7. Outside-pointer clicks do not dismiss
  it('does NOT dismiss on outside-pointer clicks', async () => {
    render(<LogoTransitionOverlay {...DEFAULT_PROPS} />);
    await revealOverlay();
    // Click on the dialog backdrop (the root overlay element). The overlay
    // intentionally has no onClick handler, so a click should not dismiss.
    const dialog = screen.getByRole('dialog');
    act(() => {
      fireEvent.click(dialog);
    });
    act(() => {
      jest.advanceTimersByTime(100);
    });
    // The animation must not have begun fading (phase stayed 'playing').
    expect(getMediaWrapper()?.className).not.toContain('mediaWrapper--fading');
    expectThrottleStateRecorded();
  });

  // 8. Missing destination element -> unmount after fade + warning
  it('logs warning and unmounts when destination selector finds no element', async () => {
    const consoleWarn = jest
      .spyOn(console, 'warn')
      .mockImplementation(() => {});
    // No destination element appended.
    render(<LogoTransitionOverlay {...DEFAULT_PROPS} />);
    await revealOverlay();
    // Animation duration elapses -> 'holding'.
    act(() => {
      jest.advanceTimersByTime(TEST_ANIMATION_DURATION_MS);
    });
    // Post-play hold completes -> 'fading'.
    act(() => {
      jest.advanceTimersByTime(TEST_POST_PLAY_HOLD_MS);
    });
    // Fade completes (DEFAULT_HANDOFF_TRIGGER_MS) -> 'handoff' effect runs and
    // should detect the missing destination.
    act(() => {
      jest.advanceTimersByTime(DEFAULT_HANDOFF_TRIGGER_MS);
    });
    expect(consoleWarn).toHaveBeenCalledWith(
      expect.stringContaining('destination-not-found'),
    );
    consoleWarn.mockRestore();
    // Committing to play records the throttle state; that's the only expected
    // write.
    expectThrottleStateRecorded();
  });

  // 9. Storage discipline: no cookies written; sessionStorage gains only the
  // session flag and localStorage only the shows-timestamp list.
  it('writes no cookies; records only the session flag and shows list on commit', async () => {
    mountDestination();
    render(<LogoTransitionOverlay {...DEFAULT_PROPS} />);
    await revealOverlay();
    act(() => {
      jest.advanceTimersByTime(
        TEST_ANIMATION_DURATION_MS + TEST_POST_PLAY_HOLD_MS + 1000,
      );
    });
    // Inline one explicit assertion so jest/expect-expect can see it; the
    // helper below covers the full equivalence check.
    expect(document.cookie).toBe(storageSnapshot.cookies);
    expectThrottleStateRecorded();
  });

  // 10. Once-per-session: when the session flag is already set, the overlay
  // short-circuits, never becomes active, and writes nothing.
  it('does not render if already shown this session', () => {
    window.sessionStorage.setItem(SESSION_KEY, '1');
    const onDismiss = jest.fn();
    const onActiveChange = jest.fn();
    const {container} = render(
      <LogoTransitionOverlay
        {...DEFAULT_PROPS}
        onDismiss={onDismiss}
        onActiveChange={onActiveChange}
      />,
    );
    expect(container).toBeEmptyDOMElement();
    expect(onDismiss).toHaveBeenCalled();
    // The header should NOT have been told to hide.
    expect(onActiveChange).not.toHaveBeenCalledWith(true);
    // Bypass path must not record a show.
    expect(window.localStorage.getItem(SHOWS_KEY)).toBeNull();
  });

  // 11. Per-window cap: at the cap, even a fresh session short-circuits, and
  // the read-only bypass leaves the seeded list untouched.
  it('does not render once the per-window cap is reached', () => {
    seedRecentShows(DEFAULT_MAX_SHOWS_PER_WINDOW);
    const seeded = window.localStorage.getItem(SHOWS_KEY);
    const onDismiss = jest.fn();
    const onActiveChange = jest.fn();
    const {container} = render(
      <LogoTransitionOverlay
        {...DEFAULT_PROPS}
        onDismiss={onDismiss}
        onActiveChange={onActiveChange}
      />,
    );
    expect(container).toBeEmptyDOMElement();
    expect(onDismiss).toHaveBeenCalled();
    expect(onActiveChange).not.toHaveBeenCalledWith(true);
    expect(window.localStorage.getItem(SHOWS_KEY)).toBe(seeded);
  });

  // 12. Under the cap in a new session: the overlay plays and appends a show.
  it('renders and appends a show when under the cap in a new session', async () => {
    mountDestination();
    seedRecentShows(DEFAULT_MAX_SHOWS_PER_WINDOW - 1);
    render(<LogoTransitionOverlay {...DEFAULT_PROPS} />);
    await revealOverlay();
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    // The committed show is appended to the existing recent ones.
    const shows = JSON.parse(window.localStorage.getItem(SHOWS_KEY) ?? '[]');
    expect(shows).toHaveLength(DEFAULT_MAX_SHOWS_PER_WINDOW);
    expect(window.sessionStorage.getItem(SESSION_KEY)).toBe('1');
  });

  // 13. Shows older than the window don't count toward the cap and are pruned
  // when a new show is recorded.
  it('ignores and prunes shows older than the rolling window', async () => {
    mountDestination();
    const stale = Date.now() - (DEFAULT_SHOW_WINDOW_MS + 1);
    window.localStorage.setItem(
      SHOWS_KEY,
      JSON.stringify([stale, stale, stale]),
    );
    render(<LogoTransitionOverlay {...DEFAULT_PROPS} />);
    // All seeded shows are outside the window, so the cap is not reached.
    await revealOverlay();
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    // The new write drops the stale entries and keeps only the fresh show.
    const shows = JSON.parse(window.localStorage.getItem(SHOWS_KEY) ?? '[]');
    expect(shows).toHaveLength(1);
    expect(shows[0]).toBeGreaterThan(stale);
  });

  // 14. A malformed shows value can't permanently suppress the overlay: it is
  // treated as "nothing shown recently" and overwritten on the next show.
  it('recovers from a malformed shows value and overwrites it on commit', async () => {
    mountDestination();
    window.localStorage.setItem(SHOWS_KEY, 'not-json');
    render(<LogoTransitionOverlay {...DEFAULT_PROPS} />);
    await revealOverlay();
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    const shows = JSON.parse(window.localStorage.getItem(SHOWS_KEY) ?? '[]');
    expect(shows).toHaveLength(1);
  });

  // 15. The shows list is appended and the session flag set when the overlay
  // commits to rendering.
  it('records a show on commit', async () => {
    render(<LogoTransitionOverlay {...DEFAULT_PROPS} />);
    await revealOverlay();
    const shows = JSON.parse(window.localStorage.getItem(SHOWS_KEY) ?? '[]');
    expect(shows).toHaveLength(1);
    expect(window.sessionStorage.getItem(SESSION_KEY)).toBe('1');
  });

  // 16. The bypass paths (reduced motion, already-shown, capped) record no show;
  // only a committed render does.
  it('does NOT record a show when reduced motion bypasses the overlay', () => {
    mockMatchMedia(true);
    render(<LogoTransitionOverlay {...DEFAULT_PROPS} />);
    act(() => {
      jest.runOnlyPendingTimers();
    });
    expect(window.localStorage.getItem(SHOWS_KEY)).toBeNull();
    expect(window.sessionStorage.getItem(SESSION_KEY)).toBeNull();
  });

  // 17. Web Animations API: the overlay ends playback when the children's
  // animations finish, ahead of the animationDurationMs fallback.
  it('hands off when the children animations finish (Web Animations API)', async () => {
    mountDestination();
    // jsdom has no getAnimations; stub it with one controllable animation.
    let resolveFinished: () => void = () => {};
    const finished = new Promise<void>(resolve => {
      resolveFinished = resolve;
    });
    const proto = HTMLElement.prototype as unknown as {
      getAnimations?: () => Array<{finished: Promise<unknown>}>;
    };
    proto.getAnimations = () => [{finished}];
    try {
      render(<LogoTransitionOverlay {...DEFAULT_PROPS} />);
      await revealOverlay();
      // The animation finishes well before the 2000ms fallback -> 'holding'.
      await act(async () => {
        resolveFinished();
        await Promise.resolve();
      });
      // The post-play hold then elapses -> 'fading'.
      act(() => {
        jest.advanceTimersByTime(TEST_POST_PLAY_HOLD_MS);
      });
      expect(getMediaWrapper()?.className).toContain('mediaWrapper--fading');
    } finally {
      delete proto.getAnimations;
    }
  });
});
