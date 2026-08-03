import {render, screen} from '@testing-library/react';

import ButtonLegacy from '../ButtonLegacy';

describe('ButtonLegacy', () => {
  const baseProps = {
    color: 'purple',
    type: 'primary',
    href: 'https://code.org',
  } as const;

  it('renders an icon-only button when Icon Only is set and a left icon exists', () => {
    render(
      <ButtonLegacy
        {...baseProps}
        text="Play video"
        iconLeftName="play"
        isIconOnly
      />,
    );
    const link = screen.getByRole('link');
    // Text is hidden; the hidden text becomes the accessible name.
    expect(link).not.toHaveTextContent('Play video');
    expect(link).toHaveAccessibleName('Play video');
  });

  it('prefers ariaLabel over text for the icon-only accessible name', () => {
    render(
      <ButtonLegacy
        {...baseProps}
        text="Play video"
        ariaLabel="Watch the intro video"
        iconLeftName="play"
        isIconOnly
      />,
    );
    expect(screen.getByRole('link')).toHaveAccessibleName(
      'Watch the intro video',
    );
  });

  it('falls back to the regular text button when Icon Only is set without a left icon', () => {
    render(<ButtonLegacy {...baseProps} text="Learn more" isIconOnly />);
    expect(screen.getByRole('link')).toHaveTextContent('Learn more');
  });

  it('renders the editor placeholder when Icon Only is set with no icon and no text', () => {
    render(<ButtonLegacy {...baseProps} isIconOnly />);
    expect(screen.queryByRole('link')).not.toBeInTheDocument();
    expect(screen.getByText(/Button placeholder/)).toBeVisible();
  });
});
