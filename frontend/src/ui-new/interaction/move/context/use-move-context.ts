import React from 'react';
import { type MoveContext, moveContext } from './move-context';

export const useMoveContextNullable = <C, P>() => {
    return React.useContext<MoveContext<C, P> | null>(moveContext);
};

export const useMoveContext = <C, P = unknown>() => {
    const ctx = useMoveContextNullable<C, P>();
    if (!ctx)
        throw new Error('Must be used inside MoveProvider');
    return ctx;
};
