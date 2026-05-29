import {Meta, StoryFn} from '@storybook/react-webpack5';
import {useEffect, useRef, useState} from 'react';

import {
  LOGO_TRANSITION_OVERLAY_SESSION_STORAGE_KEY,
  LOGO_TRANSITION_OVERLAY_SHOWS_STORAGE_KEY,
} from '../constants';
import LogoTransitionOverlay, {
  LogoTransitionOverlayProps,
} from '../LogoTransitionOverlay';

// Clear the overlay's session/rolling-window throttle so Replay re-triggers the
// happy path.
const clearThrottleState = () => {
  try {
    window.sessionStorage.removeItem(
      LOGO_TRANSITION_OVERLAY_SESSION_STORAGE_KEY,
    );
    window.localStorage.removeItem(LOGO_TRANSITION_OVERLAY_SHOWS_STORAGE_KEY);
  } catch {
    // Storage unavailable; nothing to clear.
  }
};

// Inline "C" mark so the hand-off has something to render (real consumers
// supply their own header SVG).
const TINY_SVG =
  'data:image/svg+xml;base64,' +
  btoa(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" fill="#1c4be3"/><text x="32" y="42" font-family="Arial" font-size="32" fill="white" text-anchor="middle" font-weight="bold">C</text></svg>`,
  );

// Stand-in for the consumer-supplied animation (real consumers pass a
// CSS-animated SVG). A self-sizing box whose whole footprint is the "logo", so
// endFrameLogoNormalizedRect covers it fully.
const SampleAnimation: React.FC = () => (
  <div
    style={{
      width: 'min(834px, 90vw)',
      aspectRatio: '834 / 313',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#1c4be3',
      color: 'white',
      fontFamily: 'sans-serif',
      fontSize: 'clamp(24px, 6vw, 56px)',
      fontWeight: 700,
      borderRadius: 12,
    }}
  >
    Code.org
  </div>
);

const DEFAULT_PROPS: LogoTransitionOverlayProps = {
  children: <SampleAnimation />,
  svgSrc: TINY_SVG,
  destinationSelector: '[data-story-destination]',
  endFrameLogoNormalizedRect: {x: 0, y: 0, width: 1, height: 1},
  animationDurationMs: 5000,
  postPlayHoldMs: 1500,
};

export default {
  title: 'DesignSystem/LogoTransitionOverlay',
  component: LogoTransitionOverlay,
  parameters: {
    layout: 'fullscreen',
    // Animated transition — exclude from Applitools visual regression.
    eyes: {include: false},
  },
} as Meta;

// Mock header behind every story, giving the FLIP hand-off a destination.
const MockHeader = () => (
  <header
    style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      height: 56,
      background: '#1c4be3',
      display: 'flex',
      alignItems: 'center',
      paddingInline: 16,
      zIndex: 1,
    }}
  >
    <img
      data-story-destination
      src={TINY_SVG}
      alt=""
      style={{width: 40, height: 40}}
    />
    <span style={{color: 'white', marginLeft: 16, fontFamily: 'sans-serif'}}>
      Mock header (destination element on the left)
    </span>
  </header>
);

// Reset wrapper: each story remounts the overlay when "Replay" is clicked.
const ReplayWrapper: React.FC<{
  children: (key: number) => React.ReactNode;
}> = ({children}) => {
  const [key, setKey] = useState(0);
  return (
    <>
      <MockHeader />
      <button
        onClick={() => {
          clearThrottleState();
          setKey(k => k + 1);
        }}
        style={{
          position: 'fixed',
          bottom: 16,
          right: 16,
          zIndex: 3000,
          padding: '8px 16px',
        }}
      >
        Replay
      </button>
      {children(key)}
    </>
  );
};

export const Playing: StoryFn<LogoTransitionOverlayProps> = (
  args: LogoTransitionOverlayProps,
) => (
  <ReplayWrapper>
    {key => <LogoTransitionOverlay key={key} {...args} />}
  </ReplayWrapper>
);
Playing.args = DEFAULT_PROPS;

export const ReducedMotion: StoryFn<LogoTransitionOverlayProps> = (
  args: LogoTransitionOverlayProps,
) => {
  // Force matchMedia to report reduced-motion just for this story.
  useEffect(() => {
    const original = window.matchMedia;
    window.matchMedia = (query: string) =>
      ({
        matches: query.includes('reduce'),
        media: query,
        onchange: null,
        addListener: () => {},
        removeListener: () => {},
        addEventListener: () => {},
        removeEventListener: () => {},
        dispatchEvent: () => false,
      }) as unknown as MediaQueryList;
    return () => {
      window.matchMedia = original;
    };
  }, []);

  return (
    <ReplayWrapper>
      {key => <LogoTransitionOverlay key={key} {...args} />}
    </ReplayWrapper>
  );
};
ReducedMotion.args = DEFAULT_PROPS;
ReducedMotion.parameters = {
  docs: {
    description: {
      story:
        'When the visitor prefers reduced motion the overlay renders nothing and the underlying page (with its header) is shown directly. No modal is displayed.',
    },
  },
};

export const HandoffDestination: StoryFn<LogoTransitionOverlayProps> = (
  args: LogoTransitionOverlayProps,
) => {
  const ref = useRef<HTMLImageElement>(null);
  return (
    <>
      <header
        style={{
          position: 'fixed',
          top: 0,
          right: 0,
          padding: 16,
          background: '#222',
          zIndex: 1,
        }}
      >
        <img
          ref={ref}
          data-story-destination
          src={TINY_SVG}
          alt=""
          style={{width: 64, height: 64}}
        />
      </header>
      <button
        style={{
          position: 'fixed',
          bottom: 16,
          right: 16,
          padding: '8px 16px',
          zIndex: 3000,
        }}
        onClick={() => {
          clearThrottleState();
          location.reload();
        }}
      >
        Replay
      </button>
      <LogoTransitionOverlay {...args} />
    </>
  );
};
HandoffDestination.args = DEFAULT_PROPS;
HandoffDestination.parameters = {
  docs: {
    description: {
      story:
        'Demonstrates the FLIP hand-off animation: after the fade-out, the SVG translates and scales from the video end-frame position to the destination element in the mock header (top-right of viewport).',
    },
  },
};

export const SingleInstanceGuard: StoryFn<LogoTransitionOverlayProps> = (
  args: LogoTransitionOverlayProps,
) => (
  <ReplayWrapper>
    {key => (
      <>
        <LogoTransitionOverlay key={`a${key}`} {...args} />
        <LogoTransitionOverlay key={`b${key}`} {...args} />
      </>
    )}
  </ReplayWrapper>
);
SingleInstanceGuard.args = DEFAULT_PROPS;
SingleInstanceGuard.parameters = {
  docs: {
    description: {
      story:
        'Two overlay instances are mounted simultaneously. Only the first renders; the second is a no-op (a warning is logged to the console).',
    },
  },
};
