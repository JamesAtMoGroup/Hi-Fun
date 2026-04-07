import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import * as Localization from 'expo-localization';

import en from './locales/en.json';
import zhTW from './locales/zh-TW.json';

const resources = {
  en: { translation: en },
  'zh-TW': { translation: zhTW },
};

// Detect device locale, fallback to 'en'
const deviceLocale = Localization.getLocales()?.[0]?.languageTag ?? 'en';

// Map locale to supported language
function getLanguage(locale: string): string {
  if (locale.startsWith('zh')) {
    return 'zh-TW';
  }
  return 'en';
}

i18n.use(initReactI18next).init({
  resources,
  lng: getLanguage(deviceLocale),
  fallbackLng: 'en',
  interpolation: {
    escapeValue: false,
  },
  compatibilityJSON: 'v3',
});

export default i18n;
