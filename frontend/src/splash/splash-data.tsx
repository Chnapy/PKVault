import React from 'react';
import { useBackupGetAll } from '../data/sdk/backup/backup.gen';
import { useSaveInfosGetAll } from '../data/sdk/save-infos/save-infos.gen';
import { useSettingsGet } from '../data/sdk/settings/settings.gen';
import { useStaticDataGet } from '../data/sdk/static-data/static-data.gen';
import { useStorageGetMainBanks, useStorageGetMainBoxes, useStorageGetMainPkms, useStorageGetMainPkmVersions } from '../data/sdk/storage/storage.gen';
import { useWarningsGetWarnings } from '../data/sdk/warnings/warnings.gen';
import { Fallback } from '../error/fallback';
import { useDesktopMessage } from '../settings/save-globs/hooks/use-desktop-message';
import { Splash } from '../ui/splash/splash';

export const SplashData: React.FC<React.PropsWithChildren<{ appStartTime: number }>> = ({ appStartTime, children }) => {
    const queries = [
        useStaticDataGet(),
        useSettingsGet(),
        useWarningsGetWarnings(),
        useBackupGetAll(),
        useSaveInfosGetAll(),
        useStorageGetMainBanks(),
        useStorageGetMainBoxes(),
        useStorageGetMainPkms(),
        useStorageGetMainPkmVersions(),
    ] as const;

    const desktopMessage = useDesktopMessage();

    const isLoading = queries.some(query => query.isLoading);

    const errorQuery = queries.find(query => query.isError || query.data?.status !== 200);
    const errorStack = errorQuery?.data?.headers.get('error-stack');
    const error = errorQuery?.error ?? (errorStack && JSON.parse(errorStack));

    React.useEffect(() => {
        if (isLoading) {
            return;
        }

        const appStartDuration = Date.now() - appStartTime;
        console.log('Setup data load duration:', appStartDuration);

        desktopMessage?.startLoadingFinished(!!errorQuery);

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [ desktopMessage, isLoading ]);

    if (!isLoading && !errorQuery) {
        return children;
    }

    return <Splash>
        {error && <Fallback.default error={error} resetErrorBoundary={() => null} />}
    </Splash>;
};
