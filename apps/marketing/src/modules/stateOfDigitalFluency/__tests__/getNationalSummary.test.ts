import {draftMode} from 'next/headers';

import {getContentfulClient} from '@/contentful/client';
import logger from '@/logger/contentful';

import {getNationalSummaryUrl} from '../getNationalSummary';

jest.mock('next/headers', () => ({draftMode: jest.fn()}));
jest.mock('@/contentful/client', () => ({getContentfulClient: jest.fn()}));
jest.mock('@/logger/contentful', () => ({error: jest.fn()}));
// React's cache() only dedupes inside a server request; call through in tests.
jest.mock('react', () => ({
  ...jest.requireActual('react'),
  cache: (fn: unknown) => fn,
}));

const mockEntry = (fields: object | null) => {
  const getEntries = jest
    .fn()
    .mockResolvedValue({items: fields ? [{fields}] : []});
  (getContentfulClient as jest.Mock).mockReturnValue({getEntries});
  return getEntries;
};

describe('getNationalSummaryUrl', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (draftMode as jest.Mock).mockResolvedValue({isEnabled: false});
  });

  it('fetches the File Download entry by sys.id[in] so the fetch is tagged', async () => {
    const getEntries = mockEntry({title: 'Snapshot'});
    await getNationalSummaryUrl();
    expect(getEntries).toHaveBeenCalledWith({
      'sys.id[in]': ['3rfxpNTqfQfWXAlO6FVoYv'],
      limit: 1,
    });
  });

  it('is null until a file or URL is attached', async () => {
    mockEntry({title: 'Snapshot', fileTitle: 'Report'});
    await expect(getNationalSummaryUrl()).resolves.toBeNull();
    mockEntry(null);
    await expect(getNationalSummaryUrl()).resolves.toBeNull();
  });

  it('prefers the attached asset, made absolute', async () => {
    mockEntry({
      fileAsset: {fields: {file: {url: '//assets.example.org/summary.pdf'}}},
      externalFileUrl: 'https://example.org/other.pdf',
    });
    await expect(getNationalSummaryUrl()).resolves.toBe(
      'https://assets.example.org/summary.pdf',
    );
  });

  it.each([
    ['https://example.org/summary.pdf', 'https://example.org/summary.pdf'],
    ['/files/summary.pdf', '/files/summary.pdf'],
  ])('falls back to the external URL %s', async (url, expected) => {
    mockEntry({externalFileUrl: url});
    await expect(getNationalSummaryUrl()).resolves.toBe(expected);
  });

  it('uses the preview client in draft mode', async () => {
    (draftMode as jest.Mock).mockResolvedValue({isEnabled: true});
    mockEntry(null);
    await getNationalSummaryUrl();
    expect(getContentfulClient).toHaveBeenCalledWith(true);
  });

  it('rethrows fetch errors so ISR keeps the last good page', async () => {
    (getContentfulClient as jest.Mock).mockReturnValue({
      getEntries: jest.fn().mockRejectedValue(new Error('down')),
    });
    await expect(getNationalSummaryUrl()).rejects.toThrow('down');
    expect(logger.error).toHaveBeenCalled();
  });
});
