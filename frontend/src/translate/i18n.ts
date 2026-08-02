import i18n from "i18next";
import { initReactI18next, useTranslation } from "react-i18next";
import en from './locales/en.json';
import fr from './locales/fr.json';
import de from './locales/de.json';
import pt-br from './locales/pt-br.json'; // 1. Importe o novo arquivo br.json

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const assertFrIsEn: typeof en = fr, assertEnIsFr: typeof fr = en;
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const assertDeIsEn: typeof en = de, assertEnIsDe: typeof de = en;
// 2. Adicione a verificação de tipos para o PT-BR para garantir que nenhuma chave fique de fora
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const assertBrIsEn: typeof en = br, assertEnIsBr: typeof br = en; 

export const defaultNS = "ns";
export const resources = {
    en: { ns: en },
    fr: { ns: fr },
    de: { ns: de },
    pt-br: { ns: pt-br }, // 3. Adicione o idioma "br" nos resources
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