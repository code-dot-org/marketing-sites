import {Brand} from '@/config/brand';
import statsig from '@/providers/statsig/statsig';

import {generateBootstrapValues} from '../statsig-backend';

jest.mock('@/providers/statsig/statsig', () => ({
  __esModule: true,
  default: {
    initialize: jest.fn(),
    getClientInitializeResponse: jest.fn(),
  },
}));

const mockedStatsig = statsig as unknown as {
  initialize: jest.Mock;
  getClientInitializeResponse: jest.Mock;
};

describe('generateBootstrapValues', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('should return client initialize response if statsig is initialized', async () => {
    await generateBootstrapValues({brand: Brand.CODE_DOT_ORG});
    expect(mockedStatsig.getClientInitializeResponse).toHaveBeenCalledTimes(1);
  });

  it('should forward stable id to statsig when provided', async () => {
    const stableId = 'cookie-stable';
    await generateBootstrapValues({brand: Brand.CODE_DOT_ORG, stableId});

    const callArgs = mockedStatsig.getClientInitializeResponse.mock.calls[0];
    const user = callArgs[0];
    expect(user.customIDs).toEqual({stableID: stableId});
  });

  it('should omit stable id for unsupported brands', async () => {
    await generateBootstrapValues({brand: Brand.CS_FOR_ALL, stableId: 'ignore'});

    const callArgs = mockedStatsig.getClientInitializeResponse.mock.calls[0];
    const user = callArgs[0];
    expect(user.customIDs).toBeNull();
  });
});
