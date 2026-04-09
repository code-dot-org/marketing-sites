import {expect} from '@playwright/test';

import {test} from './fixtures/base';
import {MarketingPage} from './pom/marketing';
import {getSiteType} from './utils/getSiteType';
import {getTestStage} from './utils/stage';

test.describe('www. redirect', () => {
  // The www. redirect Distribution is provisioned for all deployed environments
  // except production csforall (which is handled by the infrastructure repository).
  // TODO: Remove SiteType condition when www.csforall.org redirect is migrated
  // from the code-dot-org/infrastructure repository to this stack.
  test.skip(
    () =>
      getTestStage() === 'development' ||
      (getTestStage() === 'production' && getSiteType() === 'csforall'),
    'www. redirect is not available on localhost or for production csforall',
  );

  test('should 301 redirect www. to the bare domain preserving path and query string', async ({
    page,
    browserName,
  }) => {
    test.skip(browserName !== 'chromium', 'Only runs in Chromium');

    const marketingPage = new MarketingPage(page);
    const bareDomain = marketingPage.getBaseDomain();
    const baseUrl = marketingPage.getBaseUrl();
    const protocol = new URL(baseUrl).protocol + '//';
    const wwwUrl = `${protocol}www.${bareDomain}/about?test=redirect`;

    let redirectStatus: number | undefined;
    let locationHeader: string | undefined;

    page.on('response', response => {
      // Capture the first response which should be the 301 redirect
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
    // The CloudFront Function always redirects to https://
    expect(locationHeader).toBe(`https://${bareDomain}/about?test=redirect`);
    await page.waitForURL(`**://${bareDomain}/**`);
  });
});
