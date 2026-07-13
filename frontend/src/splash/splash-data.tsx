import React from 'react';
import { usePkmVariantIndex } from '../data/hooks/use-pkm-variant-index';
import { useBackupGetAll } from '../data/sdk/backup/backup.gen';
import { useDexGetAll } from '../data/sdk/dex/dex.gen';
import { useSaveInfosGetAll } from '../data/sdk/save-infos/save-infos.gen';
import { useSettingsGet } from '../data/sdk/settings/settings.gen';
import { useStaticDataGet } from '../data/sdk/static-data/static-data.gen';
import { useStorageGetBoxes, useStorageGetMainBanks } from '../data/sdk/storage/storage.gen';
import { Fallback } from '../error/fallback';
import { useDesktopMessage } from '../settings/globs-input/hooks/use-desktop-message';
import { UISplash } from '../ui/splash/ui-splash';

/**
 * Display splash screen until whole data is loaded without error.
 */
export const SplashData: React.FC<React.PropsWithChildren<{ appStartTime: number }>> = ({ appStartTime, children }) => {
    const queries = [
        useStaticDataGet(),
        useSettingsGet(),
        useBackupGetAll(),
        useSaveInfosGetAll(),
        useStorageGetMainBanks(),
        useStorageGetBoxes(),
        usePkmVariantIndex(),
        useDexGetAll(),
    ] as const;

    const desktopMessage = useDesktopMessage();

    const isLoading = queries.some(query => query.isPending && query.isEnabled);

    const error = queries.find(query => query.isError)?.error;

    React.useEffect(() => {
        if (isLoading) {
            return;
        }

        const appStartDuration = Date.now() - appStartTime;
        console.log('Setup data load duration:', appStartDuration);

        desktopMessage?.startLoadingFinished(!!error);

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [ desktopMessage, isLoading ]);

    if (!isLoading && !error) {
        return children;
    }

    return <UISplash>{error && <Fallback.default error={error} resetErrorBoundary={() => null} />}</UISplash>;
};
