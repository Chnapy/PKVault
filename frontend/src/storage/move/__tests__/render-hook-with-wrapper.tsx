import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { waitFor } from '@testing-library/dom';
import { renderHook } from '@testing-library/react';
import { expect } from 'vitest';
import { StorageSelectContext, type StorageSelectContextValue } from '../../actions/storage-select-context';
import { MoveContext } from '../context/move-context';
import type { MoveState } from '../state/move-state';

export const renderHookWithWrapper = <Result, Props>(
    useHook: (initialProps: Props) => Result,
    moveDefaultValue?: MoveState,
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

    let moveContextValue: MoveState | undefined;
    let selectContextValue: StorageSelectContextValue | undefined;

    const useWrapperHook = (initialProps: Props) => {
        const result = useHook(initialProps);
        moveContextValue = MoveContext.useValue().state;
        selectContextValue = StorageSelectContext.useValue();
        return result;
    };

    const renderResults = renderHook(useWrapperHook, {
        wrapper: ({ children }) => {
            return <QueryClientProvider client={queryClient}>
                <StorageSelectContext.SimpleProvider defaultValue={selectDefaultValue}>
                    <MoveContext.Provider defaultValue={moveDefaultValue}>
                        {children}
                    </MoveContext.Provider>
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
