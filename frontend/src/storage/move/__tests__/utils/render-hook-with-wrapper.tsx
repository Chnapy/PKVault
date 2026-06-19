import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createMemoryHistory, createRootRoute, createRouter, Outlet, RouterContextProvider } from '@tanstack/react-router';
import { waitFor } from '@testing-library/dom';
import { renderHook } from '@testing-library/react';
import { expect } from 'vitest';
import { useMoveContext } from '../../../../ui-new/interaction/move/context/use-move-context';
import type { MoveState } from '../../../../ui-new/interaction/move/state/move-state';
import type { SelectContext } from '../../../../ui-new/interaction/select/context/select-context';
import { useSelectContextNullable } from '../../../../ui-new/interaction/select/context/use-select-context';
import type { MoveContainerValue, MoveParams } from '../../move-container-fns';
import { MoveSelectImplProvider, type MoveSelectImplProviderProps } from '../../move-select-impl-provider';

export const renderHookWithWrapper = <Result, Props>(
    useHook: (initialProps: Props) => Result,
    searchParams?: object,
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

    // let moveContext: MoveContext<MoveContainerValue, MoveParams> | undefined;
    let moveContextValue: MoveState<MoveParams> | undefined;
    let selectContextValue: SelectContext<MoveContainerValue> | undefined;

    const useWrapperHook = (initialProps: Props) => {
        const result = useHook(initialProps);
        // moveContext = useMoveContext<MoveContainerValue, MoveParams>();
        moveContextValue = useMoveContext<MoveContainerValue, MoveParams>().useMoveStore().state;
        selectContextValue = useSelectContextNullable() ?? undefined;
        return result;
    };

    const renderResults = renderHook(useWrapperHook, {
        wrapper: ({ children }) => {
            const routeTree = createRootRoute({
                component: () => <Outlet />,
            });

            const router = createRouter({
                routeTree,
                history: createMemoryHistory({
                    initialEntries: [ '/' ],
                }),
                parseSearch: searchParams && (() => searchParams),
            });

            return <QueryClientProvider client={queryClient}>
                <RouterContextProvider router={router}>
                    <MoveSelectImplProvider
                        selectCtx={selectDefaultValue}
                        moveCtx={moveDefaultValue}
                    >
                        {children}
                    </MoveSelectImplProvider>
                </RouterContextProvider>
            </QueryClientProvider>;
        },
    });

    const getMoveContext = () => moveContextValue;
    const getSelectContext = () => selectContextValue;

    const waitForQueries = () => waitFor(() => {
        expect(queryClient.isFetching()).toBeFalsy();
    });

    return {
        ...renderResults,
        waitForQueries,
        getMoveContext,
        getSelectContext,
    };
};
