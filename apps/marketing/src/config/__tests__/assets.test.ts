import {getAssetPublicPath} from '../assets';

describe('getAssetPublicPath', () => {
  let originalEnv: NodeJS.ProcessEnv;

  beforeAll(() => {
    originalEnv = {...process.env};
  });

  afterEach(() => {
    process.env = {...originalEnv};
  });

  it('should return the production path when NODE_ENV is production', () => {
    process.env = {...originalEnv, NODE_ENV: 'production'};
    expect(getAssetPublicPath()).toBe('/_next/static/public');
  });

  it('should return the development path when NODE_ENV is not production', () => {
    process.env = {...originalEnv, NODE_ENV: 'development'};
    expect(getAssetPublicPath()).toBe('');
  });
});
