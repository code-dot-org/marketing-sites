import {type Page} from '@playwright/test';

import {loadFonts, FONT_FAMILY_NAMES} from '@code-dot-org/fonts';

export class MarketingPage {
  readonly locale: string | undefined;
  readonly page: Page;

  constructor(page: Page, locale?: string) {
    this.page = page;
    this.locale = locale;
  }

  async enableDraftMode(token: string, slug: string) {
    return await this.page.goto(
      `${this.getBaseUrl()}/api/draft?token=${token}&slug=${slug}&locale=${this.locale}`,
    );
  }

  getBaseDomain() {
    const domain = process.env.MARKETING_DOMAIN;

    if (!domain) {
      console.warn('No domain specified, defaulting to localhost:3001!');

      return 'localhost:3001';
    }

    return domain;
  }

  getBaseUrl() {
    const stage = process.env.STAGE;

    if (!stage) {
      console.error('No stage specified!');

      throw new Error('Missing environment variable STAGE');
    }

    switch (stage) {
      default:
      case 'localhost':
      case 'pr':
        return `http://${this.getBaseDomain()}`;
      case 'test':
      case 'production':
        return `https://${this.getBaseDomain()}`;
    }
  }

  getCookieDomain() {
    const baseDomain = this.getBaseDomain();

    return baseDomain === 'localhost:3001' ? 'localhost' : baseDomain;
  }

  getBasePath() {
    if (this.locale) {
      return `${this.getBaseUrl()}/${this.locale}`;
    }

    return this.getBaseUrl();
  }

  async goto(subPath: string) {
    const response = await this.page.goto(`${this.getBasePath()}${subPath}`);

    await this.loadFonts();

    return response;
  }

  async loadFonts() {
    // Inject Font Loader to the browser context and wait for fonts to be loaded
    await this.page.evaluate(
      ({fn, fonts}) => {
        const injectedLoadFonts = new Function(`return (${fn})`)();

        return injectedLoadFonts(fonts).then(() =>
          console.log('[Test Runner] all fonts loaded!'),
        );
      },
      {fn: loadFonts.toString(), fonts: FONT_FAMILY_NAMES},
    );
  }

  async getMetatag(name: string) {
    return this.page.locator(`meta[name="${name}"]`)?.getAttribute('content');
  }

  async getOpenGraph(name: string) {
    return this.page
      .locator(`meta[property="og:${name}"]`)
      ?.getAttribute('content');
  }

  get pageTitle() {
    return this.page.title();
  }

  get description() {
    return this.getMetatag('description');
  }

  get robots() {
    return this.getMetatag('robots');
  }
}
