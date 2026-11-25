import {draftMode} from 'next/headers';

import {getContentfulClient} from '@/contentful/client';
import logger from '@/logger/contentful';

import {getPastReports} from '../getPastReports';

jest.mock('next/headers', () => ({draftMode: jest.fn()}));
jest.mock('@/contentful/client', () => ({getContentfulClient: jest.fn()}));
jest.mock('@/logger/contentful', () => ({error: jest.fn()}));
// React's cache() only dedupes inside a server request; call through in tests.
jest.mock('react', () => ({
  ...jest.requireActual('react'),
  cache: (fn: unknown) => fn,
}));

const fileDownload = (id: string, fields: object) => ({
  sys: {id, contentType: {sys: {id: 'fileDownload'}}},
  fields,
});

const mockList = (items: object[] | null) => {
  const getEntries = jest.fn().mockResolvedValue({
    items: items ? [{fields: {itemsInThisList: items}}] : [],
  });
  (getContentfulClient as jest.Mock).mockReturnValue({getEntries});
  return getEntries;
};

describe('getPastReports', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (draftMode as jest.Mock).mockResolvedValue({isEnabled: false});
  });

  it('fetches the list by sys.id[in], with its entries and assets', async () => {
    const getEntries = mockList([]);
    await getPastReports();
    expect(getEntries).toHaveBeenCalledWith({
      'sys.id[in]': ['kmjadsTbLQtuZvoWUvypa'],
      include: 2,
      limit: 1,
    });
  });

  it('is empty until the list is published', async () => {
    mockList(null);
    await expect(getPastReports()).resolves.toEqual([]);
  });

  it('keeps list order and trims each entry to what the downloader reads', async () => {
    mockList([
      fileDownload('b', {
        title: 'Internal B',
        fileTitle: 'Report 2024',
        fileAsset: {
          sys: {id: 'asset'},
          fields: {file: {url: '//assets.example.org/2024.pdf'}},
        },
      }),
      fileDownload('a', {
        title: 'Report 2023',
        externalFileUrl: 'https://example.org/2023.pdf',
      }),
    ]);

    await expect(getPastReports()).resolves.toEqual([
      {
        sys: {id: 'b', contentType: {sys: {id: 'fileDownload'}}},
        fields: {
          title: 'Report 2024',
          fileTitle: 'Report 2024',
          fileAsset: {
            fields: {file: {url: 'https://assets.example.org/2024.pdf'}},
          },
        },
      },
      {
        sys: {id: 'a', contentType: {sys: {id: 'fileDownload'}}},
        fields: {
          title: 'Report 2023',
          fileTitle: 'Report 2023',
          externalFileUrl: 'https://example.org/2023.pdf',
        },
      },
    ]);
  });

  it('skips other content types, unresolved links and entries without a file', async () => {
    mockList([
      {sys: {id: 'link', type: 'Link'}},
      {sys: {id: 'x', contentType: {sys: {id: 'link'}}}, fields: {title: 'X'}},
      fileDownload('empty', {fileTitle: 'No file yet'}),
    ]);
    await expect(getPastReports()).resolves.toEqual([]);
  });

  it('uses the preview client in draft mode', async () => {
    (draftMode as jest.Mock).mockResolvedValue({isEnabled: true});
    mockList(null);
    await getPastReports();
    expect(getContentfulClient).toHaveBeenCalledWith(true);
  });

  it('rethrows fetch errors so ISR keeps the last good page', async () => {
    (getContentfulClient as jest.Mock).mockReturnValue({
      getEntries: jest.fn().mockRejectedValue(new Error('down')),
    });
    await expect(getPastReports()).rejects.toThrow('down');
    expect(logger.error).toHaveBeenCalled();
  });
});
