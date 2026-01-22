import { QueryClient, useQuery } from '@tanstack/react-query';
import type { DataDTOStateOfDictionaryOfStringAndPkmSaveDTO, PkmSaveDTO } from '../sdk/model';
import { getStorageGetSavePkmsQueryKey, storageGetSavePkms } from '../sdk/storage/storage.gen';
import { filterIsDefined } from '../../util/filter-is-defined';

type PkmSaveIndexes = {
    byId: Record<PkmSaveDTO['id'], PkmSaveDTO>;
    byIdBase: Record<PkmSaveDTO['idBase'], PkmSaveDTO[]>;
    byBox: Record<PkmSaveDTO['boxId'], Record<PkmSaveDTO['boxSlot'], PkmSaveDTO>>;
    bySpecies: Record<PkmSaveDTO['species'], PkmSaveDTO[]>;
};

const buildIndexes = (saveId: number, data: PkmSaveDTO[]) => {
    console.time(`Build PkmSave indexes, saveId=${saveId}`);

    const indexes: PkmSaveIndexes = {
        byId: {},
        byIdBase: {},
        byBox: {},
        bySpecies: {},
    };

    data.forEach(pkmSave => {
        indexes.byId[pkmSave.id] = pkmSave;

        indexes.byIdBase[pkmSave.idBase] ??= [];
        indexes.byIdBase[pkmSave.idBase]!.push(pkmSave);

        indexes.byBox[pkmSave.boxId] ??= {};
        indexes.byBox[pkmSave.boxId]![pkmSave.boxSlot] = pkmSave;

        indexes.bySpecies[pkmSave.species] ??= [];
        indexes.bySpecies[pkmSave.species]!.push(pkmSave);
    });

    console.timeEnd(`Build PkmSave indexes, saveId=${saveId}`);

    return indexes;
};

type QueryData = {
    data: PkmSaveIndexes;
    status: 200;
    headers: Headers;
};

export const usePkmSaveIndex = (saveId: number) => {
    const queryKey = getStorageGetSavePkmsQueryKey(saveId);

    return useQuery({
        queryKey,
        queryFn: async ({ signal }) => {
            const response = await storageGetSavePkms(saveId, { signal });

            return {
                ...response,
                data: buildIndexes(saveId, response.data),
            } satisfies QueryData;
        },
        enabled: !!saveId,
    });
};

export const updatePkmSaveCache = (client: QueryClient, saveId: number, savePkms: DataDTOStateOfDictionaryOfStringAndPkmSaveDTO) => {
    const cachedResponse: Partial<QueryData> = client.getQueryData(getStorageGetSavePkmsQueryKey(saveId)) ?? {};

    const getRawData = (): PkmSaveDTO[] => {
        if (savePkms.all) {
            return Object.values(savePkms.data ?? {}).filter(filterIsDefined);
        }

        const cachedPkms = cachedResponse.data?.byId ?? {};

        return Object.values({
            ...cachedPkms,
            ...savePkms.data,
        }).filter(filterIsDefined);
    };

    const rawData = getRawData();

    const data = buildIndexes(saveId, rawData);

    const buildData: QueryData = {
        status: 200,
        headers: new Headers(),
        ...cachedResponse,
        data,
    };

    client.setQueryData(getStorageGetSavePkmsQueryKey(saveId), buildData);
};
