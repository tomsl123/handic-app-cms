import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import HttpApi from 'i18next-http-backend';

i18n
    // enable backend loading
    .use(HttpApi)

    // detect user language
    .use(LanguageDetector)

    // pass i18n instance to react-i18next
    .use(initReactI18next)

    .init({
        fallbackLng: 'en',
        supportedLngs: ['en', 'de'],

        // namespaces let you group translations by feature
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