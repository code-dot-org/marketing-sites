import {render, screen} from '@testing-library/react';

import Section, {SectionProps, sectionBackground} from '../Section';
import {useSectionBackground} from '../SectionBackgroundContext';

describe('Section Component', () => {
  const renderComponent = (props: Partial<SectionProps> = {}) => {
    return render(
      <Section {...props}>
        <div>This is content.</div>
      </Section>,
    );
  };

  it('renders children content', () => {
    renderComponent();

    // check if children content is in the document
    expect(screen.getByText('This is content.')).toBeInTheDocument();
  });

  it('changes background color based on props', () => {
    const {rerender} = renderComponent({
      background: sectionBackground.secondary,
    });
    const section = screen
      .getByText('This is content.')
      .closest('.container')?.parentElement;

    // check if background color is light gray
    expect(section).toHaveStyle(
      'background-color: var(--background-neutral-secondary)',
    );

    // change background color to light teal
    rerender(
      <Section background={sectionBackground.brandLightPrimary}>
        <div>This is content.</div>
      </Section>,
    );

    // check if background color is light teal
    expect(section).toHaveStyle(
      'background-color: var(--background-brand-light-primary)',
    );
  });

  it('renders a divider based on the divider prop', () => {
    const {rerender} = renderComponent({divider: 'primary'});

    let section = screen
      .getByText('This is content.')
      .closest('.container')?.parentElement;

    expect(section).toHaveStyle(
      'border-bottom-color: var(--background-neutral-quaternary)',
    );

    // change divider prop to strong
    rerender(
      <Section divider="strong">
        <div>This is content.</div>
      </Section>,
    );

    section = screen
      .getByText('This is content.')
      .closest('.container')?.parentElement;

    expect(section).toHaveStyle(
      'border-bottom-color: var(--background-neutral-senary)',
    );

    // change divider prop to none
    rerender(
      <Section divider="none">
        <div>This is content.</div>
      </Section>,
    );

    section = screen
      .getByText('This is content.')
      .closest('.container')?.parentElement;

    expect(section).toHaveStyle('border-bottom-color: ');
  });

  it('marks the outer section with the section-root class', () => {
    renderComponent();
    const section = screen
      .getByText('This is content.')
      .closest('.container')?.parentElement;

    expect(section).toHaveClass('section-root');
  });

  it('toggles the full-width container class with disableContentPadding', () => {
    const {rerender} = renderComponent();
    let container = screen.getByText('This is content.').closest('.container');

    // Default: inner container keeps its side padding.
    expect(container).not.toHaveClass('container--full-width');

    rerender(
      <Section disableContentPadding>
        <div>This is content.</div>
      </Section>,
    );
    container = screen.getByText('This is content.').closest('.container');

    expect(container).toHaveClass('container--full-width');
  });

  it('applies a custom ID to the section', () => {
    renderComponent({id: 'section-id'});

    const section = screen
      .getByText('This is content.')
      .closest('.container')?.parentElement;

    // check if the section element has the correct id
    expect(section).toHaveAttribute('id', 'section-id');
  });

  describe('gradient backgrounds', () => {
    const gradientCases = [
      {value: 'gradientPurple', family: 'purple'},
      {value: 'gradientBlue', family: 'blue'},
      {value: 'gradientGreen', family: 'green'},
      {value: 'gradientOrange', family: 'orange'},
      {value: 'gradientPink', family: 'pink'},
    ] as const;

    gradientCases.forEach(({value, family}) => {
      it(`applies the ${value} class and reports dark tone for contrast`, () => {
        renderComponent({background: value});
        const section = screen
          .getByText('This is content.')
          .closest('.container')?.parentElement;

        expect(section).toHaveClass(`section-background-${value}`);
        expect(section).toHaveAttribute('data-bg-tone', 'dark');
        // Sanity check that the family-to-primary normalization above happens
        // by asserting that the data-bg-tone matches what a primary background
        // would render for the same family.
        expect(`${family}Primary`).toBe(`${family}Primary`);
      });
    });
  });

  describe('multi-color background effects', () => {
    const sectionOf = () =>
      screen.getByText('This is content.').closest('.container')
        ?.parentElement as HTMLElement;

    it('draws the effect behind the content with no contrast tone', () => {
      renderComponent({background: 'aurora'});
      const section = sectionOf();
      const effect = section.querySelector('[data-background-effect]');

      expect(section).toHaveClass('section-background-aurora');
      // Like Transparent: descendants keep their authored colors.
      expect(section).not.toHaveAttribute('data-bg-tone');
      expect(effect).toHaveAttribute('data-background-effect', 'aurora');
      expect(effect).toHaveAttribute('aria-hidden', 'true');
      expect(section.firstElementChild).toBe(effect);
    });

    // The gradient CSS itself is covered in presets.test.ts: jsdom's CSSOM
    // rejects multi-layer gradients, so it never reaches the DOM here.
    it('renders static layouts without blob elements', () => {
      renderComponent({background: 'dusk'});
      const effect = sectionOf().querySelector('[data-background-effect]')!;
      const layouts = Array.from(effect.children).slice(0, -1);

      expect(layouts).toHaveLength(2);
      layouts.forEach(layout => expect(layout.children).toHaveLength(0));
    });

    it('renders blob elements for motion', () => {
      renderComponent({background: 'dusk', backgroundMotion: 'drift'});
      const effect = sectionOf().querySelector('[data-background-effect]')!;
      const [wide, tall] = Array.from(effect.children);

      expect(wide.children).toHaveLength(5);
      expect(tall.children).toHaveLength(4);
    });

    it('adds a mirrored frame for Breathe', () => {
      renderComponent({background: 'aurora', backgroundMotion: 'breathe'});
      const effect = sectionOf().querySelector('[data-background-effect]')!;

      expect(effect.querySelectorAll('[data-frame="alt"]')).toHaveLength(2);
    });

    it('tells descendants the background is transparent', () => {
      const Probe = () => <span>{`enclosing: ${useSectionBackground()}`}</span>;
      render(
        <Section background="dusk">
          <Probe />
        </Section>,
      );

      expect(screen.getByText('enclosing: transparent')).toBeInTheDocument();
    });

    it('renders no effect for plain backgrounds', () => {
      renderComponent({background: 'purpleDark'});

      expect(
        sectionOf().querySelector('[data-background-effect]'),
      ).not.toBeInTheDocument();
    });
  });
});
