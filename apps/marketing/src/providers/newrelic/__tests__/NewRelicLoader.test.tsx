import {render} from '@testing-library/react';

import * as environment from '@/providers/environment';
import * as initialize from '@/providers/newrelic/initialize';

import NewRelicProvider from '../NewRelicLoader';

jest.mock('@/providers/environment', () => ({
  getEnv: jest.fn(),
}));

jest.mock('@/providers/newrelic/initialize', () => ({
  initializeNewRelic: jest.fn(),
}));

describe('NewRelicProvder', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return null if NEXT_PUBLIC_INSTRUMENTATION_ENABLED is not "true"', () => {
    jest.spyOn(environment, 'getEnv').mockReturnValue('false');
    const {container} = render(<NewRelicProvider />);
    expect(container.firstChild).toBeNull();
  });

  it('should initialize New Relic if NEXT_PUBLIC_INSTRUMENTATION_ENABLED is "true" and window is defined', () => {
    jest.spyOn(environment, 'getEnv').mockReturnValue('true');
    (initialize.initializeNewRelic as jest.Mock).mockResolvedValue(undefined);
    render(<NewRelicProvider />);
    expect(initialize.initializeNewRelic).toHaveBeenCalled();
  });
});
