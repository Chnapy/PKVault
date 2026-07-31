import React from 'react';
import { createSelectStore, selectContext, type SelectContext, type SelectStore } from './select-context';

export type SelectProviderProps<C> = Pick<SelectContext<C>, 'getContainerHash' | 'getContainerValue'> & {
    initialValue?: SelectStore;
    children: React.ReactNode;
};

export function SelectProvider<C>({ getContainerHash, getContainerValue, initialValue, children }: SelectProviderProps<C>) {
    const [ value ] = React.useState((): SelectContext<C> => ({
        getContainerHash,
        getContainerValue,
        useSelectStore: createSelectStore(initialValue),
    }));

    return (
        <selectContext.Provider value={value}>
            {children}
        </selectContext.Provider>
    );
};
