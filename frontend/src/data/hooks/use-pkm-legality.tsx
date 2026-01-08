import { useQueries, useQuery, type UseQueryResult } from "@tanstack/react-query";
import * as batshit from "@yornaath/batshit";
import type { PkmLegalityDTO } from '../sdk/model';
import { getStorageGetPkmsLegalityQueryKey, storageGetPkmsLegality } from '../sdk/storage/storage.gen';

const batchers: Record<number, ReturnType<typeof createBatcher>> = {};

const createBatcher = (saveId?: number) => batshit.create({
    name: 'pkm-legality',
    fetcher: async (pkmIds: string[]) => {
        const response = await storageGetPkmsLegality({ saveId, pkmIds });
        return response;
    },
    scheduler: batshit.windowScheduler(20),
    resolver: (response, id) => ({
        ...response,
        data: response.data[ id ]!
    }),
});

const getBatcherBySave = (saveId?: number) => {
    const batcher = batchers[ saveId ?? 0 ] ?? createBatcher(saveId);
    batchers[ saveId ?? 0 ] = batcher;
    return batcher;
};

export type PkmLegalityQueryData = ReturnType<typeof usePkmLegality>[ 'data' ];

export const getPkmLegalityQueryKey = (pkmId: string, saveId?: number): unknown[] => [ ...getStorageGetPkmsLegalityQueryKey(), saveId ?? 0, pkmId ];

const getQueryOptions = (pkmId: string, saveId?: number) => ({
    queryKey: getPkmLegalityQueryKey(pkmId, saveId),
    queryFn: () => getBatcherBySave(saveId).fetch(pkmId),
});

export const usePkmLegality = (pkmId: string, saveId?: number) => {
    return useQuery(getQueryOptions(pkmId, saveId));
};

export const usePkmLegalityMap = (pkmIds: string[], saveId?: number) => {
    type QueriesResult = Omit<
        UseQueryResult<{
            data: Record<string, PkmLegalityDTO>;
            status: number;
            headers: Headers;
        }, Error>,
        'refetch' | 'promise'
    >;

    return useQueries({
        queries: pkmIds.map((pkmId) => getQueryOptions(pkmId, saveId)),
        combine: result => result.reduce<QueriesResult>((acc, query) => {
            return {
                ...query,
                error: acc.error ?? query.error,
                isError: acc.isError || query.isError,
                isPending: acc.isPending || query.isPending,
                isLoading: acc.isLoading || query.isLoading,
                isLoadingError: acc.isLoadingError || query.isLoadingError,
                isRefetchError: acc.isRefetchError || query.isRefetchError,
                isSuccess: acc.isSuccess && query.isSuccess,
                isPlaceholderData: acc.isPlaceholderData || query.isPlaceholderData,
                isFetched: acc.isFetched && query.isFetched,
                isFetchedAfterMount: acc.isFetchedAfterMount && query.isFetchedAfterMount,
                isFetching: acc.isFetching || query.isFetching,
                isPaused: acc.isPaused && query.isPaused,
                isRefetching: acc.isRefetching || query.isRefetching,
                isStale: acc.isStale && query.isStale,
                isEnabled: acc.isEnabled && query.isEnabled,
                status: query.status,
                fetchStatus: query.fetchStatus,
                data: acc.data && query.data && {
                    ...query.data,
                    data: {
                        ...acc.data?.data,
                        [ query.data.data.id ]: query.data.data,
                    }
                }
            } satisfies QueriesResult;
        }, {
            data: {
                status: 200,
                headers: new Headers(),
                data: undefined!,
            },
            error: null,
            isError: false,
            isPending: false,
            isLoading: false,
            isLoadingError: false,
            isRefetchError: false,
            isSuccess: true,
            isPlaceholderData: false,
            isFetched: false,
            isFetchedAfterMount: false,
            isFetching: false,
            isInitialLoading: false,
            isPaused: false,
            isRefetching: false,
            isStale: false,
            isEnabled: false,
            status: 'success',
            fetchStatus: 'idle',
            dataUpdatedAt: 0,
            errorUpdatedAt: 0,
            failureCount: 0,
            failureReason: null,
            errorUpdateCount: 0,
        }),
    });
};
