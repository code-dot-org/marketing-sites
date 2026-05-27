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

const SAMPLE_MEDIA = '/test-fixtures/logo-transition.avif';
const SAMPLE_SVG = '/test-fixtures/cdo-logo-inverse.svg';
const TEST_ANIMATION_DURATION_MS = 2000;
const TEST_POST_PLAY_HOLD_MS = 1000;
const DEFAULT_PROPS: LogoTransitionOverlayProps = {
  mediaSrc: SAMPLE_MEDIA,
  svgSrc: SAMPLE_SVG,
  mediaAspectRatio: 1,
  destinationSelector: '[data-test-destination]',
  mediaEndFrameLogoNormalizedRect: {x: 0.25, y: 0.25, width: 0.5, height: 0.5},
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

// jsdom has no Image.decode(), so stub it; `decodeBehavior` picks how it settles
// per test ('hang' never resolves, to exercise loadTimeoutMs).
let decodeBehavior: 'resolve' | 'reject' | 'hang';

// Flush the decode-gate microtask so the overlay commits and enters 'playing'.
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
  decodeBehavior = 'resolve';
  Object.defineProperty(HTMLImageElement.prototype, 'decode', {
    configurable: true,
    writable: true,
    value: jest.fn(() => {
      if (decodeBehavior === 'reject') {
        return Promise.reject(new Error('decode failed'));
      }
      if (decodeBehavior === 'hang') {
        return new Promise<void>(() => {});
      }
      return Promise.resolve();
    }),
  });
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
    // Played flag set when the decode-gate committed; nothing else written.
    expectThrottleStateRecorded();
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
    // The AVIF must not have begun fading (phase stayed 'playing').
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
    // The AVIF must not have begun fading (phase stayed 'playing').
    expect(getMediaWrapper()?.className).not.toContain('mediaWrapper--fading');
    expectThrottleStateRecorded();
  });

  // 8. Decode failure -> skip the overlay + warning
  it('skips the overlay (and warns) when the image fails to decode', async () => {
    decodeBehavior = 'reject';
    const consoleWarn = jest
      .spyOn(console, 'warn')
      .mockImplementation(() => {});
    const onDismiss = jest.fn();
    render(<LogoTransitionOverlay {...DEFAULT_PROPS} onDismiss={onDismiss} />);
    // Flush the rejected decode -> skip path.
    await revealOverlay();
    expect(screen.queryByRole('dialog')).toBeNull();
    expect(onDismiss).toHaveBeenCalled();
    expect(consoleWarn).toHaveBeenCalledWith(
      expect.stringContaining('media-load-failed'),
    );
    consoleWarn.mockRestore();
    // Nothing committed -> no storage written.
    expectNoStorageWritten();
  });

  // 9. Decode/load timeout -> skip the overlay + warning
  it('skips the overlay (and warns) when decode does not finish within loadTimeoutMs', () => {
    decodeBehavior = 'hang';
    const consoleWarn = jest
      .spyOn(console, 'warn')
      .mockImplementation(() => {});
    const onDismiss = jest.fn();
    render(
      <LogoTransitionOverlay
        {...DEFAULT_PROPS}
        onDismiss={onDismiss}
        loadTimeoutMs={1000}
      />,
    );
    // decode() never resolves; advance past the timeout.
    act(() => {
      jest.advanceTimersByTime(1500);
    });
    expect(screen.queryByRole('dialog')).toBeNull();
    expect(onDismiss).toHaveBeenCalled();
    expect(consoleWarn).toHaveBeenCalledWith(
      expect.stringContaining('media-load-timeout'),
    );
    consoleWarn.mockRestore();
    expectNoStorageWritten();
  });

  // 10. Missing destination element -> unmount after fade + warning
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

  // 11. Storage discipline: no cookies written; sessionStorage gains only the
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

  // 12. Once-per-session: when the session flag is already set, the overlay
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

  // 13. Per-window cap: at the cap, even a fresh session short-circuits, and
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

  // 14. Under the cap in a new session: the overlay plays and appends a show.
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

  // 15. Shows older than the window don't count toward the cap and are pruned
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

  // 16. A malformed shows value can't permanently suppress the overlay: it is
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

  // 17. The shows list is appended (and the session flag set) only when the
  // decode-gate commits -- not before.
  it('records a show once the image is decoded and revealed', async () => {
    render(<LogoTransitionOverlay {...DEFAULT_PROPS} />);
    // Before the decode-gate resolves: nothing recorded.
    expect(window.localStorage.getItem(SHOWS_KEY)).toBeNull();
    expect(window.sessionStorage.getItem(SESSION_KEY)).toBeNull();
    await revealOverlay();
    // After decode commits: one show + the session flag.
    const shows = JSON.parse(window.localStorage.getItem(SHOWS_KEY) ?? '[]');
    expect(shows).toHaveLength(1);
    expect(window.sessionStorage.getItem(SESSION_KEY)).toBe('1');
  });

  // 18. Decode failure does NOT record a show (user gets a retry next time).
  it('does NOT record a show when the image fails to decode', async () => {
    decodeBehavior = 'reject';
    const consoleWarn = jest
      .spyOn(console, 'warn')
      .mockImplementation(() => {});
    render(<LogoTransitionOverlay {...DEFAULT_PROPS} />);
    await revealOverlay();
    expect(window.localStorage.getItem(SHOWS_KEY)).toBeNull();
    expect(window.sessionStorage.getItem(SESSION_KEY)).toBeNull();
    consoleWarn.mockRestore();
  });

  // 19. Decode timeout does NOT record a show.
  it('does NOT record a show when decode times out', () => {
    decodeBehavior = 'hang';
    const consoleWarn = jest
      .spyOn(console, 'warn')
      .mockImplementation(() => {});
    render(<LogoTransitionOverlay {...DEFAULT_PROPS} loadTimeoutMs={1000} />);
    act(() => {
      jest.advanceTimersByTime(1500);
    });
    expect(window.localStorage.getItem(SHOWS_KEY)).toBeNull();
    expect(window.sessionStorage.getItem(SESSION_KEY)).toBeNull();
    consoleWarn.mockRestore();
  });
});
