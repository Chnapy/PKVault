import { useStorageGetMainPkmVersions } from '../sdk/storage/storage.gen';

export const usePkmSaveVersion = () => {
    const pkmVersionsQuery = useStorageGetMainPkmVersions();

    return (idBase: string, saveId: number) => pkmVersionsQuery.data?.data.find((pkm) => pkm.attachedSaveId === saveId && pkm.attachedSavePkmIdBase === idBase);
};
