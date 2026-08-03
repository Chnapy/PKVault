import i18n from "i18next";
import { initReactI18next, useTranslation } from "react-i18next";
import en from './locales/en.json' with { type: "json" };
import fr from './locales/fr.json' with { type: "json" };
import de from './locales/de.json' with { type: "json" };
import ptBr from './locales/pt-br.json' with { type: "json" };

const _assertFrIsEn: typeof en = fr, _assertEnIsFr: typeof fr = en;
const _assertDeIsEn: typeof en = de, _assertEnIsDe: typeof de = en;
const _assertPtBrIsEn: typeof en = ptBr, _assertEnIsPtBr: typeof ptBr = en;

export const defaultNS = "ns";
export const resources = {
    en: { ns: en },
    fr: { ns: fr },
    de: { ns: de },
    'pt-br': { ns: ptBr },
} as const;

export const languages: Record<keyof typeof resources, string> = {
    en: 'English',
    fr: 'Français',
    de: 'Deutsch',
    'pt-br': 'Português brasileiro',
};

i18n.use(initReactI18next).init({
    lng: "en",
    fallbackLng: "en",
    ns: [ defaultNS ],
    defaultNS,
    resources,
    lowerCaseLng: true,
    interpolation: {
        escapeValue: false // react already safes from xss
    }
});

export const useTranslate = () => {
    return useTranslation();
};
