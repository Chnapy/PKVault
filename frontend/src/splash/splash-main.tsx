import React from 'react';
import { useSettingsGet } from '../data/sdk/settings/settings.gen';
import { useTranslate } from '../translate/i18n';
import { UISplash } from '../ui/splash/ui-splash';
import { SplashData } from './splash-data';

/**
 * Display splash screen until whole data is loaded without error.
 * If first start, ask for app language.
 */
export const SplashMain: React.FC<React.PropsWithChildren> = ({ children }) => {
    const [ appStartTime ] = React.useState(() => Date.now());

    const settingsQuery = useSettingsGet();

    const settingsMutable = settingsQuery.data?.data.settingsMutable;
    const language = settingsMutable?.language;

    const { i18n } = useTranslate();

    const shouldUpdateLanguage = !!language && language !== i18n.language;

    React.useEffect(() => {
        if (shouldUpdateLanguage) {
            i18n.changeLanguage(language);
        }
    }, [ shouldUpdateLanguage, i18n, language ]);

    if ((settingsQuery.isPending && settingsQuery.isEnabled) || !settingsMutable) {
        return <UISplash loading />;
    }

    return <SplashData appStartTime={appStartTime}>{children}</SplashData>;
};
