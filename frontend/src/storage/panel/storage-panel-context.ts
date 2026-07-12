import React from 'react';
import type { StorageSearchSelected, StorageSearchStorage } from '../../routes/storage';
import { usePanel } from '../../ui-new/storage/storage-content/context/ui-panel-context';

const defaultMainStorage: StorageSearchStorage = { saveId: null };

export const useCurrentStorage = (fallbackPanel?: ReturnType<typeof usePanel>) => {
    const ctxPanel = usePanel();
    const currentPanel = fallbackPanel ?? ctxPanel;
    const storageIndex = currentPanel === 'left' ? 0 : 1;

    const getStorageForPanel = React.useCallback((storage: StorageSearchStorage | undefined, panel: typeof currentPanel): StorageSearchStorage | undefined => {
        const defaultStorage: StorageSearchStorage | undefined = panel === 'left'
            ? defaultMainStorage
            : undefined;

        if (!storage)
            return defaultStorage;

        if (storage.saveId === defaultStorage?.saveId
            && storage.boxId === defaultStorage.boxId)
            return defaultStorage;

        return storage;
    }, []);

    const getStorage = React.useCallback((searchStorages: StorageSearchStorage[] | undefined): StorageSearchStorage | undefined => {
        const storage = searchStorages?.[ storageIndex ];

        return getStorageForPanel(storage, currentPanel);
    }, [currentPanel, getStorageForPanel, storageIndex]);

    const getSelected = (searchSelected: StorageSearchSelected | undefined) => {
        if (searchSelected?.storage !== storageIndex)
            return;

        return searchSelected;
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

    const setStorage = (searchStorages: StorageSearchStorage[] | undefined, newStorage: Partial<StorageSearchStorage>): StorageSearchStorage[] => {
        const storage = getStorage(searchStorages);

        const newSearchStorages = [ 
            getStorageForPanel(searchStorages?.[0], 'left'),
            getStorageForPanel(searchStorages?.[1], 'right'),
        ].filter(v => typeof v !== 'undefined');

        const nextStorage = { ...storage, ...newStorage };
        if (nextStorage.saveId === undefined)
            throw new Error('Current storage is partial: ' + JSON.stringify(nextStorage, undefined, 2));

        if (nextStorage.saveId !== storage?.saveId)
            nextStorage.boxId = newStorage.boxId;

        if (nextStorage.saveId === storage?.saveId && nextStorage.boxId === storage.boxId)
            return searchStorages!;

        newSearchStorages[ storageIndex ] = nextStorage as StorageSearchStorage;

        return newSearchStorages;
    };

    return {
        storageIndex,
        getStorage,
        getSelected,
        // getMainStorage,
        // getSaveStorage,
        setStorage,
    };
};

export const useOtherStorage = () => {
    const ctxPanel = usePanel();
    return useCurrentStorage(ctxPanel === 'left' ? 'right' : 'left');
};
