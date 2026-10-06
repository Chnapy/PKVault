import React from 'react';
import { create } from 'zustand';

export type StorageMode = 'default' | 'inventory';

export const storageModeContext = React.createContext<{
    useStorageModeStore: ReturnType<typeof createStorageModeStore>;
} | null>(null);

export type StorageModeStore = {
    state: StorageMode;
    dispatch: React.ActionDispatch<[ StorageMode ]>;
};

export const createStorageModeStore = (initialState: StorageMode) => create<StorageModeStore>()((set) => ({
    state: initialState,
    dispatch: (action) => set(s => ({ state: action })),
}));

export const useStorageModeContext = () => {
    const ctx = React.useContext(storageModeContext);
    if (!ctx)
        throw new Error('Must be used inside StorageModeProvider');
    return ctx;
};

export const useStorageMode = () => useStorageModeContext().useStorageModeStore();
