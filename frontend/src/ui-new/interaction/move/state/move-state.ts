import type { Vector2 } from '@use-gesture/react';

export type MoveSource = {
    containerId: string;
    sourceId: string;
    ids: Set<string>;
};

type MoveTarget = {
    targetContainerId: string;
    targetPosition: number;
    targetAllPositions: Record<string, number>;
    targetId: string | undefined;
};

export type DraggingTrigger = 'drag' | 'click' | 'focus';

export type MoveStateDragging = {
    status: 'dragging';
    source: MoveSource;
    trigger: DraggingTrigger;
    // position updated in real-time
    position: Vector2;
    // base-position defined on drag start
    basePosition: Vector2;
    scrollPosition: Vector2;
    pointerPosition: Vector2;
    // pointer-position defined on drag start (click)
    pointerInitialPosition: Vector2;
};

export type MoveStateLoading = {
    status: 'loading';
    source: MoveSource;
    target: MoveTarget;
};

export type MoveState =
    | { status: 'idle' }
    | MoveStateDragging
    | MoveStateLoading;

export type MoveAction =
    | {
        type: 'START_DRAG';
        source: MoveSource;
        trigger: DraggingTrigger;
        position: Vector2;
        basePosition: Vector2;
        scrollPosition: Vector2;
    }
    | { type: 'UPDATE_DRAG'; position: Vector2 }
    | { type: 'UPDATE_SCROLL'; position: Vector2 }
    | { type: 'UPDATE_POINTER'; position: Vector2; scrollPosition: Vector2 }
    | { type: 'UPDATE_FOCUS'; position: Vector2 }

    | {
        type: 'DROP';
        target: {
            targetContainerId: string;
            targetPosition: number;
            targetAllPositions: Record<string, number>;
            targetId: string | undefined;
        };
    }
    | { type: 'COMPLETE' }
    | { type: 'CANCEL' };
