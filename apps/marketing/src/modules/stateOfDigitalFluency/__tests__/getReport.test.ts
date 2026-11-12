import {draftMode} from 'next/headers';

import {getContentfulClient} from '@/contentful/client';
import logger from '@/logger/contentful';

import {getReport, ReportShapeError} from '../getReport';

import fixture from './fixtures/reportData.json';

jest.mock('next/headers', () => ({draftMode: jest.fn()}));
jest.mock('@/contentful/client', () => ({getContentfulClient: jest.fn()}));
jest.mock('@/logger/contentful', () => ({error: jest.fn()}));
// React's cache() only dedupes inside a server request; call through in tests.
jest.mock('react', () => ({
  ...jest.requireActual('react'),
  cache: (fn: unknown) => fn,
}));

const entry = (fields: object) => ({
  items: [{fields, sys: {id: 'state-of-digital-fluency', revision: 7}}],
});

const mockClient = (getEntries: jest.Mock) =>
  (getContentfulClient as jest.Mock).mockReturnValue({getEntries});

describe('getReport', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (draftMode as jest.Mock).mockResolvedValue({isEnabled: false});
  });

  it('fetches by sys.id[in] so the fetch is tagged by entry ID', async () => {
    const getEntries = jest.fn().mockResolvedValue(entry(fixture));
    const getEntry = jest.fn();
    (getContentfulClient as jest.Mock).mockReturnValue({getEntries, getEntry});

    const report = await getReport();

    expect(getEntries).toHaveBeenCalledWith({
      'sys.id[in]': ['state-of-digital-fluency'],
      limit: 1,
    });
    expect(getEntry).not.toHaveBeenCalled();
    expect(report?.dataAsOf).toBe('2026-11-09');
    expect(report?.data.states).toHaveLength(51);
    expect(report?.warnings).toHaveLength(1);
  });

  it.each([true, false])(
    'uses the preview client only in draft mode (%s)',
    async isEnabled => {
      (draftMode as jest.Mock).mockResolvedValue({isEnabled});
      mockClient(jest.fn().mockResolvedValue(entry(fixture)));

      await getReport();

      expect(getContentfulClient).toHaveBeenCalledWith(isEnabled);
    },
  );

  it('takes an explicit draft flag, for the sitemap', async () => {
    mockClient(jest.fn().mockResolvedValue(entry(fixture)));

    await getReport({isDraft: false});

    expect(draftMode).not.toHaveBeenCalled();
    expect(getContentfulClient).toHaveBeenCalledWith(false);
  });

  it('returns null when there is no client', async () => {
    (getContentfulClient as jest.Mock).mockReturnValue(undefined);
    await expect(getReport()).resolves.toBeNull();
  });

  it('returns null when the entry does not exist (the launch gate)', async () => {
    mockClient(jest.fn().mockResolvedValue({items: []}));
    await expect(getReport()).resolves.toBeNull();
  });

  it('rethrows fetch failures so ISR keeps the last good page', async () => {
    mockClient(jest.fn().mockRejectedValue(new Error('503')));

    await expect(getReport()).rejects.toThrow('503');
    expect(logger.error).toHaveBeenCalled();
  });

  it('throws and logs when the data fails the shape check', async () => {
    mockClient(
      jest.fn().mockResolvedValue(entry({...fixture, data: {meta: {}}})),
    );

    await expect(getReport()).rejects.toBeInstanceOf(ReportShapeError);
    expect(logger.error).toHaveBeenCalledWith(
      expect.objectContaining({version: 7, paths: ['national', 'states']}),
      expect.any(String),
    );
  });
});
