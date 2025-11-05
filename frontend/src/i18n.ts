import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import en from './locales/en.json'
import ar from './locales/ar.json'
import fr from './locales/fr.json'
import tr from './locales/tr.json'
import fa from './locales/fa.json'
import ur from './locales/ur.json'
import hi from './locales/hi.json'
import es from './locales/es.json'
import de from './locales/de.json'
import pt from './locales/pt.json'
import ja from './locales/ja.json'
import zh from './locales/zh.json'
import it from './locales/it.json'
import sv from './locales/sv.json'

// Get saved language from localStorage or default to 'en'
const savedLanguage = localStorage.getItem('language') || 'en'

i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      ar: { translation: ar },
      fr: { translation: fr },
      tr: { translation: tr },
      fa: { translation: fa },
      ur: { translation: ur },
      hi: { translation: hi },
      es: { translation: es },
      de: { translation: de },
      pt: { translation: pt },
      ja: { translation: ja },
      zh: { translation: zh },
      it: { translation: it },
      sv: { translation: sv }
    },
    lng: savedLanguage,
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false // React already does escaping
    }
  })

export default i18n
