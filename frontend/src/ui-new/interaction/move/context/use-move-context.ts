import React from 'react';
import { type MoveContext, moveContext } from './move-context';

export const useMoveContext = <C>() => {
    const ctx = React.useContext<MoveContext<C> | null>(moveContext);
    if (!ctx)
        throw new Error('Must be used inside MoveProvider');
    return ctx;
};
