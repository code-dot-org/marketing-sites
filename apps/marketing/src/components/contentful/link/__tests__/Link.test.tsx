import {render, screen} from '@testing-library/react';

import Link, {LinkProps} from '@/components/contentful/link';

describe('Link Component', () => {
  const defaultProps = {
    href: 'https://example.com',
    size: 'm',
    isLinkExternal: false,
    children: 'Test Link',
  } as LinkProps;

  it('renders the Link component with correct text', () => {
    render(<Link {...defaultProps} />);
    expect(screen.getByText('Test Link')).toBeInTheDocument();
  });

  it('renders with correct href attribute', () => {
    render(<Link {...defaultProps} />);
    expect(screen.getByRole('link')).toHaveAttribute('href', defaultProps.href);
  });

  it('applies correct CSS classes based on size', () => {
    render(<Link {...defaultProps} />);
    expect(screen.getByRole('link')).toHaveClass('link--size-m');
  });

  it('opens external links in a new tab', () => {
    render(<Link {...defaultProps} isLinkExternal={true} />);
    expect(screen.getByRole('link')).toHaveAttribute('target', '_blank');
  });

  it('applies the dark-purple-1 CSS var when color is primary', () => {
    render(<Link {...defaultProps} color="primary" />);
    expect(screen.getByRole('link')).toHaveStyle({
      color: 'var(--codeai-purple-dark-1)',
    });
  });

  it('applies the shared brand CSS var for non-primary colors', () => {
    render(<Link {...defaultProps} color="darkPurple2" />);
    expect(screen.getByRole('link')).toHaveStyle({
      color: 'var(--codeai-purple-dark-2)',
    });
  });

  it('bumps fontWeight to 600 when isStrong is true', () => {
    render(<Link {...defaultProps} isStrong={true} />);
    expect(screen.getByRole('link')).toHaveStyle({fontWeight: '600'});
  });

  it('keeps fontWeight at 500 by default', () => {
    render(<Link {...defaultProps} />);
    expect(screen.getByRole('link')).toHaveStyle({fontWeight: '500'});
  });

  it('renders a FontAwesome icon to the right by default', () => {
    const {container} = render(
      <Link {...defaultProps} icon="arrow-right">
        Click me
      </Link>,
    );
    const link = screen.getByRole('link');
    const icon = container.querySelector('i.fa-arrow-right');
    expect(icon).toBeInTheDocument();
    // Last child of the link should be the icon (right placement).
    expect(link.lastElementChild).toBe(icon);
  });

  it('renders a FontAwesome icon to the left when iconPosition is left', () => {
    const {container} = render(
      <Link {...defaultProps} icon="arrow-left" iconPosition="left">
        Click me
      </Link>,
    );
    const link = screen.getByRole('link');
    const icon = container.querySelector('i.fa-arrow-left');
    expect(icon).toBeInTheDocument();
    expect(link.firstElementChild).toBe(icon);
  });

  it('suppresses the user icon when the link is external', () => {
    const {container} = render(
      <Link {...defaultProps} icon="arrow-right" isLinkExternal={true}>
        Click me
      </Link>,
    );
    expect(container.querySelector('i.fa-arrow-right')).not.toBeInTheDocument();
    // External OpenInNew icon renders as an svg from MUI Icons.
    expect(container.querySelector('svg')).toBeInTheDocument();
  });
});
