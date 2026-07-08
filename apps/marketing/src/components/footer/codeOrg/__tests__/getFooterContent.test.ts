import {draftMode} from 'next/headers';

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

const resolvedLink = (label: string, href: string, isExternal = false) => ({
  sys: {id: `link-${label}`},
  fields: {
    label,
    primaryTarget: href,
    isThisAnExternalLink: isExternal,
  },
});

const resolvedList = (heading: string, items: unknown[]) => ({
  sys: {id: `list-${heading}`},
  fields: {
    listHeading: heading,
    itemsInThisList: items,
  },
});

const siteFooterResponse = (fields: Record<string, unknown>) => ({
  items: [{sys: {id: 'site-footer'}, fields}],
});

describe('getFooterContent', () => {
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

  it('maps the siteFooter entry with resolved list and link references', async () => {
    mockGetEntries.mockResolvedValue(
      siteFooterResponse({
        tagline: 'Tagline',
        mission: 'Mission',
        copyright: 'Copyright',
        linkColumns: [
          resolvedList('Who We Serve', [
            resolvedLink('Teachers', '/teach'),
            resolvedLink('Districts', '/administrators'),
          ]),
          resolvedList('Legal', [
            resolvedLink('Store', 'https://x.test', true),
          ]),
        ],
      }),
    );

    const result = await getFooterContent();

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
          links: [
            {
              label: 'Teachers',
              href: '/teach',
              ariaLabel: undefined,
              isExternal: false,
            },
            {
              label: 'Districts',
              href: '/administrators',
              ariaLabel: undefined,
              isExternal: false,
            },
          ],
        },
        {
          heading: 'Legal',
          links: [
            {
              label: 'Store',
              href: 'https://x.test',
              ariaLabel: undefined,
              isExternal: true,
            },
          ],
        },
      ],
    });
  });

  it('uses the preview client when draft mode is enabled', async () => {
    (draftMode as jest.Mock).mockResolvedValue({isEnabled: true});
    mockGetEntries.mockResolvedValue(siteFooterResponse({}));

    await getFooterContent();

    expect(getContentfulClient).toHaveBeenCalledWith(true);
  });

  it('returns null when the client is not available', async () => {
    (getContentfulClient as jest.Mock).mockReturnValue(undefined);

    expect(await getFooterContent()).toBeNull();
    expect(mockGetEntries).not.toHaveBeenCalled();
  });

  it('returns null when no siteFooter entry is published', async () => {
    mockGetEntries.mockResolvedValue({items: []});

    expect(await getFooterContent()).toBeNull();
  });

  it('returns null when the fetch throws', async () => {
    mockGetEntries.mockRejectedValue(new Error('network down'));

    expect(await getFooterContent()).toBeNull();
  });

  it('skips unresolved references and falls back per field', async () => {
    mockGetEntries.mockResolvedValue(
      siteFooterResponse({
        linkColumns: [
          // Unresolved list stub (unpublished): no fields
          {sys: {type: 'Link', linkType: 'Entry', id: 'unpublished'}},
          resolvedList('Partial', [
            {sys: {type: 'Link', linkType: 'Entry', id: 'unpublished-link'}},
            resolvedLink('Kept', '/kept'),
          ]),
          // Heading missing → column dropped
          {sys: {id: 'no-heading'}, fields: {itemsInThisList: []}},
        ],
      }),
    );

    const result = await getFooterContent();

    expect(result).toEqual({
      tagline: DEFAULT_FOOTER_CONTENT.tagline,
      mission: DEFAULT_FOOTER_CONTENT.mission,
      copyright: DEFAULT_FOOTER_CONTENT.copyright,
      linkColumns: [
        {
          heading: 'Partial',
          links: [
            {
              label: 'Kept',
              href: '/kept',
              ariaLabel: undefined,
              isExternal: false,
            },
          ],
        },
      ],
    });
  });

  it('falls back to default columns when none resolve', async () => {
    mockGetEntries.mockResolvedValue(
      siteFooterResponse({tagline: 'T', mission: 'M', linkColumns: []}),
    );

    const result = await getFooterContent();

    expect(result).toEqual({
      tagline: 'T',
      mission: 'M',
      copyright: DEFAULT_FOOTER_CONTENT.copyright,
      linkColumns: DEFAULT_FOOTER_CONTENT.linkColumns,
    });
  });
});
