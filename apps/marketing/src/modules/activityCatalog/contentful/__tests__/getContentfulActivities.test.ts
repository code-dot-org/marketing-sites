import {Brand} from '@/config/brand';
import {getContentfulClient} from '@/contentful/client';
import {getAllEntriesForContentType} from '@/contentful/get-entries';

import {getContentfulActivities} from '../getContentfulActivities';

jest.mock('next/headers', () => ({
  draftMode: jest.fn(async () => ({isEnabled: false})),
}));
jest.mock('@/contentful/client');
jest.mock('@/contentful/get-entries');

describe('getContentfulActivities', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (getContentfulClient as jest.Mock).mockReturnValue({});
    (getAllEntriesForContentType as jest.Mock).mockResolvedValue([]);
  });

  it('queries the activity content type for the Code.org brand', async () => {
    await getContentfulActivities('hour-of-ai', Brand.CODE_DOT_ORG);

    expect(getAllEntriesForContentType).toHaveBeenCalledWith(
      expect.anything(),
      'activity',
      {'metadata.tags.sys.id[in]': ['hour-of-ai']},
    );
  });

  // CSFORALL-COMPAT: remove with the CSforAll branch when csforall is retired.
  it('queries the legacy curriculum content type for the CSforAll brand', async () => {
    await getContentfulActivities('hour-of-code', Brand.CS_FOR_ALL);

    expect(getAllEntriesForContentType).toHaveBeenCalledWith(
      expect.anything(),
      'curriculum',
      {'metadata.tags.sys.id[in]': ['hour-of-code']},
    );
  });

  it('returns an empty list when the content type does not exist', async () => {
    const unknownContentTypeError = new Error(
      JSON.stringify({
        status: 400,
        details: {
          errors: [{name: 'unknownContentType', value: 'DOESNOTEXIST'}],
        },
      }),
    );
    unknownContentTypeError.name = 'InvalidQuery';
    (getAllEntriesForContentType as jest.Mock).mockRejectedValue(
      unknownContentTypeError,
    );

    await expect(
      getContentfulActivities('hour-of-ai', Brand.CODE_DOT_ORG),
    ).resolves.toEqual([]);
  });

  it('rethrows other Contentful errors', async () => {
    (getAllEntriesForContentType as jest.Mock).mockRejectedValue(
      new Error('network down'),
    );

    await expect(
      getContentfulActivities('hour-of-ai', Brand.CODE_DOT_ORG),
    ).rejects.toThrow('network down');
  });

  it('returns an empty list when the client is unavailable', async () => {
    (getContentfulClient as jest.Mock).mockReturnValue(undefined);

    await expect(
      getContentfulActivities('hour-of-ai', Brand.CODE_DOT_ORG),
    ).resolves.toEqual([]);
    expect(getAllEntriesForContentType).not.toHaveBeenCalled();
  });
});
