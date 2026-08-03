import {draftMode} from 'next/headers';

import {isExternalLink} from '@/components/common/utils';
import {getContentfulClient} from '@/contentful/client';

import {DEFAULT_FOOTER_CONTENT} from '../config';
import {getFooterContent} from '../getFooterContent';

jest.mock('@/contentful/client');
jest.mock('next/headers', () => ({
  draftMode: jest.fn(),
}));
jest.mock('@/logger/contentful', () => ({
  __esModule: true,
  default: {warn: jest.fn(), info: jest.fn()},
}));
jest.mock('@/components/common/utils', () => ({
  isExternalLink: jest.fn().mockReturnValue(false),
}));

const resolvedItem = (title: string, href: string) => ({
  sys: {id: `item-${title}`},
  fields: {
    internalName: `Footer Item: ${title}`,
    title,
    primaryTarget: href,
  },
});

const siteFooterResponse = (fields: Record<string, unknown>) => ({
  items: [{sys: {id: 'site-footer'}, fields}],
});

describe('getFooterContent', () => {
  const mockGetEntries = jest.fn();

  // Unwraps the result for tests that only care about mapped content.
  const getContentOrNull = async () => {
    const result = await getFooterContent();
    return result.status === 'ok' ? result.content : null;
  };

  beforeEach(() => {
    (draftMode as jest.Mock).mockResolvedValue({isEnabled: false});
    (getContentfulClient as jest.Mock).mockReturnValue({
      getEntries: mockGetEntries,
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
    (isExternalLink as jest.Mock).mockReturnValue(false);
  });

  it('maps the siteFooter entry with column heading and item list fields', async () => {
    (isExternalLink as jest.Mock).mockImplementation((href: string) =>
      href.startsWith('https://'),
    );
    mockGetEntries.mockResolvedValue(
      siteFooterResponse({
        tagline: 'Tagline',
        mission: 'Mission',
        copyright: 'Copyright',
        column1Heading: 'Who We Serve',
        column1ItemList: [
          resolvedItem('Teachers', '/teach'),
          resolvedItem('Districts', '/administrators'),
        ],
        column2Heading: 'Legal',
        column2ItemList: [resolvedItem('Store', 'https://x.test')],
      }),
    );

    const result = await getContentOrNull();

    expect(mockGetEntries).toHaveBeenCalledWith({
      content_type: 'siteFooter',
      limit: 1,
      include: 2,
      locale: 'en-US',
    });
    expect(result).toEqual({
      tagline: 'Tagline',
      mission: 'Mission',
      copyright: 'Copyright',
      linkColumns: [
        {
          heading: 'Who We Serve',
          lists: [
            [
              {label: 'Teachers', href: '/teach', isExternal: false},
              {label: 'Districts', href: '/administrators', isExternal: false},
            ],
          ],
        },
        {
          heading: 'Legal',
          lists: [[{label: 'Store', href: 'https://x.test', isExternal: true}]],
        },
      ],
    });
  });

  it('merges a heading-less column into the preceding heading group', async () => {
    mockGetEntries.mockResolvedValue(
      siteFooterResponse({
        column1Heading: 'Organization',
        column1ItemList: [resolvedItem('About', '/about')],
        column2ItemList: [resolvedItem('Careers', '/about/careers')],
        column3Heading: 'Legal',
        column3ItemList: [resolvedItem('Terms', '/tos')],
      }),
    );

    const result = await getContentOrNull();

    expect(result?.linkColumns).toEqual([
      {
        heading: 'Organization',
        lists: [
          [{label: 'About', href: '/about', isExternal: false}],
          [{label: 'Careers', href: '/about/careers', isExternal: false}],
        ],
      },
      {
        heading: 'Legal',
        lists: [[{label: 'Terms', href: '/tos', isExternal: false}]],
      },
    ]);
  });

  it('keeps a leading heading-less column as its own group', async () => {
    mockGetEntries.mockResolvedValue(
      siteFooterResponse({
        column1ItemList: [resolvedItem('About', '/about')],
      }),
    );

    const result = await getContentOrNull();

    expect(result?.linkColumns).toEqual([
      {
        heading: undefined,
        lists: [[{label: 'About', href: '/about', isExternal: false}]],
      },
    ]);
  });

  it('uses the preview client when draft mode is enabled', async () => {
    (draftMode as jest.Mock).mockResolvedValue({isEnabled: true});
    mockGetEntries.mockResolvedValue(siteFooterResponse({}));

    await getFooterContent();

    expect(getContentfulClient).toHaveBeenCalledWith(true);
  });

  it('returns unavailable when the client is not available', async () => {
    (getContentfulClient as jest.Mock).mockReturnValue(undefined);

    expect(await getFooterContent()).toEqual({status: 'unavailable'});
    expect(mockGetEntries).not.toHaveBeenCalled();
  });

  it('returns unavailable when no siteFooter entry is published', async () => {
    mockGetEntries.mockResolvedValue({items: []});

    expect(await getFooterContent()).toEqual({status: 'unavailable'});
  });

  it('returns unavailable when the fetch throws', async () => {
    mockGetEntries.mockRejectedValue(new Error('network down'));

    expect(await getFooterContent()).toEqual({status: 'unavailable'});
  });

  // LEGACY-ENV-COMPAT: remove with the 'legacy-environment' result arm.
  it('returns legacy-environment when the siteFooter content type does not exist', async () => {
    const error = new Error(
      JSON.stringify({
        details: {
          errors: [{name: 'unknownContentType', value: 'DOESNOTEXIST'}],
        },
      }),
    );
    error.name = 'InvalidQuery';
    mockGetEntries.mockRejectedValue(error);

    expect(await getFooterContent()).toEqual({status: 'legacy-environment'});
  });

  it('skips unresolved and incomplete items and falls back per field', async () => {
    mockGetEntries.mockResolvedValue(
      siteFooterResponse({
        column1Heading: 'Partial',
        column1ItemList: [
          // Unresolved item stub (unpublished): no fields
          {sys: {type: 'Link', linkType: 'Entry', id: 'unpublished'}},
          {sys: {id: 'no-title'}, fields: {primaryTarget: '/no-title'}},
          {sys: {id: 'no-target'}, fields: {title: 'No Target'}},
          resolvedItem('Kept', '/kept'),
        ],
        // Heading with no items → column dropped
        column2Heading: 'Empty',
      }),
    );

    const result = await getContentOrNull();

    expect(result).toEqual({
      tagline: DEFAULT_FOOTER_CONTENT.tagline,
      mission: DEFAULT_FOOTER_CONTENT.mission,
      copyright: DEFAULT_FOOTER_CONTENT.copyright,
      linkColumns: [
        {
          heading: 'Partial',
          lists: [[{label: 'Kept', href: '/kept', isExternal: false}]],
        },
      ],
    });
  });

  it('falls back to default columns when none resolve', async () => {
    mockGetEntries.mockResolvedValue(
      siteFooterResponse({tagline: 'T', mission: 'M', column1ItemList: []}),
    );

    const result = await getContentOrNull();

    expect(result).toEqual({
      tagline: 'T',
      mission: 'M',
      copyright: DEFAULT_FOOTER_CONTENT.copyright,
      linkColumns: DEFAULT_FOOTER_CONTENT.linkColumns,
    });
  });
});
