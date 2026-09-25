import {fireEvent, render, screen, within} from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import {FooterContent} from '../../codeOrg/types';
import FooterHourOfAiView from '../FooterHourOfAiView';

const mockPush = jest.fn();

jest.mock('next/navigation', () => ({
  useRouter: () => ({push: mockPush}),
  usePathname: () => '/en-US/some-page',
}));

const content: FooterContent = {
  tagline: 'Not shown',
  mission: 'Also not shown',
  copyright: '© All rights reserved',
  linkColumns: [
    {
      heading: 'Explore',
      lists: [
        [
          {label: 'Activities', href: '/activities'},
          {label: 'Partners', href: '/partners'},
        ],
        [{label: 'Cookies', href: '/cookies'}],
      ],
    },
    {
      lists: [
        [
          {
            label: 'Donate',
            href: 'https://donate.example.org',
            isExternal: true,
          },
        ],
      ],
    },
  ],
};

const renderFooter = () =>
  render(<FooterHourOfAiView locale="en-US" content={content} />);

describe('FooterHourOfAiView', () => {
  beforeAll(() => {
    global.Localize = {setLanguage: jest.fn()} as unknown as typeof Localize;
  });

  afterEach(() => {
    jest.clearAllMocks();
    delete (window as {OneTrust?: unknown}).OneTrust;
  });

  it('links the logo home', () => {
    renderFooter();

    expect(screen.getByRole('link', {name: 'Hour of AI home'})).toHaveAttribute(
      'href',
      '/',
    );
  });

  it('renders one row of links per Contentful column, without headings', () => {
    renderFooter();

    const rows = within(
      screen.getByRole('navigation', {name: 'Footer'}),
    ).getAllByRole('list');
    expect(
      rows.map(row =>
        within(row)
          .getAllByRole('link')
          .map(link => link.textContent),
      ),
    ).toEqual([['Activities', 'Partners'], ['Cookies'], ['Donate']]);
    expect(screen.queryByText('Explore')).not.toBeInTheDocument();
  });

  it('omits the tagline and mission', () => {
    renderFooter();

    expect(screen.queryByText('Not shown')).not.toBeInTheDocument();
    expect(screen.queryByText('Also not shown')).not.toBeInTheDocument();
  });

  it('opens external links in a new tab', () => {
    renderFooter();

    const donate = screen.getByRole('link', {name: 'Donate'});
    expect(donate).toHaveAttribute('target', '_blank');
    expect(donate).toHaveAttribute('rel', 'noopener noreferrer');
  });

  it('opens the OneTrust dialog from the cookies link', () => {
    const toggle = jest.fn();
    (window as {OneTrust?: unknown}).OneTrust = {ToggleInfoDisplay: toggle};
    renderFooter();

    fireEvent.click(screen.getByRole('link', {name: 'Cookies'}));

    expect(toggle).toHaveBeenCalled();
  });

  it('switches language from the picker', async () => {
    renderFooter();

    await userEvent.selectOptions(
      screen.getByRole('combobox', {name: 'Select language'}),
      'es',
    );

    expect(mockPush).toHaveBeenCalledWith('/es/some-page');
  });

  it('credits AWS with a link, like the Code.org footer', () => {
    renderFooter();

    const aws = screen.getByRole('link', {
      name: 'Powered by AWS Cloud Computing',
    });
    expect(aws).toHaveAttribute(
      'href',
      'https://aws.amazon.com/what-is-cloud-computing',
    );
    expect(aws).toHaveAttribute('target', '_blank');
  });

  it('ends the last link row with the copyright, not as a link', () => {
    renderFooter();

    const rows = within(
      screen.getByRole('navigation', {name: 'Footer'}),
    ).getAllByRole('list');
    const lastItem = within(rows[rows.length - 1])
      .getAllByRole('listitem')
      .at(-1)!;
    expect(lastItem).toHaveTextContent('© All rights reserved');
    expect(within(lastItem).queryByRole('link')).not.toBeInTheDocument();
  });

  it('still shows the copyright when there are no links', () => {
    render(
      <FooterHourOfAiView
        locale="en-US"
        content={{...content, linkColumns: []}}
      />,
    );

    expect(screen.getByText('© All rights reserved')).toBeInTheDocument();
  });
});
