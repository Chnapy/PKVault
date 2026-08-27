import React from 'react';
import { GameVersion } from '../data/sdk/model';
import { useSettingsGet } from '../data/sdk/settings/settings.gen';
import { getGameInfos } from '../pokedex/details/util/get-game-infos';
import { useTranslate } from '../translate/i18n';
import { iconResources } from '../ui/icon/resources/icon-resources';
import { ImgPrefetch } from '../ui/icon/resources/img-prefetch';
import { UISplash } from '../ui/splash/ui-splash';
import { SplashData } from './splash-data';

const versionsImgs = [ ...new Set(Object.values(GameVersion).map(version => getGameInfos(version).img)) ].filter(Boolean);

const imgsToPrefetch = [
    ...Object.values(iconResources).flatMap(v => Object.values(v)),
    ...versionsImgs,
];

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

    const prefetchNode = <div aria-description='prefetch' style={{ width: 0, height: 0 }}>
        {imgsToPrefetch.map(url => <ImgPrefetch
            key={url}
            src={url}
        />)}
    </div>;

    if ((settingsQuery.isPending && settingsQuery.isEnabled) || !settingsMutable) {
        return <UISplash loading>
            {prefetchNode}
        </UISplash>;
    }

    return <SplashData appStartTime={appStartTime}>
        {children}

        {prefetchNode}
    </SplashData>;
};
