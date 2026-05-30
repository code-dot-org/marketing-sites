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

  test('should set stable id from URL parameter, overriding existing values', async ({
    page,
  }) => {
    test.skip(getSiteType() !== 'corporate', 'Only runs on corporate site');
    const allTheThingsPage = new AllTheThingsPage(page, {locale: 'en-US'});

    // First visit to establish an existing stable id
    await allTheThingsPage.goto();

    const originalStableId = await page.evaluate(() => {
      return window.localStorage.getItem('STATSIG_LOCAL_STORAGE_STABLE_ID');
    });
    expect(originalStableId).toBeTruthy();

    // Visit again with a URL parameter — should override the existing id
    const overrideId = '550e8400-e29b-41d4-a716-446655440000';
    await allTheThingsPage.goto(undefined, {
      statsig_stable_id: overrideId,
    });

    const stableIdLocalStorage = await page.evaluate(() => {
      return window.localStorage.getItem('STATSIG_LOCAL_STORAGE_STABLE_ID');
    });
    const cookies = await page.context().cookies();
    const stableIdCookie = cookies.find(
      cookie => cookie.name === 'statsig_stable_id',
    )?.value;

    expect(stableIdLocalStorage).toBe(overrideId);
    expect(stableIdCookie).toBe(overrideId);
  });

  test('should set stable id from URL parameter when no existing values', async ({
    page,
  }) => {
    test.skip(getSiteType() !== 'corporate', 'Only runs on corporate site');
    const allTheThingsPage = new AllTheThingsPage(page, {locale: 'en-US'});

    const overrideId = '550e8400-e29b-41d4-a716-446655440000';
    await allTheThingsPage.goto(undefined, {
      statsig_stable_id: overrideId,
    });

    const stableIdLocalStorage = await page.evaluate(() => {
      return window.localStorage.getItem('STATSIG_LOCAL_STORAGE_STABLE_ID');
    });
    const cookies = await page.context().cookies();
    const stableIdCookie = cookies.find(
      cookie => cookie.name === 'statsig_stable_id',
    )?.value;

    expect(stableIdLocalStorage).toBe(overrideId);
    expect(stableIdCookie).toBe(overrideId);
  });

  test('should ignore invalid statsig_stable_id URL parameter', async ({
    page,
  }) => {
    test.skip(getSiteType() !== 'corporate', 'Only runs on corporate site');
    const allTheThingsPage = new AllTheThingsPage(page, {locale: 'en-US'});

    await allTheThingsPage.goto(undefined, {
      statsig_stable_id: 'not-a-valid-uuid',
    });

    const stableIdLocalStorage = await page.evaluate(() => {
      return window.localStorage.getItem('STATSIG_LOCAL_STORAGE_STABLE_ID');
    });

    // Should have generated its own id, not used the invalid one
    expect(stableIdLocalStorage).toBeTruthy();
    expect(stableIdLocalStorage).not.toBe('not-a-valid-uuid');
  });

  test('should remove statsig_stable_id URL parameter after processing', async ({
    page,
  }) => {
    test.skip(getSiteType() !== 'corporate', 'Only runs on corporate site');
    const allTheThingsPage = new AllTheThingsPage(page, {locale: 'en-US'});

    const overrideId = '550e8400-e29b-41d4-a716-446655440000';
    await allTheThingsPage.goto(undefined, {
      statsig_stable_id: overrideId,
    });

    // Wait for the script to process and remove the param
    await page.waitForFunction(
      () => !new URLSearchParams(window.location.search).has('statsig_stable_id'),
    );

    const url = new URL(page.url());
    expect(url.searchParams.has('statsig_stable_id')).toBe(false);

    // Other query params (utm_source etc. added by the POM) should still be present
    expect(url.searchParams.has('utm_source')).toBe(true);
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
