import type { MoveAction, MoveSource, MoveState } from './move-state';

export const moveReducer = <P>(state: MoveState<P>, action: MoveAction): MoveState<P> => {
    // console.log(action.type)
    switch (action.type) {
        case 'START_DRAG':
            if (state.status !== 'idle') return state;

            return {
                status: 'dragging',
                source: action.source as MoveSource<P>,
                trigger: action.trigger,
            };

        case 'UPDATE_FOCUS':
            if (state.status !== 'dragging' || state.trigger !== 'click') return state;

            return {
                ...state,
                trigger: 'focus',
            };

        case 'DROP':
            if (state.status !== 'dragging') return state;
            return { status: 'loading', source: state.source, target: { ...action.target } };

        case 'COMPLETE':
            if (state.status !== 'loading') return state;
            return { status: 'idle' };

        case 'CANCEL':
            if (state.status !== 'dragging') return state;
            return { status: 'idle' };
    }
};
