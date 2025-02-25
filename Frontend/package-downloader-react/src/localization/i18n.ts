import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Импортируйте JSON-файлы напрямую
import enTranslation from './locales/en/translation.json';
import ruTranslation from './locales/ru/translation.json';

i18n
    .use(LanguageDetector) // Автоматическое определение языка
    .use(initReactI18next) // Инициализация с React
    .init({
        resources: {
            en: {
                translation: enTranslation,
            },
            ru: {
                translation: ruTranslation,
            },
        },
        fallbackLng: 'en', // Язык по умолчанию
        interpolation: {
            escapeValue: false, // React уже экранирует значения
        },
    });

export default i18n;