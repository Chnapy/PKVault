import { QueryClient, queryOptions, useQuery, type UseQueryOptions } from '@tanstack/react-query';
import { filterIsDefined } from '../../util/filter-is-defined';
import type { DataDTOStateOfDictionaryOfStringAndPkmSaveDTO, PkmSaveDTO } from '../sdk/model';
import { getStorageGetSavePkmsQueryKey, storageGetSavePkms } from '../sdk/storage/storage.gen';

export type PkmSaveIndexes = {
    byId: Record<PkmSaveDTO[ 'id' ], PkmSaveDTO>;
    byIdBase: Record<PkmSaveDTO[ 'idBase' ], PkmSaveDTO[]>;
    byBox: Record<PkmSaveDTO[ 'boxId' ], Record<PkmSaveDTO[ 'boxSlot' ], PkmSaveDTO>>;
    bySpecies: Record<PkmSaveDTO[ 'species' ], PkmSaveDTO[]>;
};

const buildIndexes = (saveId: number, data: PkmSaveDTO[]) => {
    // console.time(`Build PkmSave indexes, saveId=${saveId}`);

    const indexes: PkmSaveIndexes = {
        byId: {},
        byIdBase: {},
        byBox: {},
        bySpecies: {},
    };

    data.forEach(pkmSave => {
        indexes.byId[ pkmSave.id ] = pkmSave;

        indexes.byIdBase[ pkmSave.idBase ] ??= [];
        indexes.byIdBase[ pkmSave.idBase ]!.push(pkmSave);

        indexes.byBox[ pkmSave.boxId ] ??= {};
        indexes.byBox[ pkmSave.boxId ]![ pkmSave.boxSlot ] = pkmSave;

        indexes.bySpecies[ pkmSave.species ] ??= [];
        indexes.bySpecies[ pkmSave.species ]!.push(pkmSave);
    });

    // console.timeEnd(`Build PkmSave indexes, saveId=${saveId}`);

    return indexes;
};

export type PkmSaveIndexQueryData = {
    data: PkmSaveIndexes;
    status: 200;
    headers: Headers;
};

export const getPkmSaveIndexOptions = <D>(saveId: number, options?: Omit<UseQueryOptions<PkmSaveIndexQueryData, Error, D>, 'queryKey' | 'queryFn'>) => {
    const queryKey = getStorageGetSavePkmsQueryKey(saveId);

    
    return queryOptions({
        queryKey,
        queryFn: async ({ signal }) => {
            const response = await storageGetSavePkms(saveId, { signal });

            return {
                ...response,
                data: buildIndexes(saveId, response.data),
            } satisfies PkmSaveIndexQueryData;
        },
        enabled: !!saveId,
        ...options,
    });
};

/**
 * Fetch save pkms with caching & indexing.
 */
export const usePkmSaveIndex = (saveId: number, options?: Omit<UseQueryOptions<PkmSaveIndexQueryData, Error, PkmSaveIndexQueryData>, 'queryKey' | 'queryFn'>) => {
    return useQuery(getPkmSaveIndexOptions(saveId, options));
};

export const getCachedPkmSaveIndex = (client: QueryClient, saveId: number) => {
    return client.getQueryData<Partial<PkmSaveIndexQueryData>>(getStorageGetSavePkmsQueryKey(saveId));
};

/**
 * Update react-query cache with given data, after formatting.
 */
export const updatePkmSaveCache = (client: QueryClient, saveId: number, savePkms: DataDTOStateOfDictionaryOfStringAndPkmSaveDTO) => {
    const cachedResponse = getCachedPkmSaveIndex(client, saveId);
    if (!savePkms.all && !cachedResponse) {
        return;
    }

    const getRawData = (): PkmSaveDTO[] => {
        if (savePkms.all) {
            return Object.values(savePkms.data ?? {}).filter(filterIsDefined);
        }

        const cachedPkms = cachedResponse?.data?.byId ?? {};

        return Object.values({
            ...cachedPkms,
            ...savePkms.data,
        }).filter(filterIsDefined);
    };

    const rawData = getRawData();

    const data = buildIndexes(saveId, rawData);

    const buildData: PkmSaveIndexQueryData = {
        status: 200,
        headers: new Headers(),
        ...cachedResponse,
        data,
    };

    client.setQueryData(getStorageGetSavePkmsQueryKey(saveId), buildData);
};
