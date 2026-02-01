import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import { BackendErrorsContext } from './backend-errors-context';
import { updateCacheMutationResponse } from './util/update-cache-mutation-response';

export const DataProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
    const errorsOnMutationResponse = BackendErrorsContext.useOnMutationResponse();

    const [ client ] = React.useState(
        () =>
            new QueryClient({
                defaultOptions: {
                    queries: {
                        gcTime: Infinity,
                        staleTime: Infinity,
                        refetchOnMount: false,
                        refetchOnReconnect: false,
                        refetchOnWindowFocus: false,
                        retry: false,
                    },
                    mutations: {
                        onSettled: async (data, error) => {
                            errorsOnMutationResponse(data, error);

                            updateCacheMutationResponse(client, data);
                        },
                    },
                },
            }),
    );

    return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
};
