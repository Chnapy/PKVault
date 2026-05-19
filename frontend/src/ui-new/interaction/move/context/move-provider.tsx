import React from 'react';
import { createMoveStore, moveContext, type MoveContext } from './move-context';

type MoveProviderProps<C> = Pick<MoveContext<C>, 'moveContainerId' | 'getContainerHash' | 'getContainerValue'> & {
    children: React.ReactNode;
};

export const MoveProvider = function <C>({ moveContainerId, getContainerHash, getContainerValue, children }: MoveProviderProps<C>) {
    const [ value ] = React.useState((): MoveContext<C> => ({
        moveContainerId,
        getContainerHash,
        getContainerValue,
        useMoveStore: createMoveStore(),
    }));

    return <moveContext.Provider value={value}>{children}</moveContext.Provider>;
};
