import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { getLocales } from 'expo-localization';
import en from './locales/en.json';
import zhTW from './locales/zh-TW.json';

const resources = {
  en: { translation: en },
  'zh-TW': { translation: zhTW },
};

const deviceLanguage = getLocales()[0]?.languageTag ?? 'en';

// Determine initial language: prefer zh-TW if device is any Chinese variant
const getInitialLanguage = (): string => {
  if (deviceLanguage.startsWith('zh')) {
    return 'zh-TW';
  }
  if (Object.keys(resources).includes(deviceLanguage)) {
    return deviceLanguage;
  }
  return 'en';
};

i18n.use(initReactI18next).init({
  resources,
  lng: getInitialLanguage(),
  fallbackLng: 'en',
  interpolation: {
    escapeValue: false,
  },
  compatibilityJSON: 'v3',
});

export default i18n;
