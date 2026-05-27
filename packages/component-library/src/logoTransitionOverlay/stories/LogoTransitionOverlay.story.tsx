import {Meta, StoryFn} from '@storybook/react-webpack5';
import {useEffect, useRef, useState} from 'react';

import LogoTransitionOverlay, {
  LogoTransitionOverlayProps,
} from '../LogoTransitionOverlay';

// A sample logo-transition animation. Real consumers (apps/marketing) supply
// their own animated AVIF with alpha. Point this at a hosted animated AVIF to
// see the "Playing" story actually animate; with the placeholder below the
// <img> 404s and the LoadFailure path is exercised instead.
const SAMPLE_MEDIA =
  'https://contentful-images.code.org/90t6bu6vlf76/REPLACE_ME/REPLACE_ME/animated-logo-transition.avif';

// A small inline SVG -- the Code.org "C" mark -- so the hand-off has something
// visible to render. Real consumers supply cdo-logo-inverse.svg.
const TINY_SVG =
  'data:image/svg+xml;base64,' +
  Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" fill="#1c4be3"/><text x="32" y="42" font-family="Arial" font-size="32" fill="white" text-anchor="middle" font-weight="bold">C</text></svg>`,
  ).toString('base64');

const DEFAULT_PROPS: LogoTransitionOverlayProps = {
  mediaSrc: SAMPLE_MEDIA,
  svgSrc: TINY_SVG,
  mediaAspectRatio: 834 / 313,
  destinationSelector: '[data-story-destination]',
  mediaEndFrameLogoNormalizedRect: {x: 0, y: 0, width: 0.97, height: 0.438},
  animationDurationMs: 5000,
  postPlayHoldMs: 1500,
};

export default {
  title: 'DesignSystem/LogoTransitionOverlay',
  component: LogoTransitionOverlay,
  parameters: {
    layout: 'fullscreen',
  },
} as Meta;

// A consistent mock "header" rendered behind every overlay story so the
// FLIP hand-off has a visible destination element.
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
        onClick={() => setKey(k => k + 1)}
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

export const LoadFailure: StoryFn<LogoTransitionOverlayProps> = (
  args: LogoTransitionOverlayProps,
) => (
  <ReplayWrapper>
    {key => (
      <LogoTransitionOverlay
        key={key}
        {...args}
        mediaSrc="/this/path/intentionally/does-not-exist.avif"
        loadTimeoutMs={1500}
      />
    )}
  </ReplayWrapper>
);
LoadFailure.args = DEFAULT_PROPS;
LoadFailure.parameters = {
  docs: {
    description: {
      story:
        'When the animation fails to load (or loadTimeoutMs elapses first), the overlay unmounts and the page is shown with the standard header logo. A Sentry warning is captured.',
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
        onClick={() => location.reload()}
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
        'Two overlay instances are mounted simultaneously. Only the first renders; the second is a no-op (a Sentry warning is captured).',
    },
  },
};
