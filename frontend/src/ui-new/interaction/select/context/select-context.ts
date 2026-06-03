import React from 'react';
import { create } from 'zustand';

export type SelectContext<C> = {
    getContainerValue: (containerHash: string) => C;
    getContainerHash: (containerValue: C) => string;
    useSelectStore: ReturnType<typeof createSelectStore>;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const selectContext = React.createContext<SelectContext<any> | null>(null);

export type SelectStore = {
    container: string;
    ids: Set<string>;
};

export const createSelectStore = (initialState?: SelectStore) => create<SelectStore>()(() => initialState ?? ({
    container: '',
    ids: new Set(),
}));
