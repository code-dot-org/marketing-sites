import {expect} from '@playwright/test';

import {getStage} from '@/config/stage';

import {test} from './fixtures/base';
import {MarketingPage} from './pom/marketing';

test.describe('Redirects', () => {
  test('should do a temporary redirect to an internal URL', async ({
    page,
    browserName,
  }) => {
    test.skip(browserName !== 'chromium', 'Only runs in Chromium');
    test.skip(getStage() === 'production', 'Only runs in preprod');
    let redirectStatus: number | undefined;

    page.on('response', response => {
      if (
        response.url().includes('/engineering-redirect-internal-test-501a67e6')
      ) {
        redirectStatus = response.status();
      }
    });

    const marketingPage = new MarketingPage(page);
    await marketingPage.goto('/engineering-redirect-internal-test-501a67e6');

    expect(redirectStatus).toEqual(307);
    await page.waitForURL('**/en-US/engineering/all-the-things');
  });

  test('should do a permanent redirect to an external URL', async ({
    page,
    browserName,
  }) => {
    test.skip(browserName !== 'chromium', 'Only runs in Chromium');
    test.skip(getStage() === 'production', 'Only runs in preprod');
    let redirectStatus: number | undefined;

    page.on('response', response => {
      if (
        response.url().includes('/engineering-redirect-external-test-588aaf530')
      ) {
        redirectStatus = response.status();
      }
    });

    const marketingPage = new MarketingPage(page);
    await marketingPage.goto('/engineering-redirect-external-test-588aaf530');

    expect(redirectStatus).toEqual(308);
    await page.waitForURL('**/api/health_check');
  });
});
