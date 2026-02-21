import { QueryClient, useQuery } from '@tanstack/react-query';
import { filterIsDefined } from '../../util/filter-is-defined';
import type { DataDTOStateOfDictionaryOfStringAndPkmVariantDTO, PkmVariantDTO } from '../sdk/model';
import { getStorageGetMainPkmVariantsQueryKey, storageGetMainPkmVariants } from '../sdk/storage/storage.gen';

type PkmVariantIndexes = {
    byId: Record<PkmVariantDTO[ 'id' ], PkmVariantDTO>;
    byBox: Record<PkmVariantDTO[ 'boxId' ], Record<PkmVariantDTO[ 'boxSlot' ], PkmVariantDTO[]>>;
    byAttachedSave: Record<NonNullable<PkmVariantDTO[ 'attachedSaveId' ]>, Record<NonNullable<PkmVariantDTO[ 'attachedSavePkmIdBase' ]>, PkmVariantDTO>>;
    bySpecies: Record<PkmVariantDTO[ 'species' ], PkmVariantDTO[]>;
};

const buildIndexes = (data: PkmVariantDTO[]) => {
    // console.time('Build PkmVariant indexes');

    const indexes: PkmVariantIndexes = {
        byId: {},
        byBox: {},
        byAttachedSave: {},
        bySpecies: {},
    };

    data.forEach(pkmVariant => {
        indexes.byId[ pkmVariant.id ] = pkmVariant;

        indexes.byBox[ pkmVariant.boxId ] ??= {};
        indexes.byBox[ pkmVariant.boxId ]![ pkmVariant.boxSlot ] ??= [];
        indexes.byBox[ pkmVariant.boxId ]![ pkmVariant.boxSlot ]!.push(pkmVariant);

        if (pkmVariant.attachedSaveId && pkmVariant.attachedSavePkmIdBase) {
            indexes.byAttachedSave[ pkmVariant.attachedSaveId ] ??= {};
            indexes.byAttachedSave[ pkmVariant.attachedSaveId ]![ pkmVariant.attachedSavePkmIdBase ] = pkmVariant;
        }

        indexes.bySpecies[ pkmVariant.species ] ??= [];
        indexes.bySpecies[ pkmVariant.species ]!.push(pkmVariant);
    });

    // console.timeEnd('Build PkmVariant indexes');

    return indexes;
};

type QueryData = {
    data: PkmVariantIndexes;
    status: 200;
    headers: Headers;
};

/**
 * Fetch save pkms with caching & indexing.
 */
export const usePkmVariantIndex = () => {
    const queryKey = getStorageGetMainPkmVariantsQueryKey();

    return useQuery({
        queryKey,
        queryFn: async ({ signal }) => {
            const response = await storageGetMainPkmVariants({ signal });

            return {
                ...response,
                data: buildIndexes(response.data),
            } satisfies QueryData;
        },
    });
};

/**
 * Update react-query cache with given data, after formatting.
 */
export const updatePkmVariantCache = (client: QueryClient, pkmVariants: DataDTOStateOfDictionaryOfStringAndPkmVariantDTO) => {
    const cachedResponse: Partial<QueryData> = client.getQueryData(getStorageGetMainPkmVariantsQueryKey()) ?? {};

    const getRawData = (): PkmVariantDTO[] => {
        if (pkmVariants.all) {
            return Object.values(pkmVariants.data ?? {}).filter(filterIsDefined);
        }

        const cachedPkms = cachedResponse.data?.byId ?? {};

        return Object.values({
            ...cachedPkms,
            ...pkmVariants.data,
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

    client.setQueryData(getStorageGetMainPkmVariantsQueryKey(), buildData);
};
