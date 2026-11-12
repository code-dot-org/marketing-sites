/**
 * @jest-environment node
 */
import {renderToString} from 'react-dom/server';

import AFEForm from '../AFEForm';

jest.mock('@statsig/react-bindings', () => ({
  useStatsigClient: () => ({
    logEvent: jest.fn(),
  }),
}));

describe('AFEForm', () => {
  afterEach(() => {
    globalThis.sessionStorage?.clear();
  });

  it('should not read session storage when rendered on the server', () => {
    globalThis.sessionStorage.setItem(
      'afeEligibilityFormData',
      JSON.stringify({firstName: 'Leaked'}),
    );

    const html = renderToString(
      <AFEForm
        email="test@example.com"
        schoolId="1234"
        schoolName="Test School"
        onEligibilityReset={jest.fn()}
      />,
    );

    expect(html).not.toContain('Leaked');
  });
});
