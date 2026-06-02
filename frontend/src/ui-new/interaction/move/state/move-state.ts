
export type MoveSource<P = unknown> = {
    containerId: string;
    sourceId: string;
    ids: Set<string>;
    params?: P;
};

type MoveTarget = {
    targetContainerId: string;
    targetPosition: number;
    targetAllPositions: Record<string, number>;
    targetId: string | undefined;
};

export type DraggingTrigger = 'drag' | 'click' | 'focus';

export type MoveStateDragging<P> = {
    status: 'dragging';
    source: MoveSource<P>;
    trigger: DraggingTrigger;
};

export type MoveStateLoading<P> = {
    status: 'loading';
    source: MoveSource<P>;
    target: MoveTarget;
};

export type MoveState<P> =
    | { status: 'idle' }
    | MoveStateDragging<P>
    | MoveStateLoading<P>;

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
