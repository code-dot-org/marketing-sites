import {expect} from '@playwright/test';

import {test} from './fixtures/base';
import {AllTheThingsPage} from './pom/all-the-things';
import {getSiteType} from './utils/getSiteType';

test.describe('Statsig Tests', () => {
  test('should set the same stable id in local storage and cookie and initialize client', async ({
    page,
  }) => {
    test.skip(getSiteType() !== 'corporate', 'Only runs on corporate site');
    const allTheThingsPage = new AllTheThingsPage(page, {locale: 'en-US'});
    await allTheThingsPage.goto();

    // Ensure statsig is ready
    await page.evaluate(() => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return (window as any).__STATSIG__.instance()?.loadingStatus === 'Ready';
    });

    const stableIdLocalStorage = await page.evaluate(() => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return (window as any).localStorage.getItem(
        'STATSIG_LOCAL_STORAGE_STABLE_ID',
      );
    });

    // Get stable id from cookie
    const cookies = await page.context().cookies();
    const stableIdCookie = cookies.find(
      cookie => cookie.name === 'statsig_stable_id',
    )?.value;

    expect(stableIdLocalStorage).toBeTruthy();
    expect(stableIdCookie).toBeTruthy();
    expect(stableIdLocalStorage).toBe(stableIdCookie);
  });

  test('should still initialize even if stable id script is blocked', async ({
    page,
  }) => {
    // Block the stable id script from loading
    await page.route('**/statsig-stable-id.min.js', route => route.abort());

    const allTheThingsPage = new AllTheThingsPage(page, {locale: 'en-US'});
    await allTheThingsPage.goto();

    // Ensure statsig is ready
    await page.evaluate(() => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return (window as any).__STATSIG__.instance()?.loadingStatus === 'Ready';
    });
  });
});
