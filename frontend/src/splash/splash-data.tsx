import { useBackupGetAll } from '../data/sdk/backup/backup.gen';
import { useSaveInfosGetAll } from '../data/sdk/save-infos/save-infos.gen';
import { useSettingsGet } from '../data/sdk/settings/settings.gen';
import { useStorageGetMainBoxes, useStorageGetMainPkms, useStorageGetMainPkmVersions } from '../data/sdk/storage/storage.gen';
import { useWarningsGetWarnings } from '../data/sdk/warnings/warnings.gen';
import { useStaticDataPersisted } from '../hooks/use-static-data';
import { Splash } from '../ui/splash/splash';

export const SplashData: React.FC<React.PropsWithChildren> = ({ children }) => {
    const queries = [
        useStaticDataPersisted(),
        useSettingsGet(),
        useWarningsGetWarnings(),
        useBackupGetAll(),
        useSaveInfosGetAll(),
        useStorageGetMainBoxes(),
        useStorageGetMainPkms(),
        useStorageGetMainPkmVersions(),
    ] as const;

    const isLoading = queries.some(query => query.isLoading || !query.data);

    if (!isLoading) {
        return children;
    }

    return <Splash />;
};
