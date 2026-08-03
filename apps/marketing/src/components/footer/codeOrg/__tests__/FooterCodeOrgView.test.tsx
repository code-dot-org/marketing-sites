import {fireEvent, render, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import {DEFAULT_FOOTER_CONTENT, SOCIAL_LINKS} from '../config';
import FooterCodeOrgView from '../FooterCodeOrgView';

const mockPush = jest.fn();

jest.mock('next/navigation', () => ({
  useRouter: () => ({push: mockPush}),
  usePathname: () => '/en-US/some-page',
}));

describe('FooterCodeOrgView', () => {
  beforeAll(() => {
    global.Localize = {setLanguage: jest.fn()} as unknown as typeof Localize;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  const renderFooter = () =>
    render(
      <FooterCodeOrgView locale="en-US" content={DEFAULT_FOOTER_CONTENT} />,
    );

  it('renders the CodeAI logo, tagline, and mission', () => {
    renderFooter();

    expect(screen.getByAltText('CodeAI')).toBeVisible();
    expect(screen.getByText(DEFAULT_FOOTER_CONTENT.tagline)).toBeVisible();
    expect(screen.getByText(DEFAULT_FOOTER_CONTENT.mission)).toBeVisible();
  });

  it('renders every link column with heading and links', () => {
    renderFooter();

    const columns = DEFAULT_FOOTER_CONTENT.linkColumns;
    for (const heading of columns.flatMap(c => c.heading ?? [])) {
      expect(screen.getByText(heading)).toBeVisible();
    }
    for (const link of columns.flatMap(c => c.lists.flat())) {
      const anchor = screen.getByRole('link', {name: link.label});
      expect(anchor).toHaveAttribute('href', link.href);
    }
  });

  it('renders continuation lists under a shared heading', () => {
    render(
      <FooterCodeOrgView
        locale="en-US"
        content={{
          ...DEFAULT_FOOTER_CONTENT,
          linkColumns: [
            {
              heading: 'Organization',
              lists: [
                [{label: 'About', href: '/about'}],
                [{label: 'Careers', href: '/about/careers'}],
              ],
            },
            {
              heading: undefined,
              lists: [[{label: 'Standalone', href: '/standalone'}]],
            },
          ],
        }}
      />,
    );

    const nav = screen.getByRole('navigation', {name: 'Footer'});
    expect(screen.getByText('Organization')).toBeVisible();
    // Both lists render inside the same headed column group.
    expect(screen.getByRole('link', {name: 'About'})).toBeVisible();
    expect(screen.getByRole('link', {name: 'Careers'})).toBeVisible();
    expect(nav.querySelectorAll('ul')).toHaveLength(3);
    // A heading-less group renders its links without a heading element.
    expect(screen.getByRole('link', {name: 'Standalone'})).toBeVisible();
  });

  it('renders social links with accessible labels', () => {
    renderFooter();

    for (const social of SOCIAL_LINKS) {
      const anchor = screen.getByRole('link', {name: social.label});
      expect(anchor).toHaveAttribute('href', social.href);
      expect(anchor).toHaveAttribute('target', '_blank');
      expect(anchor).toHaveAttribute('rel', 'noopener noreferrer');
    }
  });

  it('renders the copyright text', () => {
    renderFooter();

    expect(screen.getByText(DEFAULT_FOOTER_CONTENT.copyright)).toBeVisible();
  });

  it('renders a language selector that is not translated', () => {
    renderFooter();

    const languageSelect = screen.getByRole('combobox', {
      name: /select language/i,
    });
    expect(languageSelect).toBeVisible();
    expect(languageSelect.closest('.notranslate')).not.toBeNull();
  });

  it('routes to the new locale when the language changes', async () => {
    renderFooter();

    const languageSelect = screen.getByRole('combobox', {
      name: /select language/i,
    });
    await userEvent.selectOptions(languageSelect, 'es');

    expect(mockPush).toHaveBeenCalledWith('/es/some-page');
  });

  it('opens the OneTrust cookie dialog for the Cookies link', () => {
    window.OneTrust = {
      ToggleInfoDisplay: jest.fn(),
      OnConsentChanged: jest.fn(),
      IsAlertBoxClosedAndValid: jest.fn(),
    };

    renderFooter();

    fireEvent.click(screen.getByRole('link', {name: 'Cookies'}));

    expect(window.OneTrust.ToggleInfoDisplay).toHaveBeenCalled();
  });
});
