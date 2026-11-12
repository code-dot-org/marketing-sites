import {AxeBuilder} from '@axe-core/playwright';
import {expect} from '@playwright/test';

import {test} from './fixtures/base';
import {MarketingPage} from './pom/marketing';
import {getSiteType} from './utils/getSiteType';
import {getTestStage} from './utils/stage';

const BASE = '/state-of-digital-fluency';

// The report stays dark (404) until its reportData entry is first
// published, so these checks skip when the environment has no report.
test.describe('State of Digital Fluency', () => {
  test.beforeEach(({browserName}) => {
    test.skip(getSiteType() !== 'corporate', 'Only runs on code.org');
    test.skip(browserName !== 'chromium', 'Only runs in Chromium');
  });

  test('public pages are cached with SWR and SIE', async ({page}) => {
    test.skip(getTestStage() === 'development', 'Only runs in Docker mode');

    const response = await new MarketingPage(page, {locale: 'en-US'}).goto(
      BASE,
    );
    test.skip(response?.status() === 404, 'Report not published here');

    expect(response?.status()).toBe(200);
    expect(response?.headers()['cache-control']).toMatch(
      /^s-maxage=900, stale-while-revalidate=\d+, stale-if-error=\d+$/,
    );
  });

  test('preview is never cached', async ({page}) => {
    test.skip(getTestStage() === 'development', 'Only runs in Docker mode');

    const response = await new MarketingPage(page, {
      locale: 'en-US',
      isPreview: true,
    }).goto(BASE);
    test.skip(response?.status() === 404, 'No report entry here');

    expect(response?.headers()['cache-control']).toEqual(
      'private, no-cache, no-store, max-age=0, must-revalidate',
    );
  });

  [BASE, `${BASE}/al`].forEach(path => {
    test(`has no axe violations - ${path}`, async ({page}) => {
      const response = await new MarketingPage(page, {locale: 'en-US'}).goto(
        path,
      );
      test.skip(response?.status() === 404, 'Report not published here');

      const results = await new AxeBuilder({page}).include('main').analyze();
      expect(results.violations).toEqual([]);
    });
  });
});
