import {StatsigClient} from '@statsig/js-client';
import {render} from '@testing-library/react';
import {setCookie, getCookie} from 'cookies-next/client';
import {useContext} from 'react';
import {v4 as uuidv4} from 'uuid';

import {Brand} from '@/config/brand';
import {Stage} from '@/config/stage';
import OneTrustContext, {
  OneTrustCookieGroup,
} from '@/providers/onetrust/context/OneTrustContext';
import plugins from '@/providers/statsig/plugins';

import {getClient} from '../client';

const mockInitializeAsync = jest.fn().mockResolvedValue(undefined);
const mockLogEvent = jest.fn();

jest.mock('@statsig/js-client', () => ({
  StatsigClient: jest.fn().mockImplementation(() => ({
    initializeAsync: mockInitializeAsync,
    logEvent: mockLogEvent,
  })),
}));

jest.mock('cookies-next/client', () => ({
  getCookie: jest.fn(),
  setCookie: jest.fn(),
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
  const onetrustContext = useContext(OneTrustContext);
  getClient(clientKey, stage, brand, onetrustContext?.allowedCookies);

  return <></>;
};

describe('getClient', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockInitializeAsync.mockClear();
    mockLogEvent.mockClear();
  });

  it('should use the statsig stable id from cookie if exists', () => {
    (getCookie as jest.Mock).mockReturnValue('existing-stable-id');
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

    expect(StatsigClient).toHaveBeenCalledWith(
      clientKey,
      {customIDs: {stableID: 'existing-stable-id'}},
      {
        environment: {tier: stage},
        plugins: plugins,
      },
    );
    expect(setCookie).not.toHaveBeenCalled();
  });

  it('should generate a new stableId if none exists', () => {
    (getCookie as jest.Mock).mockReturnValue(null);
    (uuidv4 as jest.Mock).mockReturnValue('new-stable-id');
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

    expect(StatsigClient).toHaveBeenCalledWith(
      clientKey,
      {customIDs: {stableID: 'new-stable-id'}},
      {
        environment: {tier: stage},
        plugins: plugins,
      },
    );

    expect(setCookie).toHaveBeenCalledWith(
      'statsig_stable_id',
      'new-stable-id',
      {
        path: '/',
        domain: '.code.org',
        sameSite: 'lax',
        secure: true,
      },
    );
  });

  it('should use the correct environment tier based on the stage', () => {
    (getCookie as jest.Mock).mockReturnValue('existing-stable-id');
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

    expect(StatsigClient).toHaveBeenCalledWith(
      clientKey,
      {customIDs: {stableID: 'existing-stable-id'}},
      {
        environment: {tier: stage},
        plugins: plugins,
      },
    );
  });

  it('should NOT generate a new stableId if performance cookies are disabled', () => {
    (getCookie as jest.Mock).mockReturnValue(null);
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

    expect(StatsigClient).toHaveBeenCalledWith(
      clientKey,
      {},
      {
        environment: {tier: stage},
        plugins: plugins,
      },
    );
    expect(setCookie).not.toHaveBeenCalled();
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

    expect(StatsigClient).toHaveBeenCalledWith(
      clientKey,
      {},
      {
        environment: {tier: stage},
        plugins: plugins,
      },
    );
    expect(setCookie).not.toHaveBeenCalled();
  });

  it('should only set plugins in production', () => {
    (getCookie as jest.Mock).mockReturnValue('existing-stable-id');
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
    expect(StatsigClient).toHaveBeenLastCalledWith(
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
    expect(StatsigClient).toHaveBeenLastCalledWith(
      clientKey,
      {customIDs: {stableID: 'existing-stable-id'}},
      {
        environment: {tier: 'development'},
        plugins: undefined,
      },
    );
  });
});
