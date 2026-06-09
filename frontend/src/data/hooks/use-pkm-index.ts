import { useQuery, type QueryClient, type UseQueryOptions } from '@tanstack/react-query';
import { filterIsDefined } from '../../util/filter-is-defined';
import { getCachedPkmSaveIndex, getPkmSaveIndexOptions, type PkmSaveIndexes, type PkmSaveIndexQueryData } from './use-pkm-save-index';
import { getCachedPkmVariantIndex, getPkmVariantIndexOptions, type PkmVariantIndexes, type PkmVariantIndexQueryData } from './use-pkm-variant-index';
import React from 'react';

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

export const usePkmIndex = <D = PkmVariantIndexQueryData | PkmSaveIndexQueryData>(
    saveId: number | null,
    selectFn?: (data: PkmVariantIndexQueryData | PkmSaveIndexQueryData) => D,
    options?: Omit<UseQueryOptions<PkmVariantIndexQueryData | PkmSaveIndexQueryData, Error, D>, 'queryKey' | 'queryFn'>
) => {
    const query = useQuery({
        select: selectFn,
        ...saveId === null
            ? getPkmVariantIndexOptions(options as never)
            : getPkmSaveIndexOptions(saveId, options as never),
    } as UseQueryOptions<PkmVariantIndexQueryData | PkmSaveIndexQueryData, Error, D>);

    if (import.meta.env.DEV) {
        // eslint-disable-next-line react-hooks/rules-of-hooks
        const checkSelectQuery = useQuery({
            ...saveId === null
                ? getPkmVariantIndexOptions(options as never)
                : getPkmSaveIndexOptions(saveId, options as never),
        } as UseQueryOptions<PkmVariantIndexQueryData | PkmSaveIndexQueryData, Error, D>);

        // eslint-disable-next-line react-hooks/rules-of-hooks
        React.useEffect(() => {
            const data = checkSelectQuery.data;
            if (!data || !selectFn)
                return;

            const res1 = selectFn(data as never);
            const res2 = selectFn(data as never);
            if (res1 !== res2) {
                console.warn('query.select result reference changes over calls, memoization broken', { selectResult: res1, data });
            }
        }, [ checkSelectQuery.data, selectFn ]);
    }

    // const data = React.useMemo(() => 
    //     createMixedIndex(
    //         params.saveId ? undefined : (query as UseQueryResult<PkmVariantIndexQueryData>).data?.data,
    //         params.saveId ? (query as UseQueryResult<PkmSaveIndexQueryData>).data?.data : undefined,
    //         params.saveId
    //     ),
    //     [query, params.saveId]
    // );

    return {
        ...query,
        // data: query.data && {
        //     ...query.data,
        //     data,
        // },
    };
};

// export const useQuerySelect = <TQueryFnData = unknown, TData = TQueryFnData>(selectFn: (data: TQueryFnData) => TData) => {
//     const selectRef = React.useRef(selectFn);
//     // eslint-disable-next-line react-hooks/refs
//     selectRef.current = selectFn;

//     return React.useCallback<typeof selectFn>((data) => selectRef.current(data), []);
// };
