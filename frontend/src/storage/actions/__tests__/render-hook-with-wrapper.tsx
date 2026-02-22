import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { waitFor } from '@testing-library/dom';
import { renderHook } from '@testing-library/react';
import { expect } from 'vitest';
import { StorageMoveContext, type StorageMoveContextValue } from '../storage-move-context';
import { StorageSelectContext, type StorageSelectContextValue } from '../storage-select-context';

export const renderHookWithWrapper = <Result, Props>(
    useHook: (initialProps: Props) => Result,
    moveDefaultValue?: StorageMoveContextValue,
    selectDefaultValue?: StorageSelectContextValue,
) => {
    const queryClient = new QueryClient({
        defaultOptions: {
            queries: {
                gcTime: Infinity,
                staleTime: Infinity,
                refetchOnMount: false,
                refetchOnReconnect: false,
                refetchOnWindowFocus: false,
                retry: false,
            },
        },
    });

    let moveContextValue: StorageMoveContextValue | undefined;
    let selectContextValue: StorageSelectContextValue | undefined;

    const useWrapperHook = (initialProps: Props) => {
        const result = useHook(initialProps);
        moveContextValue = StorageMoveContext.useValue().selected;
        selectContextValue = StorageSelectContext.useValue();
        return result;
    };

    const renderResults = renderHook(useWrapperHook, {
        wrapper: ({ children }) => {
            return <QueryClientProvider client={queryClient}>
                <StorageSelectContext.SimpleProvider defaultValue={selectDefaultValue}>
                    <StorageMoveContext.Provider defaultValue={moveDefaultValue}>
                        {children}
                    </StorageMoveContext.Provider>
                </StorageSelectContext.SimpleProvider>
            </QueryClientProvider>;
        },
    });

    const getMoveContext = () => moveContextValue;
    const getSelectContext = () => selectContextValue;

    const waitForQueries = () => waitFor(() => expect(queryClient.isFetching()).toBeFalsy());

    return {
        ...renderResults,
        waitForQueries,
        getMoveContext,
        getSelectContext,
    };
};
