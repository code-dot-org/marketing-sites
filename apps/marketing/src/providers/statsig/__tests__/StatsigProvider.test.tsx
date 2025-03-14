import {render} from '@testing-library/react';
import StatsigProvider from '@/providers/statsig/StatsigProvider';

describe('StatsigProvider', () => {
  const mockValues = 'test-values';

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should render children when STATSIG_CLIENT_KEY is not set', () => {
    delete process.env.STATSIG_CLIENT_KEY;
    const {getByText} = render(
      <StatsigProvider values={mockValues}>
        <div>Test Child</div>
      </StatsigProvider>,
    );
    expect(getByText('Test Child')).toBeInTheDocument();
  });

  it('should render BaseStatsigProvider with client when STATSIG_CLIENT_KEY is set', () => {
    process.env.STATSIG_CLIENT_KEY = 'test-key';
    const {getByText} = render(
      <StatsigProvider values={mockValues}>
        <div>Test Child</div>
      </StatsigProvider>,
    );
    expect(getByText('Test Child')).toBeInTheDocument();
  });
});
