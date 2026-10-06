import React from 'react';
import { createStorageModeStore, storageModeContext } from './storage-mode-context';

export const StorageModeProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
    const [ useStorageModeStore ] = React.useState(() => createStorageModeStore('default'));

    return <storageModeContext.Provider value={{ useStorageModeStore }}>
        {children}
    </storageModeContext.Provider>;
};
