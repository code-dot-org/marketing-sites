import {render} from '@testing-library/react';

import GoogleAnalyticsLoader from '../GoogleAnalyticsLoader';

jest.mock('@next/third-parties/google', () => ({
  GoogleAnalytics: ({gaId}: {gaId: string}) => (
    <div>GoogleAnalytics {gaId}</div>
  ),
}));

jest.mock('next/script', () => ({
  __esModule: true,
  default: ({id, children}: {id: string; children: string}) => (
    <script data-testid={id}>{children}</script>
  ),
}));

describe('GoogleAnalyticsLoader', () => {
  it('renders nothing without a measurement ID', () => {
    const {container} = render(<GoogleAnalyticsLoader measurementIds={[]} />);
    expect(container).toBeEmptyDOMElement();
  });

  it('loads a single measurement ID without extra config', () => {
    const {getByText, queryByTestId} = render(
      <GoogleAnalyticsLoader measurementIds={['G-AAA']} />,
    );
    expect(getByText('GoogleAnalytics G-AAA')).toBeInTheDocument();
    expect(queryByTestId('ga-additional-config')).not.toBeInTheDocument();
  });

  it('configures additional measurement IDs on the shared gtag', () => {
    const {getByText, getByTestId} = render(
      <GoogleAnalyticsLoader measurementIds={['G-AAA', 'G-BBB', 'G-CCC']} />,
    );
    expect(getByText('GoogleAnalytics G-AAA')).toBeInTheDocument();

    const config = getByTestId('ga-additional-config').textContent;
    expect(config).toContain("gtag('config', 'G-BBB');");
    expect(config).toContain("gtag('config', 'G-CCC');");
    expect(config).not.toContain('G-AAA');
  });
});
