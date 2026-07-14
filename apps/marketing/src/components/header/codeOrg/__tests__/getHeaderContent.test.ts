import {draftMode} from 'next/headers';

import {getContentfulClient} from '@/contentful/client';

import {DEFAULT_HEADER_CONTENT} from '../config';
import {getHeaderContent} from '../getHeaderContent';

jest.mock('@/contentful/client');
jest.mock('next/headers', () => ({
  draftMode: jest.fn(),
}));
jest.mock('@/logger/contentful', () => ({
  __esModule: true,
  default: {warn: jest.fn(), info: jest.fn()},
}));

const resolvedSubmenuItem = (
  title: string,
  href: string,
  extra: Record<string, unknown> = {},
) => ({
  sys: {id: `submenu-${title}`},
  fields: {title, primaryTarget: href, ...extra},
});

const resolvedHeaderItem = (
  label: string,
  href: string,
  extra: Record<string, unknown> = {},
) => ({
  sys: {id: `item-${label}`},
  fields: {headerItemName: label, primaryTarget: href, ...extra},
});

const siteHeaderResponse = (fields: Record<string, unknown>) => ({
  items: [{sys: {id: 'site-header'}, fields}],
});

describe('getHeaderContent', () => {
  const mockGetEntries = jest.fn();

  beforeEach(() => {
    (draftMode as jest.Mock).mockResolvedValue({isEnabled: false});
    (getContentfulClient as jest.Mock).mockReturnValue({
      getEntries: mockGetEntries,
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('queries the single siteHeader entry with nested references included', async () => {
    mockGetEntries.mockResolvedValue(
      siteHeaderResponse({
        mainMenuList: [resolvedHeaderItem('Teachers', '/teach')],
      }),
    );

    await getHeaderContent();

    expect(getContentfulClient).toHaveBeenCalledWith(false);
    expect(mockGetEntries).toHaveBeenCalledWith({
      content_type: 'siteHeader',
      limit: 1,
      include: 3,
      locale: 'en-US',
    });
  });

  it('uses the preview client when draft mode is enabled', async () => {
    (draftMode as jest.Mock).mockResolvedValue({isEnabled: true});
    mockGetEntries.mockResolvedValue(siteHeaderResponse({}));

    await getHeaderContent();

    expect(getContentfulClient).toHaveBeenCalledWith(true);
  });

  it('maps menu items, submenu columns, and the promo banner', async () => {
    mockGetEntries.mockResolvedValue(
      siteHeaderResponse({
        mainMenuList: [
          resolvedHeaderItem('Teachers', '/teach', {
            submenuDropdown: true,
            menuSubtitle: 'Inspire your students',
            column1Heading: 'Curriculum',
            column1Type: 'Text List',
            column1ItemList: [
              resolvedSubmenuItem('All Courses', '/curriculum', {
                subtitle: 'Find a course',
              }),
            ],
            column2Heading: 'Professional Learning',
            column2Type: 'Icon List',
            column2ItemList: [
              resolvedSubmenuItem('Self-paced', '/pl', {iconName: 'books'}),
            ],
            column3Heading: 'Featured',
            column3Type: 'Image List Vertical',
            column3ItemList: [
              resolvedSubmenuItem('AI Foundations', '/ai', {
                image: {
                  fields: {
                    file: {url: '//images.ctfassets.net/a/b/c/course.png'},
                  },
                },
              }),
            ],
            promoBanner: true,
            promoBannerBackground: 'lightGreen',
            promoBannerContent: resolvedSubmenuItem(
              'Hour of AI',
              '/hour-of-ai',
            ),
          }),
        ],
        secondaryMenuList: [resolvedHeaderItem('Donate', '/donate')],
      }),
    );

    const content = await getHeaderContent();

    expect(content).toEqual({
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
                items: [
                  {
                    title: 'All Courses',
                    href: '/curriculum',
                    subtitle: 'Find a course',
                  },
                ],
              },
              {
                heading: 'Professional Learning',
                type: 'Icon List',
                items: [{title: 'Self-paced', href: '/pl', iconName: 'books'}],
              },
              {
                heading: 'Featured',
                type: 'Image List Vertical',
                items: [
                  {
                    title: 'AI Foundations',
                    href: '/ai',
                    imageUrl:
                      'https://images.ctfassets.net/a/b/c/course.png?fm=avif',
                  },
                ],
              },
            ],
            promo: {
              background: 'lightGreen',
              content: {title: 'Hour of AI', href: '/hour-of-ai'},
            },
          },
        },
      ],
      secondaryMenu: [{label: 'Donate', href: '/donate', submenu: undefined}],
    });
  });

  it('skips unresolved link stubs and items missing required fields', async () => {
    mockGetEntries.mockResolvedValue(
      siteHeaderResponse({
        mainMenuList: [
          {sys: {type: 'Link', id: 'unpublished'}},
          {sys: {id: 'no-name'}, fields: {primaryTarget: '/x'}},
          {sys: {id: 'no-target'}, fields: {headerItemName: 'X'}},
          resolvedHeaderItem('Teachers', '/teach', {
            submenuDropdown: true,
            column1ItemList: [
              {sys: {type: 'Link', id: 'unpublished-submenu'}},
              {sys: {id: 'untitled'}, fields: {primaryTarget: '/y'}},
              resolvedSubmenuItem('Kept', '/kept'),
            ],
          }),
        ],
      }),
    );

    const content = await getHeaderContent();

    expect(content?.mainMenu).toHaveLength(1);
    expect(content?.mainMenu[0].submenu?.columns).toEqual([
      {
        heading: undefined,
        type: 'Text List',
        items: [{title: 'Kept', href: '/kept'}],
      },
    ]);
  });

  it('maps the mobile menu primary link label when authored', async () => {
    mockGetEntries.mockResolvedValue(
      siteHeaderResponse({
        mainMenuList: [
          resolvedHeaderItem('Teachers', '/teach', {
            mobileMenuPrimaryLinkLabel: 'Teachers Overview',
          }),
        ],
      }),
    );

    const content = await getHeaderContent();

    expect(content?.mainMenu[0].mobileLabel).toBe('Teachers Overview');
  });

  it('omits the submenu when submenuDropdown is false even if columns have items', async () => {
    mockGetEntries.mockResolvedValue(
      siteHeaderResponse({
        mainMenuList: [
          resolvedHeaderItem('Parents', '/parents', {
            submenuDropdown: false,
            column1ItemList: [resolvedSubmenuItem('Ignored', '/ignored')],
          }),
        ],
      }),
    );

    const content = await getHeaderContent();

    expect(content?.mainMenu[0].submenu).toBeUndefined();
  });

  it('omits the submenu when submenuDropdown is true but every column is empty', async () => {
    mockGetEntries.mockResolvedValue(
      siteHeaderResponse({
        mainMenuList: [
          resolvedHeaderItem('Research', '/research', {
            submenuDropdown: true,
            column1Heading: 'Empty',
            column1ItemList: [],
          }),
        ],
      }),
    );

    const content = await getHeaderContent();

    expect(content?.mainMenu[0].submenu).toBeUndefined();
  });

  it('defaults unknown column types to Text List', async () => {
    mockGetEntries.mockResolvedValue(
      siteHeaderResponse({
        mainMenuList: [
          resolvedHeaderItem('Teachers', '/teach', {
            submenuDropdown: true,
            column1Type: 'Carousel',
            column1ItemList: [resolvedSubmenuItem('Item', '/item')],
          }),
        ],
      }),
    );

    const content = await getHeaderContent();

    expect(content?.mainMenu[0].submenu?.columns[0].type).toBe('Text List');
  });

  it('omits the promo when promoBanner is true but content does not resolve', async () => {
    mockGetEntries.mockResolvedValue(
      siteHeaderResponse({
        mainMenuList: [
          resolvedHeaderItem('Teachers', '/teach', {
            submenuDropdown: true,
            column1ItemList: [resolvedSubmenuItem('Item', '/item')],
            promoBanner: true,
            promoBannerContent: {sys: {type: 'Link', id: 'unpublished'}},
          }),
        ],
      }),
    );

    const content = await getHeaderContent();

    expect(content?.mainMenu[0].submenu?.promo).toBeUndefined();
  });

  it('defaults the promo background to lightBlue when the value is missing or unknown', async () => {
    mockGetEntries.mockResolvedValue(
      siteHeaderResponse({
        mainMenuList: [
          resolvedHeaderItem('Teachers', '/teach', {
            submenuDropdown: true,
            column1ItemList: [resolvedSubmenuItem('Item', '/item')],
            promoBanner: true,
            promoBannerBackground: 'neonChartreuse',
            promoBannerContent: resolvedSubmenuItem('Promo', '/promo'),
          }),
        ],
      }),
    );

    const content = await getHeaderContent();

    expect(content?.mainMenu[0].submenu?.promo?.background).toBe('lightBlue');
  });

  it('falls back to the default main menu when the mapped main menu is empty', async () => {
    mockGetEntries.mockResolvedValue(
      siteHeaderResponse({
        mainMenuList: [],
        secondaryMenuList: [resolvedHeaderItem('Donate', '/donate')],
      }),
    );

    const content = await getHeaderContent();

    expect(content?.mainMenu).toEqual(DEFAULT_HEADER_CONTENT.mainMenu);
    expect(content?.secondaryMenu).toEqual([
      {label: 'Donate', href: '/donate', submenu: undefined},
    ]);
  });

  it('returns null when no siteHeader entry is published', async () => {
    mockGetEntries.mockResolvedValue({items: []});

    expect(await getHeaderContent()).toBeNull();
  });

  it('returns null when the Contentful client is unavailable', async () => {
    (getContentfulClient as jest.Mock).mockReturnValue(null);

    expect(await getHeaderContent()).toBeNull();
  });

  it('returns null when the fetch throws', async () => {
    mockGetEntries.mockRejectedValue(new Error('network down'));

    expect(await getHeaderContent()).toBeNull();
  });
});
