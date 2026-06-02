import React from 'react';
import type { StorageSearchSchema } from '../../routes/storage';

type SearchStorages = NonNullable<StorageSearchSchema[ 'storages' ]>;

type SearchStorage = SearchStorages[ number ];

export type StoragePanelContext = {
    storageIndex: number;
    defaultStorage?: SearchStorage;
};

const storagePanelContext = React.createContext<StoragePanelContext>({ storageIndex: -1 });

export const StoragePanelProvider = storagePanelContext.Provider;

export const useCurrentStorage = () => {
    const { storageIndex, defaultStorage } = React.use(storagePanelContext);

    const getStorage = (searchStorages: SearchStorages | undefined) => {
        const storage = searchStorages?.[storageIndex];

        if (!storage)
            return defaultStorage;
        
        if (storage.saveId === defaultStorage?.saveId
            && storage.boxId === defaultStorage.boxId)
            return defaultStorage;

        return storage;
    };

    // const getMainStorage = (searchStorages: SearchStorages | undefined) => {
    //     const storage = getStorage(searchStorages);
    //     if (!storage || storage.saveId !== null)
    //         throw new Error('Current storage should be main');

    //     return {
    //         ...storage,
    //         saveId: null,
    //     };
    // };
    
    // const getSaveStorage = (searchStorages: SearchStorages | undefined) => {
    //     const storage = getStorage(searchStorages);
    //     if (!storage || storage.saveId === null)
    //         throw new Error('Current storage should be save');

    //     return {
    //         ...storage,
    //         saveId: storage.saveId!
    //     };
    // };
    
    const setStorage = (searchStorages: SearchStorages | undefined, newStorage: Partial<SearchStorage>): SearchStorages => {
        const storage = getStorage(searchStorages);
        
        const newSearchStorages = [...searchStorages ?? []];

        const nextStorage = { ...storage, ...newStorage };
        if (nextStorage.saveId === undefined)
            throw new Error('Current storage is partial: ' + JSON.stringify(nextStorage, undefined, 2));

        if (nextStorage.saveId !== storage?.saveId)
            nextStorage.boxId = newStorage.boxId;

        if (nextStorage.saveId === storage?.saveId && nextStorage.boxId === storage.boxId)
            return searchStorages!;

        newSearchStorages[storageIndex] = nextStorage as SearchStorage;

        return newSearchStorages;
    };

    return {
        storageIndex,
        getStorage,
        // getMainStorage,
        // getSaveStorage,
        setStorage,
    };
};
