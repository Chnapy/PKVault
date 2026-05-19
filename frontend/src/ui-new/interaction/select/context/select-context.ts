import React from 'react';
import { create } from 'zustand';

export type SelectContext<C> = {
    getContainerValue: (containerHash: string) => C;
    getContainerHash: (containerValue: C) => string;
    useSelectStore: ReturnType<typeof createSelectStore>;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const selectContext = React.createContext<SelectContext<any> | null>(null);

type SelectStore = {
    container: string;
    ids: Set<string>;
};

export const createSelectStore = () => create<SelectStore>()(() => ({
    container: '',
    ids: new Set(),
}));
