import {render, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import SubmenuPanel from '../SubmenuPanel';
import {HeaderMenuItem, HeaderSubmenu} from '../types';

jest.mock('@/components/common/utils', () => ({
  isExternalLink: jest.fn().mockReturnValue(false),
}));

const submenu: HeaderSubmenu = {
  subtitle: 'Inspire your students',
  columns: [
    {
      heading: 'Curriculum',
      type: 'Text List',
      items: [{title: 'All Courses', href: '/curriculum'}],
    },
    {
      heading: 'Professional Learning',
      type: 'Icon List',
      items: [{title: 'Self-paced', href: '/pl', iconName: 'books'}],
    },
  ],
};

const item: HeaderMenuItem & {submenu: HeaderSubmenu} = {
  label: 'Teachers',
  href: '/teach',
  submenu,
};

describe('SubmenuPanel', () => {
  it('renders the primary link, subtitle, and every column', () => {
    render(
      <SubmenuPanel id="panel-teachers" item={item} onClose={jest.fn()} />,
    );

    expect(screen.getByRole('link', {name: /Teachers/})).toHaveAttribute(
      'href',
      '/teach',
    );
    expect(screen.getByText('Inspire your students')).toBeInTheDocument();
    expect(screen.getByText('Curriculum')).toBeInTheDocument();
    expect(screen.getByText('Professional Learning')).toBeInTheDocument();
    expect(screen.getByRole('link', {name: /All Courses/})).toBeInTheDocument();
  });

  it('sets the panel id referenced by the trigger tab', () => {
    const {container} = render(
      <SubmenuPanel id="panel-teachers" item={item} onClose={jest.fn()} />,
    );

    expect(container.querySelector('#panel-teachers')).toBeInTheDocument();
  });

  it('closes via the labelled close button', async () => {
    const onClose = jest.fn();
    render(<SubmenuPanel id="p" item={item} onClose={onClose} />);

    await userEvent.click(
      screen.getByRole('button', {name: 'Close Teachers menu'}),
    );

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('closes when any link is followed', async () => {
    const onClose = jest.fn();
    render(<SubmenuPanel id="p" item={item} onClose={onClose} />);

    await userEvent.click(screen.getByRole('link', {name: /All Courses/}));

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('renders the promo strip with its mapped background, text, and link', () => {
    const withPromo = {
      ...item,
      submenu: {
        ...submenu,
        promo: {
          background: 'lightGreen' as const,
          content: {
            title: 'Explore Hour of AI activities',
            href: '/hour-of-ai',
            subtitle: 'Try an activity',
            iconName: 'computer',
          },
        },
      },
    };
    const {container} = render(
      <SubmenuPanel id="p" item={withPromo} onClose={jest.fn()} />,
    );

    expect(screen.getByText('Try an activity')).toBeInTheDocument();
    const promoLink = screen.getByRole('link', {
      name: /Explore Hour of AI activities/,
    });
    expect(promoLink).toHaveAttribute('href', '/hour-of-ai');
    expect(container.querySelector('.fa-computer')).toBeInTheDocument();
    expect(promoLink.parentElement).toHaveStyle({
      backgroundColor: 'var(--codeai-green-light, #ccf1d0)',
    });
  });

  it('renders no promo strip when the submenu has none', () => {
    render(<SubmenuPanel id="p" item={item} onClose={jest.fn()} />);

    expect(
      screen.queryByRole('link', {name: /Explore Hour of AI activities/}),
    ).not.toBeInTheDocument();
  });
});
