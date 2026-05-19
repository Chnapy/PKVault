import type { MoveAction, MoveState } from './move-state';

export const moveReducer = <T>(state: MoveState<T>, action: MoveAction<T>): MoveState<T> => {
    switch (action.type) {
        case 'START_DRAG':
            if (state.status !== 'idle') return state;
            return { status: 'dragging', source: action.source };

        case 'DROP':
            if (state.status !== 'dragging') return state;
            return { status: 'loading', source: state.source, target: action.target };

        case 'COMPLETE':
        case 'CANCEL':
            return { status: 'idle' };
    }
};
