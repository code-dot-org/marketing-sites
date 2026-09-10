import {expect} from '@playwright/test';

import {test} from './fixtures/base';
import {AllTheThingsPage} from './pom/all-the-things';
import {getSiteType} from './utils/getSiteType';
import {isDeployedStage} from './utils/stage';

test.describe('Security Tests', () => {
  test('should have HSTS headers', async ({page, browserName}) => {
    test.skip(browserName !== 'chromium', 'Only runs in Chromium');
    test.skip(!isDeployedStage(), 'Only runs in deployed mode');

    const allTheThingsPage = new AllTheThingsPage(page, {locale: 'en-US'});
    const response = await allTheThingsPage.goto();

    expect(response?.headers()['strict-transport-security']).toBe(
      'max-age=31536000',
    );
  });

  test('should redirect http to https', async ({page, browserName}) => {
    test.skip(browserName !== 'chromium', 'Only runs in Chromium');
    test.skip(!isDeployedStage(), 'Only runs in deployed mode');

    const allTheThingsPage = new AllTheThingsPage(page, {locale: 'en-US'});
    const plainTextPath = allTheThingsPage
      .getBasePath()
      .replace('https', 'http');

    await page.goto(plainTextPath);

    // TODO(hourofai): hourofai.org redirects to csforall.org/en-US/hour-of-ai
    // while the site is a placeholder. Update this assertion when the site goes live.
    if (getSiteType() === 'hourofai') {
      expect(page.url()).toBe('https://csforall.org/en-US/hour-of-ai');
      return;
    }

    expect(page.url()).toBe(allTheThingsPage.getBasePath());
  });
});
