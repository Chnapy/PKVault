import React, { type ActionDispatch } from 'react';
import { moveReducer } from '../state/move-reducer';
import type { MoveAction, MoveState } from '../state/move-state';

type Context = {
    state: MoveState;
    dispatch: ActionDispatch<[ MoveAction ]>;
};

const context = React.createContext<Context>({
    state: { status: 'idle' },
    dispatch: () => void 0,
});

/**
 * Manage pkms move action with all possible cases:
 * - one or multiple pkms selected
 * - move into current box or another box
 * - move between PKVault <-> save
 * - move between save A <-> save B
 * - move to another bank
 * - move as attached or not
 */
export const MoveContext = {
    containerId: 'storage-move-container',
    Provider: ({ defaultValue, children }: React.PropsWithChildren<{ defaultValue?: MoveState }>) => {
        const [ state, dispatch ] = React.useReducer(moveReducer, defaultValue ?? { status: 'idle' });

        const value = React.useMemo((): Context => ({
            state,
            dispatch,
        }), [ state, dispatch ]);

        return <context.Provider value={value}>{children}</context.Provider>;
    },
    useValue: () => React.useContext(context),
};
