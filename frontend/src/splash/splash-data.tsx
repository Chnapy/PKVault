import { useBackupGetAll } from '../data/sdk/backup/backup.gen';
import { useSaveInfosGetAll } from '../data/sdk/save-infos/save-infos.gen';
import { useSettingsGet } from '../data/sdk/settings/settings.gen';
import { useStaticDataGet } from '../data/sdk/static-data/static-data.gen';
import { useStorageGetMainBoxes, useStorageGetMainPkms, useStorageGetMainPkmVersions } from '../data/sdk/storage/storage.gen';
import { useWarningsGetWarnings } from '../data/sdk/warnings/warnings.gen';
import { Splash } from '../ui/splash/splash';

export const SplashData: React.FC<React.PropsWithChildren> = ({ children }) => {
    const queries = [
        useStaticDataGet(),
        useSettingsGet(),
        useWarningsGetWarnings(),
        useBackupGetAll(),
        useSaveInfosGetAll(),
        useStorageGetMainBoxes(),
        useStorageGetMainPkms(),
        useStorageGetMainPkmVersions(),
    ];

    const isLoading = queries.some(query => query.isLoading || !query.data);

    if (!isLoading) {
        return children;
    }

    return <Splash />;
};
