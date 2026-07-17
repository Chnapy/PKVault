import type { Vector2 } from '@use-gesture/react';
import React from 'react';
import { create } from 'zustand';
import { moveReducer } from '../state/move-reducer';
import type { DraggingSlotsStates, MoveAction, MoveSource, MoveState } from '../state/move-state';

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
    pointer: Vector2;
    pointerInitial: Vector2;
    target: Vector2;
    drag: Vector2;
};

export type MoveContext<C, P = unknown> = {
    moveContainerId: string;
    getContainerValue: (containerHash: string) => C;
    getContainerHash: (containerValue: C) => string;
    positionsRef: React.RefObject<MovePositions>;
    dragEndTimestampRef: React.RefObject<number>;
    useMoveStore: ReturnType<typeof createMoveStore<P>>;
    dragStartComputeSlotStates: (source: MoveSource<P>) => DraggingSlotsStates;
    drop: (target: MoveTargetInput<C>) => Promise<unknown>;
    useFilterStartDragIds: (container: C, sourceIds: string[]) => (params?: P) => Set<string>;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const moveContext = React.createContext<MoveContext<any, any> | null>(null);

export type MoveStore<P> = {
    state: MoveState<P>;
    dispatch: React.ActionDispatch<[ MoveAction ]>;
};

export const createMoveStore = <P>(initialState?: MoveState<P>) => create<MoveStore<P>>()((set) => ({
    state: initialState ?? { status: 'idle' },
    dispatch: (action) => set(s => ({ state: moveReducer(s.state, action) })),
}));
