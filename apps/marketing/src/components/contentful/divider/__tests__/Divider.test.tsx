import {render, screen} from '@testing-library/react';

import Divider, {DividerProps} from '../Divider';

describe('Divider Component', () => {
  it('renders Divider component', () => {
    render(<Divider />);
    expect(screen.getByRole('separator')).toBeInTheDocument();
  });

  it('applies the correct margin class based on the margin prop', () => {
    render(<Divider margin="l" />);
    const separator = screen.getByRole('separator');
    expect(separator).toHaveClass('divider--margin-l');
  });

  it('renders horizontally with no vertical class or border width by default', () => {
    render(<Divider />);
    const separator = screen.getByRole('separator');
    expect(separator.tagName).toBe('HR');
    expect(separator).not.toHaveClass('divider--vertical');
    expect(separator).not.toHaveAttribute('aria-orientation', 'vertical');
    expect(separator.style.borderBottomWidth).toBe('');
    expect(separator.style.borderRightWidth).toBe('');
  });

  it('renders a vertical divider when direction is vertical', () => {
    render(<Divider direction="vertical" />);
    const separator = screen.getByRole('separator');
    expect(separator).toHaveClass('divider--vertical');
    expect(separator).toHaveAttribute('aria-orientation', 'vertical');
  });

  it('applies a 2px bottom border for medium width horizontal dividers', () => {
    render(<Divider width="medium" />);
    expect(screen.getByRole('separator')).toHaveStyle({
      borderBottomWidth: '2px',
    });
  });

  it('applies a 2px right border for medium width vertical dividers', () => {
    render(<Divider direction="vertical" width="medium" />);
    expect(screen.getByRole('separator')).toHaveStyle({
      borderRightWidth: '2px',
    });
  });

  describe('renders color based on color prop', () => {
    const colorTestCases: {color: DividerProps['color']; expected: string}[] = [
      {
        color: 'primary',
        expected: 'var(--background-neutral-quaternary)', // TODO: Replace with MUI theme color
      },
      {
        color: 'strong',
        expected: 'var(--background-neutral-senary)', // TODO: Replace with MUI theme color
      },
    ];

    colorTestCases.forEach(({color, expected}) => {
      it(`applies ${color} color correctly`, () => {
        render(<Divider color={color} />);
        expect(screen.getByRole('separator')).toHaveStyle({
          backgroundColor: expected,
        });
      });
    });
  });
});
