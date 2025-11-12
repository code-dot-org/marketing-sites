import {render} from '@testing-library/react';

import {Brand} from '@/config/brand';
import StatsigProvider from '@/providers/statsig/StatsigProvider';

describe('StatsigProvider', () => {
  const brand = Brand.CODE_DOT_ORG;

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should render children when STATSIG_CLIENT_KEY is not set', () => {
    delete process.env.STATSIG_CLIENT_KEY;
    const {getByText} = render(
      <StatsigProvider brand={brand} stage={'development'}>
        <div>Test Child</div>
      </StatsigProvider>,
    );
    expect(getByText('Test Child')).toBeInTheDocument();
  });

  it('should render BaseStatsigProvider with client when STATSIG_CLIENT_KEY is set', () => {
    const {getByText} = render(
      <StatsigProvider
        brand={brand}
        stage={'development'}
        clientKey={'test-key'}
      >
        <div>Test Child</div>
      </StatsigProvider>,
    );
    expect(getByText('Test Child')).toBeInTheDocument();
  });
});
