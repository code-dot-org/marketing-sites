// The following are LocalizeJS language codes and map 1:1. They are replicated here to ensure compatability in SSR.
export const SUPPORTED_LOCALES = [
  {value: 'en-US', text: 'English', isRTL: false},
  {value: 'es', text: 'Español', isRTL: false},
  {value: 'ar', text: 'العربية', isRTL: true},
  {value: 'de', text: 'Deutsch', isRTL: false},
  {value: 'fa', text: 'فارسی', isRTL: true},
  {value: 'fr', text: 'Français', isRTL: false},
  {value: 'hi', text: 'हिन्दी', isRTL: false},
  {value: 'id', text: 'Bahasa Indonesia', isRTL: false},
  {value: 'it', text: 'Italiano', isRTL: false},
  {value: 'ja', text: '日本語', isRTL: false},
  {value: 'ko', text: '한국어', isRTL: false},
  {value: 'mr', text: 'मराठी', isRTL: false},
  {value: 'pl', text: 'Polski', isRTL: false},
  {value: 'pt-BR', text: 'Português (Brasil)', isRTL: false},
  {value: 'sk', text: 'Slovenčina', isRTL: false},
  {value: 'th', text: 'ภาษาไทย', isRTL: false},
  {value: 'tr', text: 'Türkçe', isRTL: false},
  {value: 'uk', text: 'Українська', isRTL: false},
  {value: 'vi', text: 'Tiếng Việt', isRTL: false},
  {value: 'zh-TW', text: '繁體字', isRTL: false},
];

export const SUPPORTED_LOCALE_CODES = SUPPORTED_LOCALES.map(
  locale => locale.value,
);
export const SUPPORTED_LOCALES_SET = new Set(SUPPORTED_LOCALE_CODES);

export const SUPPORTED_LOCALES_MAP = new Map(
  SUPPORTED_LOCALES.map(locale => [locale.value, locale]),
);
