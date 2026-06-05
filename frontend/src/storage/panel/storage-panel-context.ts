import type { StorageSearchStorage } from '../../routes/storage';
import { usePanel } from '../../ui-new/storage/storage-content/context/ui-panel-context';

export const useCurrentStorage = () => {
    const currentPanel = usePanel();
    const storageIndex = currentPanel === 'left' ? 0 : 1;
    const defaultStorage: StorageSearchStorage | undefined = currentPanel === 'left'
        ? { saveId: null }
        : undefined;

    const getStorage = (searchStorages: StorageSearchStorage[] | undefined) => {
        const storage = searchStorages?.[ storageIndex ];

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

    const setStorage = (searchStorages: StorageSearchStorage[] | undefined, newStorage: Partial<StorageSearchStorage>): StorageSearchStorage[] => {
        const storage = getStorage(searchStorages);

        const newSearchStorages = [ ...searchStorages ?? [] ];

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
        // getMainStorage,
        // getSaveStorage,
        setStorage,
    };
};
