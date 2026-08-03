import {
  fireEvent,
  render,
  screen,
  waitForElementToBeRemoved,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {getCookie} from 'cookies-next/client';

import {isExternalLink} from '@/components/common/utils';

import HeaderCodeOrgView from '../HeaderCodeOrgView';
import {HeaderContent} from '../types';

jest.mock('@/components/common/utils', () => ({
  isExternalLink: jest.fn().mockReturnValue(false),
}));
jest.mock('@/config/studio', () => ({
  getStudioUrl: (path: string) => `https://studio.code.org${path}`,
}));
jest.mock('cookies-next/client', () => ({
  getCookie: jest.fn(),
}));
jest.mock(
  '@/components/contentful/logoTransitionModal/logoTransitionState',
  () => ({
    useLogoTransition: () => ({active: false}),
  }),
);

const content: HeaderContent = {
  mainMenu: [
    {
      label: 'Teachers',
      href: '/teach',
      submenu: {
        subtitle: 'Inspire your students',
        columns: [
          {
            heading: 'Curriculum',
            type: 'Text List',
            items: [{title: 'All Courses', href: '/curriculum'}],
          },
        ],
      },
    },
    {
      label: 'Districts',
      href: '/administrators',
      submenu: {
        columns: [
          {
            type: 'Text List',
            items: [{title: 'District Dashboard', href: '/districts'}],
          },
        ],
      },
    },
    {label: 'Parents', href: '/parents'},
  ],
  secondaryMenu: [{label: 'Donate', href: '/donate'}],
};

describe('HeaderCodeOrgView', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders the logo home link tagged for the logo transition overlay', () => {
    render(<HeaderCodeOrgView content={content} />);

    const logoLink = screen.getByRole('link', {name: 'CodeAI home'});
    expect(logoLink).toHaveAttribute('href', '/');
    expect(logoLink.querySelector('img')).toHaveAttribute(
      'data-logo-transition-target',
    );
  });

  it('renders submenu items as disclosure buttons and plain items as links', () => {
    render(<HeaderCodeOrgView content={content} />);

    const teachersTab = screen.getByRole('button', {name: 'Teachers'});
    expect(teachersTab).toHaveAttribute('aria-expanded', 'false');
    expect(teachersTab).toHaveAttribute('aria-haspopup', 'true');

    expect(screen.getByRole('link', {name: 'Parents'})).toHaveAttribute(
      'href',
      '/parents',
    );
  });

  it('renders the secondary menu and the Sign in button with a caret', () => {
    render(<HeaderCodeOrgView content={content} />);

    expect(screen.getByRole('link', {name: 'Donate'})).toHaveAttribute(
      'href',
      '/donate',
    );
    const signIn = screen.getByRole('link', {name: 'Sign in'});
    expect(signIn).toHaveAttribute(
      'href',
      'https://studio.code.org/users/sign_in',
    );
    expect(signIn.querySelector('.fa-angle-right')).toBeInTheDocument();
  });

  it('swaps to Go to Dashboard when the session cookie is present', () => {
    (getCookie as jest.Mock).mockReturnValue('user');
    render(<HeaderCodeOrgView content={content} />);

    const dashboard = screen.getByRole('link', {name: 'Go to Dashboard'});
    expect(dashboard).toHaveAttribute('href', 'https://studio.code.org/home');
    expect(dashboard.querySelector('.fa-angle-right')).toBeInTheDocument();
    expect(screen.queryByRole('link', {name: 'Sign in'})).toBeNull();
  });

  it('opens the submenu panel on tab click and closes it on a second click', async () => {
    render(<HeaderCodeOrgView content={content} />);
    const teachersTab = screen.getByRole('button', {name: 'Teachers'});

    await userEvent.click(teachersTab);
    expect(teachersTab).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByRole('link', {name: /All Courses/})).toBeInTheDocument();

    await userEvent.click(teachersTab);
    expect(teachersTab).toHaveAttribute('aria-expanded', 'false');
    expect(
      screen.queryByRole('link', {name: /All Courses/}),
    ).not.toBeInTheDocument();
  });

  it('only keeps one submenu panel open at a time', async () => {
    render(<HeaderCodeOrgView content={content} />);

    await userEvent.click(screen.getByRole('button', {name: 'Teachers'}));
    await userEvent.click(screen.getByRole('button', {name: 'Districts'}));

    expect(screen.getByRole('button', {name: 'Teachers'})).toHaveAttribute(
      'aria-expanded',
      'false',
    );
    expect(
      screen.queryByRole('link', {name: /All Courses/}),
    ).not.toBeInTheDocument();
    expect(
      screen.getByRole('link', {name: /District Dashboard/}),
    ).toBeInTheDocument();
  });

  it('closes the panel and restores focus to the trigger on Escape', async () => {
    render(<HeaderCodeOrgView content={content} />);
    const teachersTab = screen.getByRole('button', {name: 'Teachers'});

    await userEvent.click(teachersTab);
    fireEvent.keyDown(screen.getByRole('link', {name: /All Courses/}), {
      key: 'Escape',
    });

    expect(teachersTab).toHaveAttribute('aria-expanded', 'false');
    expect(teachersTab).toHaveFocus();
  });

  it('closes the panel when clicking outside the header', async () => {
    render(<HeaderCodeOrgView content={content} />);
    const teachersTab = screen.getByRole('button', {name: 'Teachers'});

    await userEvent.click(teachersTab);
    fireEvent.click(document.body);

    expect(teachersTab).toHaveAttribute('aria-expanded', 'false');
  });

  it('closes the panel via its close button and restores trigger focus', async () => {
    render(<HeaderCodeOrgView content={content} />);
    const teachersTab = screen.getByRole('button', {name: 'Teachers'});

    await userEvent.click(teachersTab);
    await userEvent.click(
      screen.getByRole('button', {name: 'Close Teachers menu'}),
    );

    expect(teachersTab).toHaveAttribute('aria-expanded', 'false');
    expect(teachersTab).toHaveFocus();
  });

  it('treats duplicate menu entries as independent tabs', async () => {
    // Authors can link the same siteHeaderItem entry multiple times.
    const duplicated: HeaderContent = {
      mainMenu: [content.mainMenu[0], content.mainMenu[0]],
      secondaryMenu: [],
    };
    render(<HeaderCodeOrgView content={duplicated} />);
    const [first, second] = screen.getAllByRole('button', {name: 'Teachers'});

    await userEvent.click(first);
    expect(first).toHaveAttribute('aria-expanded', 'true');
    expect(second).toHaveAttribute('aria-expanded', 'false');

    await userEvent.click(second);
    expect(first).toHaveAttribute('aria-expanded', 'false');
    expect(second).toHaveAttribute('aria-expanded', 'true');

    fireEvent.keyDown(screen.getByRole('link', {name: /All Courses/}), {
      key: 'Escape',
    });
    expect(second).toHaveFocus();
  });

  it('opens external plain tabs in a new tab', () => {
    (isExternalLink as jest.Mock).mockReturnValue(true);
    render(<HeaderCodeOrgView content={content} />);

    const parentsLink = screen.getByRole('link', {name: 'Parents'});
    expect(parentsLink).toHaveAttribute('target', '_blank');
    expect(parentsLink).toHaveAttribute('rel', 'noopener noreferrer');
  });

  it('toggles the mobile menu from the hamburger button', async () => {
    render(<HeaderCodeOrgView content={content} />);
    const hamburger = screen.getByRole('button', {name: 'Open menu'});

    await userEvent.click(hamburger);
    expect(hamburger).toHaveAccessibleName('Close menu');
    expect(hamburger).toHaveAttribute('aria-expanded', 'true');
    expect(
      screen.getByRole('navigation', {name: 'Mobile'}),
    ).toBeInTheDocument();

    await userEvent.click(hamburger);
    expect(hamburger).toHaveAccessibleName('Open menu');
    // The card stays mounted briefly while the collapse animation exits.
    await waitForElementToBeRemoved(() =>
      screen.queryByRole('navigation', {name: 'Mobile'}),
    );
  });

  it('closes the mobile menu on Escape and refocuses the hamburger', async () => {
    render(<HeaderCodeOrgView content={content} />);
    const hamburger = screen.getByRole('button', {name: 'Open menu'});

    await userEvent.click(hamburger);
    fireEvent.keyDown(screen.getByRole('navigation', {name: 'Mobile'}), {
      key: 'Escape',
    });

    expect(hamburger).toHaveAttribute('aria-expanded', 'false');
    expect(hamburger).toHaveFocus();
    await waitForElementToBeRemoved(() =>
      screen.queryByRole('navigation', {name: 'Mobile'}),
    );
  });
});
