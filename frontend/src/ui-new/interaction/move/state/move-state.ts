export type MoveSource = {
    containerId: string;
    ids: Set<string>;
};

export type MoveState<T> =
    | { status: 'idle' }
    | { status: 'dragging'; source: MoveSource }
    | { status: 'loading'; source: MoveSource; target: T };

export type MoveAction<T> =
    | { type: 'START_DRAG'; source: MoveSource }
    | { type: 'DROP'; target: T }
    | { type: 'COMPLETE' }
    | { type: 'CANCEL' };
