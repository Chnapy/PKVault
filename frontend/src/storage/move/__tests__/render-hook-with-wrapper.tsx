import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { waitFor } from '@testing-library/dom';
import { renderHook } from '@testing-library/react';
import { expect } from 'vitest';
import { useMoveContext } from '../../../ui-new/interaction/move/context/use-move-context';
import type { MoveState } from '../../../ui-new/interaction/move/state/move-state';
import type { SelectContext } from '../../../ui-new/interaction/select/context/select-context';
import { useSelectContextNullable } from '../../../ui-new/interaction/select/context/use-select-context';
import { MoveSelectImplProvider, type MoveContainerValue, type MoveParams, type MoveSelectImplProviderProps } from '../state/move-select-impl-provider';

export const renderHookWithWrapper = <Result, Props>(
    useHook: (initialProps: Props) => Result,
    moveDefaultValue?: MoveSelectImplProviderProps[ 'moveCtx' ],
    selectDefaultValue?: MoveSelectImplProviderProps[ 'selectCtx' ],
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

    let moveContextValue: MoveState<MoveParams> | undefined;
    let selectContextValue: SelectContext<MoveContainerValue> | undefined;

    const useWrapperHook = (initialProps: Props) => {
        const result = useHook(initialProps);
        moveContextValue = useMoveContext<MoveContainerValue, MoveParams>().useMoveStore().state;
        selectContextValue = useSelectContextNullable() ?? undefined;
        return result;
    };

    const renderResults = renderHook(useWrapperHook, {
        wrapper: ({ children }) => {
            return <QueryClientProvider client={queryClient}>
                <MoveSelectImplProvider
                    selectCtx={selectDefaultValue}
                    moveCtx={moveDefaultValue}
                >
                    {children}
                </MoveSelectImplProvider>
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
