import {render, screen, within} from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import {isExternalLink} from '@/components/common/utils';

import {HeaderContent} from '../../codeOrg/types';
import HeaderHourOfAiView from '../HeaderHourOfAiView';

jest.mock('@/components/common/utils', () => ({
  isExternalLink: jest.fn().mockReturnValue(false),
}));

const content: HeaderContent = {
  mainMenu: [
    {label: 'Resources', href: '/resources'},
    {
      label: 'Partners',
      href: '/partners',
      submenu: {
        columns: [
          {type: 'Text List', items: [{title: 'Sponsor', href: '/sponsor'}]},
        ],
      },
    },
  ],
  secondaryMenu: [{label: 'Donate', href: 'https://donate.example.org'}],
};

const mainNav = () => screen.getByRole('navigation', {name: 'Main'});

describe('HeaderHourOfAiView', () => {
  beforeEach(() => {
    jest.mocked(isExternalLink).mockReturnValue(false);
  });

  it('links the logo home', () => {
    render(<HeaderHourOfAiView content={content} />);

    expect(screen.getByRole('link', {name: 'Hour of AI home'})).toHaveAttribute(
      'href',
      '/',
    );
  });

  it('renders main and secondary items as links, submenus as their primary target', () => {
    render(<HeaderHourOfAiView content={content} />);

    const links = within(mainNav()).getAllByRole('link');
    expect(links.map(link => link.textContent)).toEqual([
      'Resources',
      'Partners',
      'Donate',
    ]);
    expect(links[1]).toHaveAttribute('href', '/partners');
    expect(screen.queryByText('Sponsor')).not.toBeInTheDocument();
  });

  it('renders the Start building call to action', () => {
    render(<HeaderHourOfAiView content={content} />);

    const bar = mainNav().parentElement!.parentElement!;
    expect(
      within(bar).getByRole('link', {name: 'Start building'}),
    ).toHaveAttribute('href', '/activities');
  });

  it('opens external links in a new tab', () => {
    jest
      .mocked(isExternalLink)
      .mockImplementation(href => href.startsWith('https://'));
    render(<HeaderHourOfAiView content={content} />);

    const donate = within(mainNav()).getByRole('link', {name: 'Donate'});
    expect(donate).toHaveAttribute('target', '_blank');
    expect(donate).toHaveAttribute('rel', 'noopener noreferrer');
  });

  it('toggles the mobile menu and closes it with Escape', async () => {
    const user = userEvent.setup();
    render(<HeaderHourOfAiView content={content} />);

    const toggle = screen.getByRole('button', {name: 'Open menu'});
    await user.click(toggle);

    expect(toggle).toHaveAttribute('aria-expanded', 'true');
    expect(toggle).toHaveAccessibleName('Close menu');
    // The panel's own call to action stays hidden until the bar is too
    // narrow for it (jsdom never measures that).
    const mobile = screen.getByRole('navigation', {name: 'Mobile'});
    expect(
      within(mobile)
        .getAllByRole('link')
        .map(link => link.textContent),
    ).toEqual(['Resources', 'Partners', 'Donate']);

    await user.keyboard('{Escape}');

    expect(toggle).toHaveAttribute('aria-expanded', 'false');
    expect(toggle).toHaveFocus();
  });
});
