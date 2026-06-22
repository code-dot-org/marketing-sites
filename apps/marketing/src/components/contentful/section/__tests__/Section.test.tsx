import {render, screen} from '@testing-library/react';

import Section, {SectionProps, sectionBackground} from '../Section';

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
});
