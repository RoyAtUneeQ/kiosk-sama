import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Import translation files
import en from './locales/en.json';
import es from './locales/es.json';
import ja from './locales/ja.json';
import ar from './locales/ar.json';
import pt from './locales/pt.json';
import de from './locales/de.json';
import fr from './locales/fr.json';

const resources = {
  en: { translation: en },
  es: { translation: es },
  ja: { translation: ja },
  ar: { translation: ar },
  pt: { translation: pt },
  de: { translation: de },
  fr: { translation: fr },
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    debug: import.meta.env.DEV,
    
    interpolation: {
      escapeValue: false, // React already escapes values
    },
    
    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage'],
    },
  });

export default i18n;

// Export hooks for easy access
export { useTranslation } from '@/hooks';
export { useLanguage, LanguageProvider } from './LanguageProvider'; 