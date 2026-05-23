
export type MoveSource<P = unknown> = {
    containerId: string;
    sourceId: string;
    ids: Set<string>;
    params: P;
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
    }
    | { type: 'UPDATE_FOCUS' }
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
