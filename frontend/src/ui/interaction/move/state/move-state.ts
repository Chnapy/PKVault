
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

export type SlotsStates = Record<string, {
    canDrop: boolean;
    helpText?: string;
    _disabledReason?: unknown;
}>;

export type DraggingSlotsStates = {
    rootItems: SlotsStates;
    items: Record<string, SlotsStates>;
};

export type MoveStateDragging<P> = {
    status: 'dragging';
    trigger: DraggingTrigger;
    source: MoveSource<P>;
    slotsStates: DraggingSlotsStates;
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
        trigger: DraggingTrigger;
        source: MoveSource;
        slotsStates: DraggingSlotsStates;
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
