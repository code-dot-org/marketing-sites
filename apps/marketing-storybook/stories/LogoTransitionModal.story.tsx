import {Meta, StoryObj} from '@storybook/react';
import {useEffect} from 'react';

import LogoTransitionModal from '@/components/contentful/logoTransitionModal';

const meta: Meta<typeof LogoTransitionModal> = {
  title: 'Marketing/LogoTransitionModal',
  component: LogoTransitionModal,
  parameters: {
    layout: 'fullscreen',
  },
};
export default meta;

type Story = StoryObj<typeof LogoTransitionModal>;

// A mocked corporate-header layout that renders a placeholder logo tagged
// with `data-logo-transition-target` so the FLIP hand-off has a destination
// element to land on.
const MockCorporateHeader: React.FC = () => (
  <header
    style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      height: 64,
      background: '#1c4be3',
      display: 'flex',
      alignItems: 'center',
      paddingInline: 24,
      zIndex: 1,
    }}
  >
    <img
      data-logo-transition-target
      src="/images/cdo-logo-inverse.svg"
      alt="Code.org"
      style={{height: 32}}
    />
    <span
      style={{
        color: 'white',
        marginInlineStart: 24,
        fontFamily: 'sans-serif',
      }}
    >
      Mock corporate header (logo above is the logo-transition destination)
    </span>
  </header>
);

const MockBody: React.FC = () => (
  <main style={{paddingBlockStart: 96, paddingInline: 24}}>
    <h1 style={{fontFamily: 'sans-serif'}}>Mock page content</h1>
    <p style={{fontFamily: 'sans-serif', maxWidth: 640}}>
      This text represents the underlying page that the visitor sees come
      "into focus" after the logo-transition modal fades out and the SVG
      logo animates into the header.
    </p>
  </main>
);

export const Playing: Story = {
  render: () => (
    <>
      <MockCorporateHeader />
      <MockBody />
      <LogoTransitionModal />
    </>
  ),
};

export const ReducedMotion: Story = {
  render: () => {
    // Force matchMedia to report reduced-motion for this story only.
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
        } as unknown as MediaQueryList);
      return () => {
        window.matchMedia = original;
      };
    }, []);

    return (
      <>
        <MockCorporateHeader />
        <MockBody />
        <LogoTransitionModal />
      </>
    );
  },
  parameters: {
    docs: {
      description: {
        story:
          'When the visitor prefers reduced motion the overlay renders nothing and the underlying page (with its header) is shown directly.',
      },
    },
  },
};
