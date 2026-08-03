import {render, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import MobileMenu from '../MobileMenu';
import {HeaderContent} from '../types';

jest.mock('@/components/common/utils', () => ({
  isExternalLink: jest.fn().mockReturnValue(false),
}));

const content: HeaderContent = {
  mainMenu: [
    {
      label: 'Teachers',
      href: '/teach',
      submenu: {
        columns: [
          {
            heading: 'Curriculum',
            type: 'Text List',
            items: [
              {
                title: 'All Courses',
                href: '/curriculum',
                subtitle: 'Find a course',
                imageUrl: 'https://img/c.png',
              },
            ],
          },
          {
            heading: 'Featured',
            type: 'Image List Horizontal',
            items: [{title: 'AI Foundations', href: '/ai'}],
          },
        ],
      },
    },
    {label: 'Parents', href: '/parents'},
  ],
  secondaryMenu: [{label: 'Donate', href: '/donate'}],
};

describe('MobileMenu', () => {
  it('renders nothing while closed', () => {
    render(<MobileMenu open={false} onClose={jest.fn()} content={content} />);

    expect(screen.queryByRole('navigation')).not.toBeInTheDocument();
  });

  it('renders main and secondary menu links without a Sign in button', () => {
    render(<MobileMenu open onClose={jest.fn()} content={content} />);

    expect(screen.getByRole('button', {name: 'Teachers'})).toBeInTheDocument();
    expect(screen.getByRole('link', {name: 'Parents'})).toHaveAttribute(
      'href',
      '/parents',
    );
    expect(screen.getByRole('link', {name: 'Donate'})).toBeInTheDocument();
    expect(
      screen.queryByRole('link', {name: 'Sign in'}),
    ).not.toBeInTheDocument();
  });

  it('expands a submenu into flat text links with headings, no subtitles or images', async () => {
    const {baseElement} = render(
      <MobileMenu open onClose={jest.fn()} content={content} />,
    );
    const teachersToggle = screen.getByRole('button', {name: 'Teachers'});
    expect(teachersToggle).toHaveAttribute('aria-expanded', 'false');

    await userEvent.click(teachersToggle);

    expect(teachersToggle).toHaveAttribute('aria-expanded', 'true');
    // Primary link first, then each column's heading and items.
    expect(screen.getByRole('link', {name: 'Teachers'})).toHaveAttribute(
      'href',
      '/teach',
    );
    // Column headings render as plain non-interactive text.
    expect(screen.getByText('Curriculum')).toBeInTheDocument();
    expect(
      screen.queryByRole('link', {name: 'Curriculum'}),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole('button', {name: 'Curriculum'}),
    ).not.toBeInTheDocument();
    expect(screen.getByRole('link', {name: 'All Courses'})).toHaveAttribute(
      'href',
      '/curriculum',
    );
    // Subtitles and images are desktop-only.
    expect(screen.queryByText('Find a course')).not.toBeInTheDocument();
    expect(baseElement.querySelector('img')).not.toBeInTheDocument();
    // The menu is plain divs — no list semantics.
    expect(baseElement.querySelector('nav ul, nav li')).not.toBeInTheDocument();
    // Image List columns (heading and items) are omitted entirely.
    expect(screen.queryByText('Featured')).not.toBeInTheDocument();
    expect(
      screen.queryByRole('link', {name: 'AI Foundations'}),
    ).not.toBeInTheDocument();
  });

  it('uses the mobile-specific label for the primary link when authored', async () => {
    const withMobileLabel: HeaderContent = {
      ...content,
      mainMenu: [
        {...content.mainMenu[0], mobileLabel: 'Teachers Overview'},
        ...content.mainMenu.slice(1),
      ],
    };
    render(<MobileMenu open onClose={jest.fn()} content={withMobileLabel} />);

    await userEvent.click(screen.getByRole('button', {name: 'Teachers'}));

    expect(
      screen.getByRole('link', {name: 'Teachers Overview'}),
    ).toHaveAttribute('href', '/teach');
    expect(screen.queryByRole('link', {name: 'Teachers'})).toBeNull();
  });

  it('closes when any link is followed', async () => {
    const onClose = jest.fn();
    render(<MobileMenu open onClose={onClose} content={content} />);

    await userEvent.click(screen.getByRole('link', {name: 'Parents'}));
    await userEvent.click(screen.getByRole('link', {name: 'Donate'}));

    expect(onClose).toHaveBeenCalledTimes(2);
  });
});
