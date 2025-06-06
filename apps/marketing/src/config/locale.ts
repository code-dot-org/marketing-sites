// The following are LocalizeJS language codes and map 1:1. They are replicated here to ensure compatability in SSR.
export const SUPPORTED_LOCALES = [
  {value: 'en-US', text: 'English'},
  {value: 'es', text: 'Español'},
  {value: 'ar', text: 'العربية'},
  {value: 'de', text: 'Deutsch'},
  {value: 'fa', text: 'فارسی'},
  {value: 'fr', text: 'Français'},
  {value: 'hi', text: 'हिन्दी'},
  {value: 'id', text: 'Bahasa Indonesia'},
  {value: 'it', text: 'Italiano'},
  {value: 'ja', text: '日本語'},
  {value: 'ko', text: '한국어'},
  {value: 'mr', text: 'मराठी'},
  {value: 'pl', text: 'Polski'},
  {value: 'pt-BR', text: 'Português (Brasil)'},
  {value: 'sk', text: 'Slovenčina'},
  {value: 'th', text: 'ภาษาไทย'},
  {value: 'tr', text: 'Türkçe'},
  {value: 'uk', text: 'Українська'},
  {value: 'vi', text: 'Tiếng Việt'},
  {value: 'zh-TW', text: '繁體字'},
];

export const SUPPORTED_LOCALE_CODES = SUPPORTED_LOCALES.map(
  locale => locale.value,
);
export const SUPPORTED_LOCALES_SET = new Set(SUPPORTED_LOCALE_CODES);
