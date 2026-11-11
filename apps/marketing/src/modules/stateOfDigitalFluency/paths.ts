/** The report's base path. The only place it is defined. */
export const REPORT_BASE_PATH = '/state-of-digital-fluency';

/** In-page anchors on the overview. */
export const MAP_ANCHOR = 'map';
export const RANKINGS_ANCHOR = 'rankings';

const withLocale = (path: string, locale?: string) =>
  locale ? `/${locale}${path}` : path;

export const overviewPath = (locale?: string) =>
  withLocale(REPORT_BASE_PATH, locale);

export const statePath = (slug: string, locale?: string) =>
  withLocale(`${REPORT_BASE_PATH}/${slug}`, locale);

export const printPath = (slug: string, locale?: string) =>
  withLocale(`${REPORT_BASE_PATH}/${slug}/report`, locale);

/** The printable national report. */
export const nationalPrintPath = (locale?: string) =>
  withLocale(`${REPORT_BASE_PATH}/report`, locale);

export const methodologyPath = (locale?: string) =>
  withLocale(`${REPORT_BASE_PATH}/methodology`, locale);
