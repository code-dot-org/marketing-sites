import {expect, Page} from '@playwright/test';

import {test} from './fixtures/base';
import {MarketingPage} from './pom/marketing';
import {getSiteType} from './utils/getSiteType';

async function waitForImages(page: Page) {
  const lazyImages = await page.locator('img[loading="lazy"]:visible').all();

  for (const lazyImage of lazyImages) {
    await lazyImage.scrollIntoViewIfNeeded();

    // wait up to 10 seconds for each image to load
    await expect(lazyImage).toHaveJSProperty('complete', true, {
      timeout: 10000,
    });
  }
}

// Phones get a second, hidden search field beside the Filters button.
function searchField(page: Page) {
  return page.getByPlaceholder('Search...').locator('visible=true');
}

async function assertMixAndMove(page: Page) {
  await expect(page.getByRole('main')).toContainText('Mix & Move with AI');
  const startButton = page.getByLabel('Get started with Mix & Move with AI', {
    exact: true,
  });

  await expect(startButton).toBeVisible();
  await expect(startButton).toHaveAttribute(
    'href',
    'https://studio.code.org/s/mix-move-ai-2025/reset',
  );
}

test.describe('Activity Catalog', () => {
  test('should filter activities', {tag: '@hourofai'}, async ({page}) => {
    test.skip(getSiteType() !== 'hourofai', 'Only runs on hourofai site');

    const marketingPage = new MarketingPage(page);
    await marketingPage.goto('/activities');

    // Wait for activity catalog to be visible
    await expect(
      page.getByRole('heading', {name: 'Explore Hour of AI Activities'}),
    ).toBeVisible();
    await expect(searchField(page)).toBeVisible();
    await expect(
      page.getByText('Loading more activities...'),
    ).not.toBeVisible();

    // Facets start collapsed; open each one before picking a value
    await page.getByRole('button', {name: 'Age', exact: true}).click();
    await page.locator('label').filter({hasText: '13-18'}).click();

    await page.getByRole('button', {name: 'Topic', exact: true}).click();
    await page.getByLabel('Art, Media, Music').check();

    // Ensure the query parameters updated with the selected facets
    await page.waitForURL(
      '**/en-US/activities?term=&ages=13-18&topic=Art%252C%2520Media%252C%2520Music',
    );
    await assertMixAndMove(page);

    // Search in lower case on purpose to test case insensitivity
    await searchField(page).fill('mix & move');

    await assertMixAndMove(page);

    // Search for something that doesn't exist
    await searchField(page).fill('nonexistentactivity');

    // Ensure no results message is shown
    await expect(page.getByText('No activities found')).toBeVisible();
  });

  test('should deep link to activities', {tag: '@hourofai'}, async ({page}) => {
    test.skip(getSiteType() !== 'hourofai', 'Only runs on hourofai site');

    const marketingPage = new MarketingPage(page);

    await marketingPage.goto('/en-US/activities', {
      term: '',
      ages: '6-8',
      topic: 'Computer Science',
      activityType: 'Game or app',
    });

    await expect(page.getByLabel('6-8')).toBeChecked();
    await expect(
      page.getByLabel('Computer Science', {exact: true}),
    ).toBeChecked();
    await expect(page.getByLabel('Game or app')).toBeChecked();

    await assertMixAndMove(page);
  });

  test(
    'should load the Hour of Code catalog',
    {tag: '@hourofai'},
    async ({page}) => {
      test.skip(getSiteType() !== 'hourofai', 'Only runs on hourofai site');

      const marketingPage = new MarketingPage(page);
      await marketingPage.goto('/hour-of-code/activities');

      await expect(
        page.getByRole('heading', {name: 'Explore Hour of Code Activities'}),
      ).toBeVisible();
      await expect(searchField(page)).toBeVisible();
    },
  );

  test('eyes', {tag: '@hourofai'}, async ({page, eyes, browserName}) => {
    // This test waits for images to load, so it is slow
    test.slow();
    test.skip(browserName === 'webkit', 'AVIF does not work on Webkit');
    test.skip(getSiteType() !== 'hourofai', 'Only runs on hourofai site');

    const marketingPage = new MarketingPage(page);
    await marketingPage.goto('/activities');

    // Wait for activity catalog to be visible
    await expect(
      page.getByRole('heading', {name: 'Explore Hour of AI Activities'}),
    ).toBeVisible();
    await expect(searchField(page)).toBeVisible();

    // Wait for lazy loaded images to load
    await waitForImages(page);

    await searchField(page).fill('mix & move');

    await assertMixAndMove(page);

    await eyes.check('Activity Catalog');
  });
});
