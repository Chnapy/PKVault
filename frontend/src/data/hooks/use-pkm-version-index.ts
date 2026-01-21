import { QueryClient, useQuery } from '@tanstack/react-query';
import { filterIsDefined } from '../../util/filter-is-defined';
import type { DataDTOStateOfDictionaryOfStringAndPkmVersionDTO, PkmVersionDTO } from '../sdk/model';
import { getStorageGetMainPkmVersionsQueryKey, storageGetMainPkmVersions } from '../sdk/storage/storage.gen';

type PkmVersionIndexes = {
    byId: Record<PkmVersionDTO['id'], PkmVersionDTO>;
    byBox: Record<PkmVersionDTO['boxId'], Record<PkmVersionDTO['boxSlot'], PkmVersionDTO[]>>;
    byAttachedSave: Record<NonNullable<PkmVersionDTO['attachedSaveId']>, Record<NonNullable<PkmVersionDTO['attachedSavePkmIdBase']>, PkmVersionDTO>>;
    bySpecies: Record<PkmVersionDTO['species'], PkmVersionDTO[]>;
};

const buildIndexes = (data: PkmVersionDTO[]) => {
    console.time('Build PkmVersion indexes');

    const indexes: PkmVersionIndexes = {
        byId: {},
        byBox: {},
        byAttachedSave: {},
        bySpecies: {},
    };

    data.forEach(version => {
        indexes.byId[version.id] = version;

        indexes.byBox[version.boxId] ??= {};
        indexes.byBox[version.boxId]![version.boxSlot] ??= [];
        indexes.byBox[version.boxId]![version.boxSlot]!.push(version);

        if (version.attachedSaveId && version.attachedSavePkmIdBase) {
            indexes.byAttachedSave[version.attachedSaveId] ??= {};
            indexes.byAttachedSave[version.attachedSaveId]![version.attachedSavePkmIdBase] = version;
        }

        indexes.bySpecies[version.species] ??= [];
        indexes.bySpecies[version.species]!.push(version);
    });

    console.timeEnd('Build PkmVersion indexes');

    return indexes;
};

type QueryData = {
    data: PkmVersionIndexes;
    status: 200;
    headers: Headers;
};

export const usePkmVersionIndex = () => {
    const queryKey = getStorageGetMainPkmVersionsQueryKey();

    return useQuery({
        queryKey,
        queryFn: async ({ signal }) => {
            const response = await storageGetMainPkmVersions({ signal });

            return {
                ...response,
                data: buildIndexes(response.data),
            } satisfies QueryData;
        },
    });
};

export const updatePkmVersionCache = (client: QueryClient, pkmVersions: DataDTOStateOfDictionaryOfStringAndPkmVersionDTO) => {
    const cachedResponse: Partial<QueryData> = client.getQueryData(getStorageGetMainPkmVersionsQueryKey()) ?? {};

    const getRawData = (): PkmVersionDTO[] => {
        if (pkmVersions.all) {
            return Object.values(pkmVersions.data ?? {}).filter(filterIsDefined);
        }

        const cachedPkms = cachedResponse.data?.byId ?? {};

        return Object.values({
            ...cachedPkms,
            ...pkmVersions.data,
        }).filter(filterIsDefined);
    };

    const rawData = getRawData();

    const data = buildIndexes(rawData);

    const buildData: QueryData = {
        status: 200,
        headers: new Headers(),
        ...cachedResponse,
        data,
    };

    client.setQueryData(getStorageGetMainPkmVersionsQueryKey(), buildData);
};
