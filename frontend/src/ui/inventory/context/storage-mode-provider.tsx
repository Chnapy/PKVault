import React from 'react';
import { createStorageModeStore, storageModeContext } from './storage-mode-context';

export const StorageModeProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
    const [ useMoveStore ] = React.useState(() => createStorageModeStore('default'));

    return <storageModeContext.Provider value={{ useMoveStore }}>
        {children}
    </storageModeContext.Provider>;
};
