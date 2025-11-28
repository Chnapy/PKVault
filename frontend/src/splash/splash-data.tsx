import { useBackupGetAll } from '../data/sdk/backup/backup.gen';
import { useSaveInfosGetAll } from '../data/sdk/save-infos/save-infos.gen';
import { useSettingsGet } from '../data/sdk/settings/settings.gen';
import { useStaticDataGet } from '../data/sdk/static-data/static-data.gen';
import { useStorageGetMainBoxes, useStorageGetMainPkms, useStorageGetMainPkmVersions } from '../data/sdk/storage/storage.gen';
import { useWarningsGetWarnings } from '../data/sdk/warnings/warnings.gen';
import { Fallback } from '../error/fallback';
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
    ] as const;

    const isLoading = queries.some(query => query.isLoading);

    const errorQuery = queries.find(query => query.isError || query.data?.status !== 200);
    const errorStack = errorQuery?.data?.headers.get('error-stack');
    const error = errorQuery?.error ?? (errorStack && JSON.parse(errorStack));

    if (!isLoading && !errorQuery) {
        return children;
    }

    return <Splash>
        {error && <Fallback.default error={error} resetErrorBoundary={() => null} />}
    </Splash>;
};
