import {expect} from '@playwright/test';

import {test} from './fixtures/base';
import {MarketingPage} from './pom/marketing';
import {getTestStage} from './utils/stage';

test.describe('www. redirect', () => {
  test('should 301 redirect www. to the bare domain preserving path and query string', async ({
    page,
    browserName,
  }) => {
    test.skip(browserName !== 'chromium', 'Only runs in Chromium');
    test.skip(
      getTestStage() === 'development',
      'www. redirect is only available on AWS-deployed environments',
    );

    const marketingPage = new MarketingPage(page);
    const bareDomain = marketingPage.getBaseDomain();
    const wwwUrl = `https://www.${bareDomain}/about?test=redirect`;

    let redirectStatus: number | undefined;
    let locationHeader: string | undefined;

    page.on('response', response => {
      if (
        redirectStatus === undefined &&
        response.url().includes(`www.${bareDomain}`)
      ) {
        redirectStatus = response.status();
        locationHeader = response.headers()['location'];
      }
    });

    await page.goto(wwwUrl);

    expect(redirectStatus).toBe(301);
    expect(locationHeader).toBe(
      `https://${bareDomain}/about?test=redirect`,
    );
    await page.waitForURL(`**://${bareDomain}/**`);
  });
});
