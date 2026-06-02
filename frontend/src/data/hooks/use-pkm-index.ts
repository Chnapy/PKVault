import type { QueryClient } from '@tanstack/react-query';
import React from 'react';
import { filterIsDefined } from '../../util/filter-is-defined';
import { getCachedPkmSaveIndex, usePkmSaveIndex, type PkmSaveIndexes } from './use-pkm-save-index';
import { getCachedPkmVariantIndex, usePkmVariantIndex, type PkmVariantIndexes } from './use-pkm-variant-index';

const createMixedIndex = (
    pkmMainIndex: PkmVariantIndexes | undefined, 
    pkmSaveIndex: PkmSaveIndexes | undefined, 
    saveId: number | null
) => {
    const data = {
        getById: (id: string) => {
            if (saveId)
                return pkmSaveIndex?.byId[ id ];
            return pkmMainIndex?.byId[ id ];
        },
        getByBoxSlot: (box: number, slot: number) => {
            if (saveId)
                return [ pkmSaveIndex?.byBox[ box ]?.[ slot ] ].filter(filterIsDefined);
            return pkmMainIndex?.byBox[ box ]?.[ slot ] ?? [];
        },
        getBySpecies: (species: number) => {
            if (saveId)
                return pkmSaveIndex?.bySpecies[ species ] ?? [];
            return pkmMainIndex?.bySpecies[ species ] ?? [];
        },
        getBoxLength: (box: number) => {
            if (saveId)
                return Object.values(pkmSaveIndex?.byBox[ box ] ?? {}).length;
            return Object.values(pkmMainIndex?.byBox[ box ] ?? {}).length;
        },
        getTotalLength: () => {
            if (saveId)
                return Object.values(pkmSaveIndex?.byId ?? {}).length;
            return Object.keys(pkmMainIndex?.byBox ?? {})
                .reduce((acc, box) => acc + data.getBoxLength(Number(box)), 0);
        },
    };
    return data;
};

export const getCachedPkmIndex = (client: QueryClient, saveId: number | null) => {
    const pkmMainIndex = saveId === null
        ? getCachedPkmVariantIndex(client)
        : undefined;
    const pkmSaveIndex = saveId !== null
        ? getCachedPkmSaveIndex(client, saveId)
        : undefined;

    const cachedIndex = saveId ? pkmSaveIndex : pkmMainIndex;

    return cachedIndex && {
        ...cachedIndex,
        data: createMixedIndex(pkmMainIndex?.data, pkmSaveIndex?.data, saveId),
    };
};

export const usePkmIndex = (saveId: number | null) => {
    const pkmMainIndex = usePkmVariantIndex({
        enabled: saveId === null,
    });
    const pkmSaveIndex = usePkmSaveIndex(saveId ?? 0, {
        enabled: saveId !== null,
    });

    const query = saveId ? pkmSaveIndex : pkmMainIndex;

    const data = React.useMemo(() => 
        createMixedIndex(pkmMainIndex.data?.data, pkmSaveIndex.data?.data, saveId),
        [pkmMainIndex.data?.data, pkmSaveIndex.data?.data, saveId]
    );

    return {
        ...query,
        data: query.data && {
            ...query.data,
            data,
        },
    };
};

// usePkmIndex().data?.data.
