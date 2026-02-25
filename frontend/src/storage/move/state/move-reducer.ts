import type { MoveAction, MoveState } from './move-state';

export const moveReducer = (state: MoveState, action: MoveAction): MoveState => {
    switch (action.type) {
        case 'START_DRAG':
            if (state.status !== 'idle') return state;
            return { status: 'dragging', source: action.source };

        case 'DROP_ON_SLOT':
            if (state.status !== 'dragging') return state;
            return { status: 'loading', source: state.source, target: action.target };

        case 'DROP_ON_BANK':
            if (state.status !== 'dragging') return state;
            return { status: 'loading', source: state.source, target: action.target };

        case 'COMPLETE':
        case 'CANCEL':
            return { status: 'idle' };
    }
};
