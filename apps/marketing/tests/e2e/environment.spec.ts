import {expect} from '@playwright/test';

import {test} from './fixtures/base';
import {AllTheThingsPage} from './pom/all-the-things';
import {getAppStageFromTestStage, getTestStage} from './utils/stage';

test.describe('Environment Variable Tests', () => {
  test('should set the correct environment variables on the client', async ({
    page,
    browserName,
  }) => {
    test.skip(browserName !== 'chromium', 'Only runs in Chromium');
    test.skip(getTestStage() === 'development', 'Only runs in Docker mode');

    const allTheThingsPage = new AllTheThingsPage(page, {locale: 'en-US'});
    await allTheThingsPage.goto();

    // NEXT_PUBLIC_SENTRY_DSN / NEXT_PUBLIC_SENTRY_RELEASE come from Secrets Manager + Docker build-arg in real
    // deploys; in PR CI neither env var is set, so JSON.stringify omits those keys from window.__ENV. Assert
    // the required stage only and allow extra keys.
    await expect(page.evaluate(() => window['__ENV'])).resolves.toEqual(
      expect.objectContaining({
        NEXT_PUBLIC_STAGE: getAppStageFromTestStage(),
      }),
    );
  });
});
