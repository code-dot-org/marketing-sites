import {render} from '@testing-library/react';
import StatsigProvider from '@/providers/statsig/StatsigProvider';

describe('StatsigProvider', () => {
  const mockValues = 'test-values';

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should render children when NEXT_PUBLIC_STATSIG_CLIENT_KEY is not set', () => {
    delete process.env.NEXT_PUBLIC_STATSIG_CLIENT_KEY;
    const {getByText} = render(
      <StatsigProvider values={mockValues}>
        <div>Test Child</div>
      </StatsigProvider>,
    );
    expect(getByText('Test Child')).toBeInTheDocument();
  });

  it('should render BaseStatsigProvider with client when NEXT_PUBLIC_STATSIG_CLIENT_KEY is set', () => {
    process.env.NEXT_PUBLIC_STATSIG_CLIENT_KEY = 'test-key';
    const {getByText} = render(
      <StatsigProvider values={mockValues}>
        <div>Test Child</div>
      </StatsigProvider>,
    );
    expect(getByText('Test Child')).toBeInTheDocument();
  });
});
