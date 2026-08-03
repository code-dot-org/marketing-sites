import {render, screen} from '@testing-library/react';
import '@testing-library/jest-dom';

import Badge from '@/components/contentful/badge/Badge';
import {SectionBackgroundProvider} from '@/components/contentful/section/SectionBackgroundContext';

describe('Badge component', () => {
  it('renders the text in a non-interactive span', () => {
    render(<Badge text="New" />);
    const badge = screen.getByText('New');
    expect(badge.tagName).toBe('SPAN');
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
    expect(screen.queryByRole('link')).not.toBeInTheDocument();
  });

  it('renders the dark variant outside any Section (purple default)', () => {
    render(<Badge text="New" />);
    expect(screen.getByText('New')).toHaveStyle({
      backgroundColor: 'var(--codeai-purple-primary)',
      color: '#ffffff',
    });
  });

  it('renders the light variant on a dark Section background', () => {
    render(
      <SectionBackgroundProvider value="purpleDark">
        <Badge text="New" />
      </SectionBackgroundProvider>,
    );
    expect(screen.getByText('New')).toHaveStyle({
      backgroundColor: 'var(--codeai-purple-light)',
      color: 'var(--codeai-purple-dark)',
    });
  });

  it.each([['purpleLight'], ['white'], ['transparent']])(
    'renders the dark variant on a %s Section background',
    background => {
      render(
        <SectionBackgroundProvider value={background}>
          <Badge text="New" />
        </SectionBackgroundProvider>,
      );
      expect(screen.getByText('New')).toHaveStyle({
        backgroundColor: 'var(--codeai-purple-primary)',
      });
    },
  );

  it('appearance="light" forces the light variant on a light Section', () => {
    render(
      <SectionBackgroundProvider value="purpleLight">
        <Badge text="New" appearance="light" />
      </SectionBackgroundProvider>,
    );
    expect(screen.getByText('New')).toHaveStyle({
      backgroundColor: 'var(--codeai-purple-light)',
    });
  });

  it('appearance="dark" forces the dark variant on a dark Section', () => {
    render(
      <SectionBackgroundProvider value="black">
        <Badge text="New" appearance="dark" />
      </SectionBackgroundProvider>,
    );
    expect(screen.getByText('New')).toHaveStyle({
      backgroundColor: 'var(--codeai-purple-primary)',
    });
  });

  it('black color rides the gray ramp', () => {
    const {rerender} = render(<Badge text="New" color="black" />);
    expect(screen.getByText('New')).toHaveStyle({
      backgroundColor: 'var(--codeai-gray-8)',
      color: '#ffffff',
    });

    rerender(
      <SectionBackgroundProvider value="black">
        <Badge text="New" color="black" />
      </SectionBackgroundProvider>,
    );
    expect(screen.getByText('New')).toHaveStyle({
      backgroundColor: 'var(--codeai-gray-1)',
      color: 'var(--codeai-gray-8)',
    });
  });

  it('renders a solid 12px icon hidden from AT', () => {
    render(<Badge text="New" iconName="arrow-up" />);
    const icon = screen.getByTestId('font-awesome-v6-icon');
    expect(icon).toHaveClass('fa-solid');
    expect(icon).toHaveClass('fa-arrow-up');
    expect(icon).toHaveStyle({fontSize: '12px'});
    expect(icon).toHaveAttribute('aria-hidden', 'true');
  });

  it('applies the brands family for known FA brand icon names', () => {
    render(<Badge text="New" iconName="github" />);
    expect(screen.getByTestId('font-awesome-v6-icon')).toHaveClass('fa-brands');
  });

  it('positions the icon before or after the text', () => {
    const {rerender} = render(<Badge text="New" iconName="arrow-up" />);
    let badge = screen.getByText('New');
    expect(badge.firstElementChild).toHaveClass('fa-arrow-up');

    rerender(<Badge text="New" iconName="arrow-up" iconPosition="right" />);
    badge = screen.getByText('New');
    expect(badge.lastElementChild).toHaveClass('fa-arrow-up');
  });

  it('icon-only hides the text and exposes an accessible name', () => {
    render(
      <Badge text="New" iconName="plus" isIconOnly ariaLabel="Add item" />,
    );
    const badge = screen.getByRole('img', {name: 'Add item'});
    expect(badge).not.toHaveTextContent('New');
    expect(badge).toHaveStyle({borderRadius: '9999px'});
  });

  it('icon-only falls back to text for the accessible name', () => {
    render(<Badge text="New" iconName="plus" isIconOnly />);
    expect(screen.getByRole('img', {name: 'New'})).toBeInTheDocument();
  });

  it('icon-only without an icon name falls back to a text badge', () => {
    render(<Badge text="New" isIconOnly />);
    expect(screen.getByText('New')).toBeVisible();
    expect(screen.queryByRole('img')).not.toBeInTheDocument();
  });

  it.each([
    ['small', '12px', '2px'],
    ['medium', '14px', '2px'],
    ['large', '14px', '4px'],
  ] as const)('%s size applies its font and padding', (size, fontSize, py) => {
    render(<Badge text="New" size={size} />);
    expect(screen.getByText('New')).toHaveStyle({
      fontSize,
      paddingBlock: py,
    });
  });
});
