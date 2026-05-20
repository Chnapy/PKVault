import type { MoveAction, MoveState } from './move-state';

export const moveReducer = (state: MoveState, action: MoveAction): MoveState => {
    // console.log(action.type)
    switch (action.type) {
        case 'START_DRAG':
            if (state.status !== 'idle') return state;

            switch (action.trigger) {
                case 'drag':
                    return {
                        status: 'dragging',
                        source: action.source,
                        trigger: 'drag',
                        position: [ ...action.position ],
                        basePosition: [ ...action.basePosition ],
                        scrollPosition: action.scrollPosition,
                        pointerInitialPosition: [ 0, 0 ],
                        pointerPosition: [ 0, 0 ],
                    };
                case 'click':
                    return {
                        status: 'dragging',
                        source: action.source,
                        trigger: 'click',
                        position: [ ...action.position ],
                        basePosition: [ ...action.basePosition ],
                        scrollPosition: action.scrollPosition,
                        pointerInitialPosition: [ ...action.position ],
                        pointerPosition: [ ...action.position ],
                    };
                case 'focus':
                    return {
                        status: 'dragging',
                        source: action.source,
                        trigger: 'focus',
                        position: [ ...action.position ],
                        basePosition: [ ...action.basePosition ],
                        scrollPosition: action.scrollPosition,
                        pointerInitialPosition: [ 0, 0 ],
                        pointerPosition: [ 0, 0 ],
                    };
            }
            return state;

        case 'UPDATE_DRAG':
            if (state.status !== 'dragging') return state;
            return {
                ...state,
                position: action.position,
            };

        case 'UPDATE_SCROLL':
            if (state.status !== 'dragging' || state.trigger === 'focus') return state;
            return {
                ...state,
                scrollPosition: action.position,
            };

        case 'UPDATE_POINTER':
            if (state.status !== 'dragging' || state.trigger === 'drag') return state;

            if (state.trigger === 'focus')
                return {
                    ...state,
                    trigger: 'click',
                    scrollPosition: action.scrollPosition,
                    pointerPosition: action.position,
                    pointerInitialPosition: state.position,
                };

            return {
                ...state,
                pointerPosition: action.position,
            };

        case 'UPDATE_FOCUS':
            if (state.status !== 'dragging' || state.trigger === 'drag') return state;

            if (state.trigger === 'click')
                return {
                    ...state,
                    trigger: 'focus',
                    position: action.position,
                    scrollPosition: [ 0, 0 ],
                    pointerInitialPosition: [ 0, 0 ],
                    pointerPosition: [ 0, 0 ],
                };

            return {
                ...state,
                position: action.position,
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
