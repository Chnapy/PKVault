import React from 'react';
import { createSelectStore, selectContext, type SelectContext } from './select-context';

type SelectProviderProps<C> = Pick<SelectContext<C>, 'getContainerHash' | 'getContainerValue'> & {
    children: React.ReactNode;
};

export function SelectProvider<C>({ getContainerHash, getContainerValue, children }: SelectProviderProps<C>) {
    const [ value ] = React.useState((): SelectContext<C> => ({
        getContainerHash,
        getContainerValue,
        useSelectStore: createSelectStore(),
    }));

    return (
        <selectContext.Provider value={value}>
            {children}
        </selectContext.Provider>
    );
};
