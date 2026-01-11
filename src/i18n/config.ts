import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Import translation files for all 12 languages
import en_common from '../locales/en/common.json';
import es_common from '../locales/es/common.json';
import fr_common from '../locales/fr/common.json';
import de_common from '../locales/de/common.json';
import it_common from '../locales/it/common.json';
import ja_common from '../locales/ja/common.json';
import zh_common from '../locales/zh/common.json';
import ru_common from '../locales/ru/common.json';
import pt_common from '../locales/pt/common.json';
import uk_common from '../locales/uk/common.json';
import pl_common from '../locales/pl/common.json';
import cs_common from '../locales/cs/common.json';

i18n
  .use(LanguageDetector) // Detect language from browser/localStorage
  .use(initReactI18next) // Pass i18n to React
  .init({
    resources: {
      en: { common: en_common },
      es: { common: es_common },
      fr: { common: fr_common },
      de: { common: de_common },
      it: { common: it_common },
      ja: { common: ja_common },
      zh: { common: zh_common },
      ru: { common: ru_common },
      pt: { common: pt_common },
      uk: { common: uk_common },
      pl: { common: pl_common },
      cs: { common: cs_common },
    },
    fallbackLng: 'en', // Fallback if translation missing
    defaultNS: 'common', // Default namespace
    interpolation: {
      escapeValue: false, // React already escapes
    },
    detection: {
      // Detection order
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
      lookupLocalStorage: 'penko_ui_language',
    },
    // Enable debug mode for development
    debug: false,
  });

export default i18n;
