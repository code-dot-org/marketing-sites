import {act, fireEvent, render, screen} from '@testing-library/react';
import '@testing-library/jest-dom';

import {DEFAULT_HANDOFF_TRIGGER_MS} from '../constants';
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

// The AVIF's opacity fade is owned by the wrapper; the 'fading' phase adds
// .mediaWrapper--fading. Tests assert on this to detect whether a fade started.
const getMediaWrapper = () => document.querySelector('.mediaWrapper');

// The overlay decode-gates: on mount it decodes the image OFF-SCREEN via
// `new Image().decode()` and only renders once that resolves (so the first
// frame paints the instant the overlay appears). jsdom doesn't implement
// decode(), so we stub it; `decodeBehavior` lets each test choose how it
// settles. 'hang' models a slow/never-finishing decode so the loadTimeoutMs
// path can fire.
let decodeBehavior: 'resolve' | 'reject' | 'hang';

// Flush the decode-gate: run the decode() microtask + the resulting state
// updates/effects so the overlay commits and enters 'playing'.
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

// Match the constant in src/logoTransitionOverlay/constants.ts.
const PLAYED_STORAGE_KEY = 'logo-transition-overlay:played';

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
  // Start every test with an empty localStorage so the played-flag skip
  // doesn't bleed across tests.
  window.localStorage.clear();
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
});

// Strict assertion: no storage of any kind changed. Use for tests that
// short-circuit before the animation commits to playing.
const expectNoStorageWritten = () => {
  expect(document.cookie).toBe(storageSnapshot.cookies);
  expect(Object.keys(window.localStorage)).toEqual(storageSnapshot.localKeys);
  expect(Object.keys(window.sessionStorage)).toEqual(
    storageSnapshot.sessionKeys,
  );
};

// Permissive assertion: cookies + sessionStorage are unchanged; the only
// allowed localStorage addition is the played flag. Use for tests that
// commit to playing (where markPlayed fires).
const expectOnlyPlayedFlagWritten = () => {
  expect(document.cookie).toBe(storageSnapshot.cookies);
  expect(Object.keys(window.sessionStorage)).toEqual(
    storageSnapshot.sessionKeys,
  );
  const newLocalKeys = Object.keys(window.localStorage).filter(
    k => !storageSnapshot.localKeys.includes(k),
  );
  expect(newLocalKeys).toEqual([PLAYED_STORAGE_KEY]);
  expect(window.localStorage.getItem(PLAYED_STORAGE_KEY)).toBe('1');
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
    // Only the first instance committed to playing, so only the played flag.
    expectOnlyPlayedFlagWritten();
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
    expectOnlyPlayedFlagWritten();
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
    // Committing to play stamps the played flag; only that entry should be
    // in localStorage, and nothing in cookies / sessionStorage.
    expectOnlyPlayedFlagWritten();
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
    expectOnlyPlayedFlagWritten();
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
    // Committing to play stamps the played flag; that's the only expected
    // write.
    expectOnlyPlayedFlagWritten();
  });

  // 11. Storage discipline: cookies and sessionStorage are untouched; only
  // the played flag may appear in localStorage.
  it('writes nothing to cookies or sessionStorage; localStorage limited to the played flag', async () => {
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
    expectOnlyPlayedFlagWritten();
  });

  // 12. Once-per-browser: when the played flag is already set, the
  // overlay short-circuits and never becomes active.
  it('does not render if a played flag is already set in localStorage', () => {
    window.localStorage.setItem(PLAYED_STORAGE_KEY, '1');
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

  // 13. Played flag is set when the decode-gate commits -- not before.
  it('marks played in localStorage once the image is decoded and revealed', async () => {
    render(<LogoTransitionOverlay {...DEFAULT_PROPS} />);
    // Before the decode-gate resolves: not yet played.
    expect(window.localStorage.getItem(PLAYED_STORAGE_KEY)).toBeNull();
    await revealOverlay();
    // After decode commits: played.
    expect(window.localStorage.getItem(PLAYED_STORAGE_KEY)).toBe('1');
  });

  // 14. Decode failure does NOT mark played (user gets a retry next time).
  it('does NOT mark played in localStorage when the image fails to decode', async () => {
    decodeBehavior = 'reject';
    const consoleWarn = jest
      .spyOn(console, 'warn')
      .mockImplementation(() => {});
    render(<LogoTransitionOverlay {...DEFAULT_PROPS} />);
    await revealOverlay();
    expect(window.localStorage.getItem(PLAYED_STORAGE_KEY)).toBeNull();
    consoleWarn.mockRestore();
  });

  // 15. Decode timeout does NOT mark played.
  it('does NOT mark played in localStorage when decode times out', () => {
    decodeBehavior = 'hang';
    const consoleWarn = jest
      .spyOn(console, 'warn')
      .mockImplementation(() => {});
    render(<LogoTransitionOverlay {...DEFAULT_PROPS} loadTimeoutMs={1000} />);
    act(() => {
      jest.advanceTimersByTime(1500);
    });
    expect(window.localStorage.getItem(PLAYED_STORAGE_KEY)).toBeNull();
    consoleWarn.mockRestore();
  });
});
