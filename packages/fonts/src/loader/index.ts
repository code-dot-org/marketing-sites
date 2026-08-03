import {InternationalFontLocale} from '@/constants';
import {getFontByLocale} from '@/resolver';

/**
 * Injects an empty div with the CSS module className that references the web font appropriate for the given locale.
 * @param locale
 */
export function injectFont(locale: InternationalFontLocale) {
  getFontByLocale(locale).then(fontClassName => {
    const fontMount = document.createElement('div');
    fontMount.className = fontClassName;
    document.head.appendChild(fontMount);
  });
}

export const FONT_AWESOME_ORIGIN = 'https://dsco.code.org';

export const FONT_AWESOME_STYLESHEETS = [
  `${FONT_AWESOME_ORIGIN}/assets/font-awesome-pro/1764885473/css/fontawesome.min.css`,
  `${FONT_AWESOME_ORIGIN}/assets/font-awesome-pro/1764885473/css/brands.min.css`,
  `${FONT_AWESOME_ORIGIN}/assets/font-awesome-pro/1764885473/css/solid.min.css`,
  `${FONT_AWESOME_ORIGIN}/assets/font-awesome-pro/1764885473/css/regular.min.css`,
  `${FONT_AWESOME_ORIGIN}/assets/font-awesome-pro/1764885473/css/v4-font-face.min.css`,
  `${FONT_AWESOME_ORIGIN}/assets/font-awesome-pro/1764885473/css/v4-shims.min.css`,
  `${FONT_AWESOME_ORIGIN}/assets/font-awesome-pro/1764885473/css/duotone.min.css`,
  `${FONT_AWESOME_ORIGIN}/assets/font-awesome-pro/1764885473/css/custom-icons.min.css`,
];

export function injectFontAwesome() {
  FONT_AWESOME_STYLESHEETS.forEach(stylesheetHref => {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = stylesheetHref;
    document.head.appendChild(link);
  });
}
