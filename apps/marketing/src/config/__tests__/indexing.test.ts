import {getStage} from '@/config/stage';

import {isIndexableHost} from '../indexing';

jest.mock('@/config/stage', () => ({
  getStage: jest.fn(),
}));

describe('isIndexableHost', () => {
  beforeEach(() => {
    (getStage as jest.Mock).mockReturnValue('production');
  });

  it.each(['code.org', 'csforall.org', 'hourofcode.com'])(
    'allows the production canonical hostname %s',
    hostname => {
      expect(isIndexableHost(hostname)).toBe(true);
    },
  );

  it.each([
    'code.marketing-sites.code.org',
    'preview-code.marketing-sites.code.org',
    'csforall.marketing-sites.test-code.org',
    'localhost.code.org:3001',
    'www.code.org',
  ])('blocks the non-canonical hostname %s', hostname => {
    expect(isIndexableHost(hostname)).toBe(false);
  });

  it('blocks a missing hostname', () => {
    expect(isIndexableHost(null)).toBe(false);
  });

  it.each(['development', 'pr', 'test'])(
    'blocks the canonical hostname outside production (%s)',
    stage => {
      (getStage as jest.Mock).mockReturnValue(stage);

      expect(isIndexableHost('code.org')).toBe(false);
    },
  );
});
