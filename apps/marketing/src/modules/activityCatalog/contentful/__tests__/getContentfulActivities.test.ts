import {draftMode} from 'next/headers';

import {getContentfulClient} from '@/contentful/client';
import {getAllEntriesForContentType} from '@/contentful/get-entries';

import {getContentfulActivities} from '../getContentfulActivities';

jest.mock('@/contentful/client');
jest.mock('@/contentful/get-entries');
jest.mock('next/headers', () => ({
  draftMode: jest.fn(),
}));

describe('getContentfulActivities', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('returns activities when client is available and draft mode is enabled', async () => {
    const mockClient = {};
    const mockActivities = [{id: 1}, {id: 2}];
    (draftMode as jest.Mock).mockResolvedValue({isEnabled: true});
    (getContentfulClient as jest.Mock).mockReturnValue(mockClient);
    (getAllEntriesForContentType as jest.Mock).mockResolvedValue(
      mockActivities,
    );

    const result = await getContentfulActivities('hour-of-ai');

    expect(draftMode).toHaveBeenCalled();
    expect(getContentfulClient).toHaveBeenCalledWith(true);
    expect(getAllEntriesForContentType).toHaveBeenCalledWith(
      mockClient,
      'curriculum',
      {'metadata.tags.sys.id[in]': ['hour-of-ai']},
    );
    expect(result).toEqual(mockActivities);
  });

  it('returns activities when client is available and draft mode is disabled', async () => {
    const mockClient = {};
    const mockActivities = [{id: 1}, {id: 2}];
    (draftMode as jest.Mock).mockResolvedValue({isEnabled: false});
    (getContentfulClient as jest.Mock).mockReturnValue(mockClient);
    (getAllEntriesForContentType as jest.Mock).mockResolvedValue(
      mockActivities,
    );

    const result = await getContentfulActivities('hour-of-ai');

    expect(draftMode).toHaveBeenCalled();
    expect(getContentfulClient).toHaveBeenCalledWith(false);
    expect(getAllEntriesForContentType).toHaveBeenCalledWith(
      mockClient,
      'curriculum',
      {'metadata.tags.sys.id[in]': ['hour-of-ai']},
    );
    expect(result).toEqual(mockActivities);
  });

  it('returns empty array and warns when client is not available', async () => {
    const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
    (draftMode as jest.Mock).mockResolvedValue({isEnabled: true});
    (getContentfulClient as jest.Mock).mockReturnValue(undefined);

    const result = await getContentfulActivities('hour-of-ai');

    expect(draftMode).toHaveBeenCalled();
    expect(getContentfulClient).toHaveBeenCalledWith(true);
    expect(warnSpy).toHaveBeenCalledWith(
      '⚠️ Contentful client is not available. Please check that frontend/apps/marketing/.env is populated.',
    );
    expect(result).toEqual([]);
    warnSpy.mockRestore();
  });

  it('handles errors thrown by draftMode gracefully', async () => {
    const error = new Error('Draft mode error');
    (draftMode as jest.Mock).mockRejectedValue(error);

    await expect(getContentfulActivities('hour-of-ai')).rejects.toThrow(error);

    expect(draftMode).toHaveBeenCalled();
    expect(getContentfulClient).not.toHaveBeenCalled();
    expect(getAllEntriesForContentType).not.toHaveBeenCalled();
  });
});
