import React from 'react';
import { useSettingsEdit, useSettingsGet } from '../data/sdk/settings/settings.gen';
import { useTranslate } from '../translate/i18n';
import { Button } from '../ui/button/button';
import { Splash } from '../ui/splash/splash';
import { SplashData } from './splash-data';
import { css } from '@emotion/css';

/**
 * Display splash screen until whole data is loaded without error.
 * If first start, ask for app language.
 */
export const SplashMain: React.FC<React.PropsWithChildren> = ({ children }) => {
    const appStartTime = React.useRef(Date.now());

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

    if (settingsQuery.isLoading || !settingsMutable) {
        return <Splash />;
    }

    if (language) {
        return <SplashData appStartTime={appStartTime.current}>{children}</SplashData>;
    }

    return <Splash>
        <div
            className={css({
                textAlign: 'center',
            })}
        >Choose prefered language</div>
        <div
            className={css({
                marginTop: 8,
                display: 'flex',
                justifyContent: 'center',
                gap: 8,
            })}
        >
            <Button big onClick={() => settingsEditMutation.mutateAsync({
                data: {
                    ...settingsMutable,
                    language: 'en',
                }
            })}>English</Button>
            <Button big onClick={() => settingsEditMutation.mutateAsync({
                data: {
                    ...settingsMutable,
                    language: 'fr',
                }
            })}>Français</Button>
        </div>
    </Splash>;
};
