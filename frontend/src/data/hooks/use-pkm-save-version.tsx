import { useStorageGetMainPkms, useStorageGetMainPkmVersions } from '../sdk/storage/storage.gen';

export const usePkmSaveVersion = () => {
    const pkmsQuery = useStorageGetMainPkms();
    const pkmVersionsQuery = useStorageGetMainPkmVersions();

    const mainPkmsAttached = pkmsQuery.data?.data.filter(pkm => !!pkm.saveId) ?? [];

    return (idBase: string, saveId: number) => {
        const pkmVersion = pkmVersionsQuery.data?.data.find(pkm => pkm.id === idBase);
        if (pkmVersion != null) {
            const mainPkm = mainPkmsAttached.find(pkm => pkm.id === pkmVersion.pkmId);

            if (mainPkm?.saveId == saveId) {
                return pkmVersion;
            }
        }
    };
};
