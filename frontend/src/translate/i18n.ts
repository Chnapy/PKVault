import i18n from "i18next";
import { initReactI18next, useTranslation } from "react-i18next";
import en from './locales/en.json' with { type: "json" };
import fr from './locales/fr.json' with { type: "json" };
import de from './locales/de.json' with { type: "json" };
import es from './locales/es.json' with { type: "json" };
import esLa from './locales/es-419.json' with { type: "json" };
import ptBr from './locales/pt-br.json' with { type: "json" };
import zhHant from './locales/zh-hant.json' with { type: "json" };
import it from './locales/it.json' with { type: "json" };

const _assertFrIsEn: typeof en = fr, _assertEnIsFr: typeof fr = en;
const _assertDeIsEn: typeof en = de, _assertEnIsDe: typeof de = en;
const _assertEsIsEn: typeof en = es, _assertEnIsEs: typeof es = en;
const _assertPtBrIsEn: typeof en = ptBr, _assertEnIsPtBr: typeof ptBr = en;
const _assertZhHantIsEn: typeof en = zhHant, _assertEnIsZhHant: typeof zhHant = en;
const _assertItIsEn: typeof en = it, _assertEnIsIt: typeof it = en;

export const defaultNS = "ns";
export const resources = {
    en: { ns: en },
    de: { ns: de },
    es: { ns: es },
    'es-419': { ns: esLa },
    fr: { ns: fr },
    it: { ns: it },
    'pt-br': { ns: ptBr },
    'zh-hant': { ns: zhHant },
} as const;

export const languages: Record<keyof typeof resources, string> = {
    en: 'English',
    de: 'Deutsch',
    es: 'Español',
    'es-419': 'Español (LATAM)',
    fr: 'Français',
    it: 'Italiano',
    'pt-br': 'Português brasileiro',
    'zh-hant': '繁體中文',
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
