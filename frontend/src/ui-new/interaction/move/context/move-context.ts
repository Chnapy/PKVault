import React from 'react';
import { create } from 'zustand';
import { moveReducer } from '../state/move-reducer';
import type { MoveAction, MoveState } from '../state/move-state';

export type MoveContext<C> = {
    moveContainerId: string;
    getContainerValue: (containerHash: string) => C;
    getContainerHash: (containerValue: C) => string;
    useMoveStore: ReturnType<typeof createMoveStore>;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const moveContext = React.createContext<MoveContext<any> | null>(null);

type MoveStore<T = unknown> = {
    state: MoveState<T>;
    dispatch: React.ActionDispatch<[ MoveAction<T> ]>;
};

export const createMoveStore = () => create<MoveStore>()((set) => ({
    state: { status: 'idle' },
    dispatch: (action) => set(s => ({ state: moveReducer(s.state, action) })),
}));
