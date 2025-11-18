import {useClientAsyncInit} from '@statsig/react-bindings';
import {render} from '@testing-library/react';
import {v4 as uuidv4} from 'uuid';

import {Brand} from '@/config/brand';
import {Stage} from '@/config/stage';
import OneTrustContext, {
  OneTrustCookieGroup,
} from '@/providers/onetrust/context/OneTrustContext';
import plugins from '@/providers/statsig/plugins';

import {getClient} from '../client';

jest.mock('@statsig/react-bindings', () => ({
  useClientAsyncInit: jest.fn(),
}));

jest.mock('uuid', () => ({
  v4: jest.fn(),
}));

jest.mock('@/providers/statsig/plugins', () => ({}));

const MockStatsigComponent = ({
  clientKey,
  stage,
  brand,
}: {
  clientKey: string;
  stage: Stage;
  brand: Brand;
}) => {
  getClient(clientKey, stage, brand);

  return <></>;
};

describe('getClient', () => {
  beforeEach(() => {
    Object.defineProperty(global, 'localStorage', {
      value: {
        getItem: jest.fn(),
        setItem: jest.fn(),
        removeItem: jest.fn(),
        clear: jest.fn(),
      },
      writable: true,
    });
    jest.clearAllMocks();
  });

  it('should use the statsig stable id from local storage if exists', () => {
    (global.localStorage.getItem as jest.Mock).mockImplementation(key => {
      if (key === 'STATSIG_LOCAL_STORAGE_STABLE_ID') {
        return 'existing-stable-id';
      }
      return null;
    });
    const clientKey = 'test-client-key';
    const stage = 'production';
    const brand = Brand.CODE_DOT_ORG;

    render(
      <OneTrustContext.Provider
        value={{allowedCookies: new Set([OneTrustCookieGroup.Performance])}}
      >
        <MockStatsigComponent
          clientKey={clientKey}
          stage={stage}
          brand={brand}
        />
        <div>Test Child</div>
      </OneTrustContext.Provider>,
    );

    expect(useClientAsyncInit).toHaveBeenCalledWith(
      clientKey,
      {customIDs: {stableID: 'existing-stable-id'}},
      {
        environment: {tier: stage},
        plugins: plugins,
      },
    );
    expect(global.localStorage.getItem).toHaveBeenCalledWith(
      'STATSIG_LOCAL_STORAGE_STABLE_ID',
    );
  });

  it('should use the correct environment tier based on the stage', () => {
    (global.localStorage.getItem as jest.Mock).mockReturnValue(
      'existing-stable-id',
    );
    const clientKey = 'test-client-key';
    const stage = 'production';
    const brand = Brand.CODE_DOT_ORG;

    render(
      <OneTrustContext.Provider
        value={{allowedCookies: new Set([OneTrustCookieGroup.Performance])}}
      >
        <MockStatsigComponent
          clientKey={clientKey}
          stage={stage}
          brand={brand}
        />
        <div>Test Child</div>
      </OneTrustContext.Provider>,
    );

    expect(useClientAsyncInit).toHaveBeenCalledWith(
      clientKey,
      {customIDs: {stableID: 'existing-stable-id'}},
      {
        environment: {tier: stage},
        plugins: plugins,
      },
    );
  });

  it('should NOT generate a new stableId if performance cookies are disabled', () => {
    (global.localStorage.getItem as jest.Mock).mockReturnValue('abc');
    (uuidv4 as jest.Mock).mockReturnValue('new-stable-id');
    const clientKey = 'test-client-key';
    const stage = 'production';
    const brand = Brand.CODE_DOT_ORG;

    render(
      <OneTrustContext.Provider
        value={{
          allowedCookies: new Set([OneTrustCookieGroup.StrictlyNecessary]),
        }}
      >
        <MockStatsigComponent
          clientKey={clientKey}
          stage={stage}
          brand={brand}
        />
        <div>Test Child</div>
      </OneTrustContext.Provider>,
    );

    expect(useClientAsyncInit).toHaveBeenCalledWith(
      clientKey,
      {
        customIDs: {
          stableID: 'abc',
        },
      },
      {
        environment: {tier: stage},
        plugins: plugins,
      },
    );
    expect(global.localStorage.setItem).not.toHaveBeenCalled();
  });

  it('should not set stableId for non-code.org brands', () => {
    const clientKey = 'test-client-key';
    const stage = 'production';
    const brand = Brand.CS_FOR_ALL;

    render(
      <OneTrustContext.Provider
        value={{allowedCookies: new Set([OneTrustCookieGroup.Performance])}}
      >
        <MockStatsigComponent
          clientKey={clientKey}
          stage={stage}
          brand={brand}
        />
        <div>Test Child</div>
      </OneTrustContext.Provider>,
    );

    expect(useClientAsyncInit).toHaveBeenCalledWith(
      clientKey,
      {},
      {
        environment: {tier: stage},
        plugins: plugins,
      },
    );
    expect(global.localStorage.setItem).not.toHaveBeenCalled();
  });

  it('should only set plugins in production', () => {
    (global.localStorage.getItem as jest.Mock).mockReturnValue(
      'existing-stable-id',
    );
    const clientKey = 'test-client-key';
    const brand = Brand.CODE_DOT_ORG;

    // Production: plugins should be set
    render(
      <OneTrustContext.Provider
        value={{allowedCookies: new Set([OneTrustCookieGroup.Performance])}}
      >
        <MockStatsigComponent
          clientKey={clientKey}
          stage={'production'}
          brand={brand}
        />
      </OneTrustContext.Provider>,
    );
    expect(useClientAsyncInit).toHaveBeenLastCalledWith(
      clientKey,
      {customIDs: {stableID: 'existing-stable-id'}},
      {
        environment: {tier: 'production'},
        plugins: plugins,
      },
    );

    // Development: plugins should be undefined
    render(
      <OneTrustContext.Provider
        value={{allowedCookies: new Set([OneTrustCookieGroup.Performance])}}
      >
        <MockStatsigComponent
          clientKey={clientKey}
          stage={'development'}
          brand={brand}
        />
      </OneTrustContext.Provider>,
    );
    expect(useClientAsyncInit).toHaveBeenLastCalledWith(
      clientKey,
      {customIDs: {stableID: 'existing-stable-id'}},
      {
        environment: {tier: 'development'},
        plugins: undefined,
      },
    );
  });

  it('should handle localStorage throwing an error gracefully', () => {
    const originalLocalStorage = global.localStorage;
    Object.defineProperty(global, 'localStorage', {
      value: {
        getItem: jest.fn(() => {
          throw new Error('localStorage error');
        }),
        setItem: jest.fn(),
        removeItem: jest.fn(),
        clear: jest.fn(),
        key: jest.fn(),
        length: 0,
      },
      writable: true,
    });

    const clientKey = 'test-client-key';
    const stage = 'production';
    const brand = Brand.CODE_DOT_ORG;

    expect(() => {
      render(
        <OneTrustContext.Provider
          value={{allowedCookies: new Set([OneTrustCookieGroup.Performance])}}
        >
          <MockStatsigComponent
            clientKey={clientKey}
            stage={stage}
            brand={brand}
          />
        </OneTrustContext.Provider>,
      );
    }).not.toThrow();

    expect(useClientAsyncInit).toHaveBeenCalledWith(
      clientKey,
      {},
      {
        environment: {tier: stage},
        plugins: plugins,
      },
    );

    global.localStorage = originalLocalStorage;
  });

  it('should handle localStorage being undefined gracefully', () => {
    const originalLocalStorage = global.localStorage;
    Object.defineProperty(global, 'localStorage', {
      value: {
        getItem: jest.fn(() => null),
        setItem: jest.fn(),
        removeItem: jest.fn(),
        clear: jest.fn(),
        key: jest.fn(),
        length: 0,
      },
      writable: true,
    });

    const clientKey = 'test-client-key';
    const stage = 'production';
    const brand = Brand.CODE_DOT_ORG;

    render(
      <OneTrustContext.Provider
        value={{allowedCookies: new Set([OneTrustCookieGroup.Performance])}}
      >
        <MockStatsigComponent
          clientKey={clientKey}
          stage={stage}
          brand={brand}
        />
        <div>Test Child</div>
      </OneTrustContext.Provider>,
    );

    expect(useClientAsyncInit).toHaveBeenCalledWith(
      clientKey,
      {},
      {
        environment: {tier: stage},
        plugins: plugins,
      },
    );

    global.localStorage = originalLocalStorage;
  });
});
