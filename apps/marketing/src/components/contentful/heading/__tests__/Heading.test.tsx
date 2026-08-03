import {render, screen} from '@testing-library/react';

import Section from '@/components/contentful/section';

import Heading from '../Heading';

describe('Heading Component', () => {
  it('should render out all headings', async () => {
    render(
      <div>
        <Heading visualAppearance={'heading-xxl'} removeMarginBottom={false}>
          xxl - h1
        </Heading>
        <Heading visualAppearance={'heading-xl'} removeMarginBottom={false}>
          xl - h2
        </Heading>
        <Heading visualAppearance={'heading-lg'} removeMarginBottom={false}>
          lg - h3
        </Heading>
        <Heading visualAppearance={'heading-md'} removeMarginBottom={false}>
          md - h4
        </Heading>
        <Heading visualAppearance={'heading-sm'} removeMarginBottom={false}>
          sm - h5
        </Heading>
        <Heading visualAppearance={'heading-xs'} removeMarginBottom={false}>
          xs - h6
        </Heading>
      </div>,
    );

    expect(screen.getByRole('heading', {level: 1})).toHaveTextContent(
      'xxl - h1',
    );
    expect(screen.getByRole('heading', {level: 2})).toHaveTextContent(
      'xl - h2',
    );
    expect(screen.getByRole('heading', {level: 3})).toHaveTextContent(
      'lg - h3',
    );
    expect(screen.getByRole('heading', {level: 4})).toHaveTextContent(
      'md - h4',
    );
    expect(screen.getByRole('heading', {level: 5})).toHaveTextContent(
      'sm - h5',
    );
    expect(screen.getByRole('heading', {level: 6})).toHaveTextContent(
      'xs - h6',
    );
  });

  it('applies the color prop correctly', () => {
    // With the brand-color contrast switch (US2), `color="white"` outside a
    // dark Section resolves to black via the page-root-default mid tone.
    // Wrapping in a dark CodeAI Section keeps the test's original intent —
    // verify the color prop reaches the rendered element — without losing
    // coverage of that path.
    render(
      <Section background="purpleDark">
        <Heading
          visualAppearance="heading-lg"
          color="white"
          removeMarginBottom={false}
        >
          White Heading
        </Heading>
      </Section>,
    );
    const heading = screen.getByText('White Heading');
    expect(heading).toHaveStyle('color: white');
  });

  it('removes margin when removeMarginBottom is true', () => {
    render(
      <Heading visualAppearance={'heading-md'} removeMarginBottom={true}>
        No Margin
      </Heading>,
    );
    const heading = screen.getByText('No Margin');
    expect(window.getComputedStyle(heading).marginBottom).toBe('0px');
  });

  // Spec 009 — canonical default + override surface.
  describe('spec 009 refactor', () => {
    it('does not emit a `clamp(` font-size by default', () => {
      render(
        <Heading visualAppearance="heading-xl" removeMarginBottom={false}>
          Default H2
        </Heading>,
      );
      const heading = screen.getByText('Default H2');
      const computed = window.getComputedStyle(heading).fontSize;
      expect(computed).not.toContain('clamp');
    });

    it('applies the fontSize prop as a rem override', () => {
      render(
        <Heading
          visualAppearance="heading-xxl"
          fontSize={5}
          removeMarginBottom={false}
        >
          Override H1
        </Heading>,
      );
      expect(screen.getByText('Override H1')).toHaveStyle({fontSize: '5rem'});
    });

    it('applies the fontWeight prop as a numeric override', () => {
      render(
        <Heading
          visualAppearance="heading-xxl"
          fontWeight="700"
          removeMarginBottom={false}
        >
          Bold H1
        </Heading>,
      );
      expect(screen.getByText('Bold H1')).toHaveStyle({fontWeight: 700});
    });

    it('applies the lineHeight prop as a unitless override', () => {
      render(
        <Heading
          visualAppearance="heading-md"
          lineHeight={1.2}
          removeMarginBottom={false}
        >
          Tight H4
        </Heading>,
      );
      expect(screen.getByText('Tight H4')).toHaveStyle({lineHeight: '1.2'});
    });

    it('applies textTransform when non-none', () => {
      render(
        <Heading
          visualAppearance="heading-md"
          textTransform="uppercase"
          removeMarginBottom={false}
        >
          Upper H4
        </Heading>,
      );
      expect(screen.getByText('Upper H4')).toHaveStyle({
        textTransform: 'uppercase',
      });
    });
  });

  // Spec 009 US3 — orthogonal Heading Level / Visual Appearance.
  describe('orthogonal Heading Level / Visual Appearance', () => {
    it('Heading Level always determines the rendered <h*> tag regardless of appearance', () => {
      render(
        <div>
          <Heading
            visualAppearance="heading-xl"
            appearance="display-2xl"
            removeMarginBottom={false}
          >
            h2 looks like H1
          </Heading>
          <Heading
            visualAppearance="heading-xxl"
            appearance="display-lg"
            removeMarginBottom={false}
          >
            h1 looks smaller
          </Heading>
          <Heading
            visualAppearance="heading-md"
            appearance="display-4xl"
            removeMarginBottom={false}
          >
            h4 visually huge
          </Heading>
        </div>,
      );

      expect(
        screen.getByRole('heading', {level: 2, name: 'h2 looks like H1'}),
      ).toBeInTheDocument();
      expect(
        screen.getByRole('heading', {level: 1, name: 'h1 looks smaller'}),
      ).toBeInTheDocument();
      expect(
        screen.getByRole('heading', {level: 4, name: 'h4 visually huge'}),
      ).toBeInTheDocument();
    });

    it('appearance="display-4xl" emits an inline 7.5rem font-size (no canonical level matches)', () => {
      render(
        <Heading
          visualAppearance="heading-md"
          appearance="display-4xl"
          removeMarginBottom={false}
        >
          Huge h4
        </Heading>,
      );
      expect(screen.getByText('Huge h4')).toHaveStyle({fontSize: '7.5rem'});
    });

    it('appearance="default" with no overrides is a no-op (variant flows through)', () => {
      const {container: a} = render(
        <Heading visualAppearance="heading-xl" removeMarginBottom={false}>
          Default
        </Heading>,
      );
      const {container: b} = render(
        <Heading
          visualAppearance="heading-xl"
          appearance="default"
          removeMarginBottom={false}
        >
          Default
        </Heading>,
      );
      // Both renderings should produce the same inline style attribute on
      // the heading element (no extra fontSize / lineHeight / letterSpacing
      // emitted by the appearance="default" sentinel).
      expect(a.querySelector('h2')?.getAttribute('class')).toBe(
        b.querySelector('h2')?.getAttribute('class'),
      );
    });
  });
});
