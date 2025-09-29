import { resources, defaultNS } from "./i18n";

declare module "i18next" {
    interface CustomTypeOptions {
        defaultNS: typeof defaultNS;
        resources: typeof resources[ "en" ];
        keySeparator: false;    // workaround required, issue: https://github.com/i18next/react-i18next/issues/1811#issuecomment-2465809397
    }
}
