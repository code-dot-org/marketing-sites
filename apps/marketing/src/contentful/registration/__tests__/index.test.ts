import {
  defineBreakpoints,
  defineComponents,
} from '@contentful/experiences-sdk-react';

import {Brand} from '@/config/brand';

import CDOContentfulRegistration from '../code.org';
import CSForAllContentfulRegistration from '../csforall';
import {registerContentfulComponents} from '../index';

jest.mock('@contentful/experiences-sdk-react', () => ({
  defineComponents: jest.fn(),
  defineBreakpoints: jest.fn(),
  defineDesignTokens: jest.fn(),
}));

jest.mock('../code.org', () => ({
  __esModule: true,
  default: {
    componentRegistrations: ['cdo-component'],
    options: {foo: 'bar'},
    breakpoints: [{id: 'desktop', query: '*', displayName: 'All Sizes'}],
  },
}));

jest.mock('../csforall', () => ({
  __esModule: true,
  default: {
    componentRegistrations: ['csforall-component'],
    options: {baz: 'qux'},
  },
}));

describe('registerContentfulComponents', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('registers components for Brand.CODE_DOT_ORG', () => {
    registerContentfulComponents(Brand.CODE_DOT_ORG);
    expect(defineComponents).toHaveBeenCalledWith(
      CDOContentfulRegistration.componentRegistrations,
      CDOContentfulRegistration.options,
    );
  });

  it('registers breakpoints for Brand.CODE_DOT_ORG', () => {
    registerContentfulComponents(Brand.CODE_DOT_ORG);
    expect(defineBreakpoints).toHaveBeenCalledWith(
      CDOContentfulRegistration.breakpoints,
    );
  });

  it('registers components for Brand.CS_FOR_ALL', () => {
    registerContentfulComponents(Brand.CS_FOR_ALL);
    expect(defineComponents).toHaveBeenCalledWith(
      CSForAllContentfulRegistration.componentRegistrations,
      CSForAllContentfulRegistration.options,
    );
    // csforall has no breakpoints — the guard should skip the call
    expect(defineBreakpoints).not.toHaveBeenCalled();
  });

  it('does not register components for unknown brand', () => {
    registerContentfulComponents('UNKNOWN_BRAND' as Brand);
    expect(defineComponents).not.toHaveBeenCalled();
  });
});
