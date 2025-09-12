import type React from 'react';
import { useBackupGetAll } from '../../data/sdk/backup/backup.gen';
import { useSaveInfosGetAll } from '../../data/sdk/save-infos/save-infos.gen';
import { useStaticDataGet } from '../../data/sdk/static-data/static-data.gen';
import { useStorageGetMainBoxes, useStorageGetMainPkms, useStorageGetMainPkmVersions } from '../../data/sdk/storage/storage.gen';
import { useWarningsGetWarnings } from '../../data/sdk/warnings/warnings.gen';
import { theme } from '../theme';
import { useSettingsGet } from '../../data/sdk/settings/settings.gen';

export const Splash: React.FC<React.PropsWithChildren> = ({ children }) => {
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

    return <div
        style={{
            backgroundColor: theme.bg.contrast,
            height: '100vh',
            display: 'flex',
            justifyContent: 'center',
        }}
    >
        <img
            src='/logo.svg'
            style={{
                width: 128
            }}
        />
    </div>;
};
