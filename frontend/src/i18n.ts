import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import HttpApi from 'i18next-http-backend';

i18n
    .use(HttpApi)
    .use(LanguageDetector)
    .use(initReactI18next)

    .init({
        fallbackLng: 'en',
        supportedLngs: ['en', 'de-DE', 'es', 'fr'],

        ns: ['common', 'forms', 'ui'],
        defaultNS: 'common',

        backend: {
            loadPath: '/locales/{{lng}}/{{ns}}.json',
        },

        detection: {
            order: ['querystring', 'localStorage', 'cookie', 'navigator'],
            caches: ['localStorage', 'cookie'],
        },

        interpolation: {
            escapeValue: false,
        },

        react: {
            useSuspense: false,
        },
    });

export default i18n;