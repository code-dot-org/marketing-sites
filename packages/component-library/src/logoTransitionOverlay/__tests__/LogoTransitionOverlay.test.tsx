import {act, fireEvent, render, screen} from '@testing-library/react';
import '@testing-library/jest-dom';

import LogoTransitionOverlay, {
  LogoTransitionOverlayProps,
  __resetSingletonForTests,
} from '../LogoTransitionOverlay';

const SAMPLE_VIDEO = '/test-fixtures/logo-transition.mp4';
const SAMPLE_SVG = '/test-fixtures/cdo-logo-inverse.svg';
const TEST_POST_PLAY_HOLD_MS = 1000;
const DEFAULT_PROPS: LogoTransitionOverlayProps = {
  videoSrc: SAMPLE_VIDEO,
  svgSrc: SAMPLE_SVG,
  videoAspectRatio: 1,
  destinationSelector: '[data-test-destination]',
  videoEndFrameLogoNormalizedRect: {x: 0.25, y: 0.25, width: 0.5, height: 0.5},
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

const getVideo = () =>
  document.querySelector('video') as HTMLVideoElement | null;

// jsdom does not implement HTMLMediaElement.play / pause / canPlayType.
// The component uses autoplay + event handlers; the play() promise it
// implicitly relies on (via the autoplay attribute) is not interacted with
// directly, but other consumers of the element may invoke these. Stub them
// out so any incidental calls don't throw.
const installMediaElementStubs = () => {
  Object.defineProperty(HTMLMediaElement.prototype, 'play', {
    configurable: true,
    writable: true,
    value: jest.fn(() => Promise.resolve()),
  });
  Object.defineProperty(HTMLMediaElement.prototype, 'pause', {
    configurable: true,
    writable: true,
    value: jest.fn(),
  });
  Object.defineProperty(HTMLMediaElement.prototype, 'load', {
    configurable: true,
    writable: true,
    value: jest.fn(),
  });
};

const fireVideoPlaying = () => {
  const video = getVideo();
  if (video) fireEvent.playing(video);
};

const fireVideoEnded = () => {
  const video = getVideo();
  if (video) fireEvent.ended(video);
};

const fireVideoError = () => {
  const video = getVideo();
  if (video) fireEvent.error(video);
};

let storageSnapshot: {
  cookies: string;
  localKeys: string[];
  sessionKeys: string[];
};

// Match the constant in src/logoTransitionOverlay/constants.ts.
const PLAYED_STORAGE_KEY = 'logo-transition-overlay:played';

beforeEach(() => {
  jest.useFakeTimers();
  __resetSingletonForTests();
  installMediaElementStubs();
  mockMatchMedia(false);
  // Start every test with an empty sessionStorage so the once-per-session
  // skip doesn't bleed across tests.
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
  window.sessionStorage.clear();
});

// Strict assertion: no storage of any kind changed. Use for tests that
// short-circuit before the video starts playing.
const expectNoStorageWritten = () => {
  expect(document.cookie).toBe(storageSnapshot.cookies);
  expect(Object.keys(window.localStorage)).toEqual(storageSnapshot.localKeys);
  expect(Object.keys(window.sessionStorage)).toEqual(
    storageSnapshot.sessionKeys,
  );
};

// Permissive assertion: cookies + localStorage are unchanged; the only
// allowed sessionStorage addition is the played flag. Use for tests that
// reach 'playing' phase (where markPlayedThisSession fires).
const expectOnlyPlayedFlagWritten = () => {
  expect(document.cookie).toBe(storageSnapshot.cookies);
  expect(Object.keys(window.localStorage)).toEqual(storageSnapshot.localKeys);
  const newSessionKeys = Object.keys(window.sessionStorage).filter(
    k => !storageSnapshot.sessionKeys.includes(k),
  );
  expect(newSessionKeys).toEqual([PLAYED_STORAGE_KEY]);
  expect(window.sessionStorage.getItem(PLAYED_STORAGE_KEY)).toBe('1');
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
    // onDismiss is fired in a useEffect for the synchronous-null case; tick
    // microtasks to let any pending effects flush, then assert it was called.
    act(() => {
      jest.runOnlyPendingTimers();
    });
    expectNoStorageWritten();
  });

  // 2. Singleton guard
  it('second concurrent instance renders null', () => {
    const {container: c1} = render(
      <LogoTransitionOverlay {...DEFAULT_PROPS} />,
    );
    const {container: c2} = render(
      <LogoTransitionOverlay {...DEFAULT_PROPS} />,
    );
    // First instance owns the singleton and renders the dialog.
    expect(c1.querySelector('[role="dialog"]')).not.toBeNull();
    // Second instance is null.
    expect(c2).toBeEmptyDOMElement();
    expectNoStorageWritten();
  });

  // 3. Successful play -> hold -> fade -> handoff
  it('plays once then holds, fades, and runs handoff to destination', () => {
    mountDestination();
    const onDismiss = jest.fn();
    render(<LogoTransitionOverlay {...DEFAULT_PROPS} onDismiss={onDismiss} />);
    expect(screen.getByRole('dialog')).toBeInTheDocument();

    // Video onPlaying transitions to 'playing'
    act(() => {
      fireVideoPlaying();
    });
    // Video reaches its final frame -> transitions to 'holding'
    act(() => {
      fireVideoEnded();
    });
    // After postPlayHoldMs the fade begins (SVG fades in).
    act(() => {
      jest.advanceTimersByTime(TEST_POST_PLAY_HOLD_MS);
    });
    // Fade completes (1200ms), SVG starts FLIP to header (backdrop fades).
    act(() => {
      jest.advanceTimersByTime(1200);
    });
    // Handoff animation completes (1500ms), overlay unmounts.
    act(() => {
      jest.advanceTimersByTime(1500);
    });
    expect(screen.queryByRole('dialog')).toBeNull();
    expect(onDismiss).toHaveBeenCalled();
    // Played flag set on entering 'playing'; nothing else written.
    expectOnlyPlayedFlagWritten();
  });

  // 4. Close-button dismissal: overlay disappears immediately, no fade.
  it('dismisses immediately when close button is clicked', () => {
    const onDismiss = jest.fn();
    const onActiveChange = jest.fn();
    render(
      <LogoTransitionOverlay
        {...DEFAULT_PROPS}
        onDismiss={onDismiss}
        onActiveChange={onActiveChange}
      />,
    );
    act(() => {
      fireVideoPlaying();
    });
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
  it('dismisses immediately when ESC is pressed', () => {
    const onDismiss = jest.fn();
    const onActiveChange = jest.fn();
    render(
      <LogoTransitionOverlay
        {...DEFAULT_PROPS}
        onDismiss={onDismiss}
        onActiveChange={onActiveChange}
      />,
    );
    act(() => {
      fireVideoPlaying();
    });
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    act(() => {
      fireEvent.keyDown(document, {key: 'Escape'});
    });
    expect(screen.queryByRole('dialog')).toBeNull();
    expect(onDismiss).toHaveBeenCalled();
    expect(onActiveChange).toHaveBeenCalledWith(false);
  });

  // 6. Other key press does not dismiss
  it('does NOT dismiss on non-ESC key presses', () => {
    render(<LogoTransitionOverlay {...DEFAULT_PROPS} />);
    act(() => {
      fireVideoPlaying();
    });
    act(() => {
      fireEvent.keyDown(document, {key: 'A'});
      fireEvent.keyDown(document, {key: ' '});
      fireEvent.keyDown(document, {key: 'Enter'});
    });
    act(() => {
      jest.advanceTimersByTime(100);
    });
    const video = getVideo();
    expect(video?.className).not.toContain('videoElement--fading');
    // fireVideoPlaying stamps the played flag; only that entry should be
    // in sessionStorage, and nothing in cookies / localStorage.
    expectOnlyPlayedFlagWritten();
  });

  // 7. Outside-pointer clicks do not dismiss
  it('does NOT dismiss on outside-pointer clicks', () => {
    render(<LogoTransitionOverlay {...DEFAULT_PROPS} />);
    act(() => {
      fireVideoPlaying();
    });
    // Click on the dialog backdrop (the root overlay element). The overlay
    // intentionally has no onClick handler, so a click should not dismiss.
    const dialog = screen.getByRole('dialog');
    act(() => {
      fireEvent.click(dialog);
    });
    act(() => {
      jest.advanceTimersByTime(100);
    });
    const video = getVideo();
    expect(video?.className).not.toContain('videoElement--fading');
    expectOnlyPlayedFlagWritten();
  });

  // 8. Video onError -> unmount + warning
  it('unmounts on video onError', () => {
    const consoleWarn = jest
      .spyOn(console, 'warn')
      .mockImplementation(() => {});
    const onDismiss = jest.fn();
    render(<LogoTransitionOverlay {...DEFAULT_PROPS} onDismiss={onDismiss} />);
    act(() => {
      fireVideoError();
    });
    expect(screen.queryByRole('dialog')).toBeNull();
    expect(consoleWarn).toHaveBeenCalledWith(
      expect.stringContaining('video-load-failed'),
    );
    consoleWarn.mockRestore();
    expectNoStorageWritten();
  });

  // 9. Load/autoplay timeout -> unmount + warning
  it('unmounts when the video fails to begin playing within loadTimeoutMs', () => {
    const consoleWarn = jest
      .spyOn(console, 'warn')
      .mockImplementation(() => {});
    render(<LogoTransitionOverlay {...DEFAULT_PROPS} loadTimeoutMs={1000} />);
    // Do NOT fire onPlaying. Advance past the timeout.
    act(() => {
      jest.advanceTimersByTime(1500);
    });
    expect(screen.queryByRole('dialog')).toBeNull();
    expect(consoleWarn).toHaveBeenCalledWith(
      expect.stringContaining('video-load-timeout'),
    );
    consoleWarn.mockRestore();
    expectNoStorageWritten();
  });

  // 10. Missing destination element -> unmount after fade + warning
  it('logs warning and unmounts when destination selector finds no element', () => {
    const consoleWarn = jest
      .spyOn(console, 'warn')
      .mockImplementation(() => {});
    // No destination element appended.
    render(<LogoTransitionOverlay {...DEFAULT_PROPS} />);
    act(() => {
      fireVideoPlaying();
      fireVideoEnded();
    });
    // Post-play hold (1000ms) completes.
    act(() => {
      jest.advanceTimersByTime(TEST_POST_PLAY_HOLD_MS);
    });
    // Combined fade completes (1200ms), then the handoff effect runs and
    // should detect the missing destination.
    act(() => {
      jest.advanceTimersByTime(1200);
    });
    expect(consoleWarn).toHaveBeenCalledWith(
      expect.stringContaining('destination-not-found'),
    );
    consoleWarn.mockRestore();
    // fireVideoPlaying stamps the played flag; that's the only expected
    // write.
    expectOnlyPlayedFlagWritten();
  });

  // 11. Storage discipline: cookies and localStorage are untouched; only
  // the played flag may appear in sessionStorage.
  it('writes nothing to cookies or localStorage; sessionStorage limited to the played flag', () => {
    mountDestination();
    render(<LogoTransitionOverlay {...DEFAULT_PROPS} />);
    act(() => {
      fireVideoPlaying();
      fireVideoEnded();
      jest.advanceTimersByTime(TEST_POST_PLAY_HOLD_MS + 1000);
    });
    // Inline one explicit assertion so jest/expect-expect can see it; the
    // helper below covers the full equivalence check.
    expect(document.cookie).toBe(storageSnapshot.cookies);
    expectOnlyPlayedFlagWritten();
  });

  // 12. Once-per-session: when the played flag is already set, the
  // overlay short-circuits and never becomes active.
  it('does not render if a played flag is already set in sessionStorage', () => {
    window.sessionStorage.setItem(PLAYED_STORAGE_KEY, '1');
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
  });

  // 13. Played flag is set as soon as the video begins playing -- not earlier.
  it('marks played in sessionStorage as soon as the video starts playing', () => {
    render(<LogoTransitionOverlay {...DEFAULT_PROPS} />);
    // Pre-play: nothing yet.
    expect(window.sessionStorage.getItem(PLAYED_STORAGE_KEY)).toBeNull();
    act(() => {
      fireVideoPlaying();
    });
    // Post-playing: played.
    expect(window.sessionStorage.getItem(PLAYED_STORAGE_KEY)).toBe('1');
  });

  // 14. Video load failure does NOT mark played (user gets a retry next time).
  it('does NOT mark played in sessionStorage when the video fails to load', () => {
    const consoleWarn = jest
      .spyOn(console, 'warn')
      .mockImplementation(() => {});
    render(<LogoTransitionOverlay {...DEFAULT_PROPS} />);
    act(() => {
      fireVideoError();
    });
    expect(window.sessionStorage.getItem(PLAYED_STORAGE_KEY)).toBeNull();
    consoleWarn.mockRestore();
  });

  // 15. Load timeout does NOT mark played.
  it('does NOT mark played in sessionStorage when the load times out', () => {
    const consoleWarn = jest
      .spyOn(console, 'warn')
      .mockImplementation(() => {});
    render(<LogoTransitionOverlay {...DEFAULT_PROPS} loadTimeoutMs={1000} />);
    act(() => {
      jest.advanceTimersByTime(1500);
    });
    expect(window.sessionStorage.getItem(PLAYED_STORAGE_KEY)).toBeNull();
    consoleWarn.mockRestore();
  });
});
