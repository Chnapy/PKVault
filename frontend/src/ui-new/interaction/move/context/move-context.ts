import type { Vector2 } from '@use-gesture/react';
import React from 'react';
import { create } from 'zustand';
import { moveReducer } from '../state/move-reducer';
import type { MoveAction, MoveState } from '../state/move-state';

export type MoveTargetInput<C> = {
    targetContainer: C;
    targetPosition: number;
    targetId: string | undefined;
};

export type MoveTargetOutput<C> = MoveTargetInput<C> & {
    targetContainer: C;
    targetPosition: number;
    targetAllPositions: Record<string, number>;
    targetId: string | undefined;
};

export type MovePositions = {
    scroll: Vector2;
    pointer: Vector2;
    pointerInitial: Vector2;
    drag: Vector2;
}; 

export type MoveContext<C> = {
    moveContainerId: string;
    getContainerValue: (containerHash: string) => C;
    getContainerHash: (containerValue: C) => string;
    positionsRef: React.RefObject<MovePositions>;
    useMoveStore: ReturnType<typeof createMoveStore>;
    drop: (target: MoveTargetInput<C>) => Promise<unknown>;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const moveContext = React.createContext<MoveContext<any> | null>(null);

export type MoveStore = {
    state: MoveState;
    dispatch: React.ActionDispatch<[ MoveAction ]>;
};

export const createMoveStore = () => create<MoveStore>()((set) => ({
    state: { status: 'idle' },
    dispatch: (action) => set(s => ({ state: moveReducer(s.state, action) })),
}));
