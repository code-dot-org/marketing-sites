import {generateBootstrapValues} from '../statsig-backend';
import statsig from '@/providers/statsig/statsig';

jest.mock('@/providers/statsig/statsig', () => ({
  __esModule: true,
  default: {
    initialize: jest.fn(),
    getClientInitializeResponse: jest.fn(),
  },
}));

describe('generateBootstrapValues', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('should return client initialize response if statsig is initialized', async () => {
    await generateBootstrapValues();
    expect(statsig!.getClientInitializeResponse).toHaveBeenCalledTimes(1);
  });
});
