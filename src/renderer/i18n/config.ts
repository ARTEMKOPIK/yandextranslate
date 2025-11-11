import i18next from 'i18next';
import { initReactI18next } from 'react-i18next';
import ruTranslations from './locales/ru.json';

const resources = {
  ru: {
    translation: ruTranslations,
  },
};

i18next.use(initReactI18next).init({
  resources,
  lng: 'ru',
  fallbackLng: 'ru',
  interpolation: {
    escapeValue: false,
  },
  ns: ['translation'],
  defaultNS: 'translation',
});

export default i18next;
