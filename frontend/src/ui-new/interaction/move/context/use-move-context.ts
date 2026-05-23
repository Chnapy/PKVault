import React from 'react';
import { type MoveContext, moveContext } from './move-context';

export const useMoveContextNullable = <C>() => {
    return React.useContext<MoveContext<C> | null>(moveContext);
};

export const useMoveContext = <C>() => {
    const ctx = useMoveContextNullable<C>();
    if (!ctx)
        throw new Error('Must be used inside MoveProvider');
    return ctx;
};
