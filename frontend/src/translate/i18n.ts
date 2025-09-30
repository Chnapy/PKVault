import i18n from "i18next";
import { initReactI18next, useTranslation } from "react-i18next";
import en from './locales/en.json';
import fr from './locales/fr.json';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const assertFrIsEn: typeof en = fr, assertEnIsFr: typeof fr = en;

export const defaultNS = "ns";
export const resources = {
    en: { ns: en },
    fr: { ns: fr },
} as const;

i18n.use(initReactI18next).init({
    lng: "en",
    fallbackLng: "en",
    ns: [ defaultNS ],
    defaultNS,
    resources,
    interpolation: {
        escapeValue: false // react already safes from xss
    }
});

export const useTranslate = () => {
    return useTranslation();
};
