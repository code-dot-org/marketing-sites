import {expect} from '@playwright/test';

import {EXPECTED_LOCALIZATION_STRINGS} from './config/i18n';
import {test} from './fixtures/base';
import {AllTheThingsPage} from './pom/all-the-things';

test.describe('i18n', () => {
  test('should switch language using language dropdown', async ({page}) => {
    const allTheThingsPage = new AllTheThingsPage(page, {locale: 'en-US'});
    await allTheThingsPage.goto();
    await page.waitForURL('**/en-US/engineering/all-the-things**');

    // Wait until window.Localize is available and truthy
    await page.waitForFunction(() => !!window.Localize);

    // The redesigned Code.org footer labels the dropdown 'Select language';
    // the MUI footer (csforall, and corporate on the legacy environment)
    // labels it 'Language selection dropdown'.
    const languageDropdown = page.getByLabel(
      /^(Select language|Language selection dropdown)$/,
    );
    await expect(languageDropdown).toBeVisible();

    await languageDropdown.selectOption('ar');

    await page.waitForURL('**/ar/engineering/all-the-things');

    await expect(
      page.getByText(EXPECTED_LOCALIZATION_STRINGS['ar'].longText),
    ).toBeVisible();
  });
});
