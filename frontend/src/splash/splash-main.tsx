import React from 'react';
import { useSettingsEdit, useSettingsGet } from '../data/sdk/settings/settings.gen';
import { languages, useTranslate } from '../translate/i18n';
import { UIButton } from '../ui/form/button/ui-button';
import { UISplash } from '../ui/splash/ui-splash';
import { UISplashMain } from '../ui/splash/ui-splash-main';
import { SplashData } from './splash-data';

/**
 * Display splash screen until whole data is loaded without error.
 * If first start, ask for app language.
 */
export const SplashMain: React.FC<React.PropsWithChildren> = ({ children }) => {
    const [ appStartTime ] = React.useState(() => Date.now());

    const settingsQuery = useSettingsGet();
    const settingsEditMutation = useSettingsEdit();

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
        return <UISplash />;
    }

    if (language) {
        return <SplashData appStartTime={appStartTime}>{children}</SplashData>;
    }

    return <UISplash>
        <UISplashMain>
            {Object.entries(languages).map(([ language, name ]) => <UIButton
                key={language}
                name={language}
                controlLabel={name}
                onClick={() => settingsEditMutation.mutateAsync({
                    data: {
                        ...settingsMutable,
                        language,
                    }
                })}
            >{name}</UIButton>)}
        </UISplashMain>
    </UISplash>;
};
