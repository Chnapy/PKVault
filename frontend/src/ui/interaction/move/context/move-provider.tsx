import { useGesture } from '@use-gesture/react';
import React from 'react';
import { useSelectContextNullable } from '../../select/context/use-select-context';
import { MoveControlsGlobals } from '../components/move-controls-global';
import type { MoveSource, MoveState, MoveStateLoading } from '../state/move-state';
import { createMoveStore, moveContext, type MoveContext, type MovePositions, type MoveTargetInput, type MoveTargetOutput } from './move-context';

export type MoveProviderProps<C, P> = Pick<MoveContext<C, P>, 'moveContainerId' | 'getContainerHash' | 'getContainerValue' | 'useFilterStartDragIds' | 'dragStartComputeSlotStates'> & {
    initialState?: MoveState<P>;
    getTargetAllPositions: (source: MoveSource<P>, target: MoveTargetInput<C>) => Record<string, number>;
    onDrop: (source: MoveSource<P>, target: MoveTargetOutput<C>) => Promise<unknown>;
    children: React.ReactNode;
};

export const MoveProvider = function <C, P>({
    moveContainerId, getContainerHash, getContainerValue, initialState,
    onDrop: onDropSuccess, getTargetAllPositions, useFilterStartDragIds, dragStartComputeSlotStates,
    children
}: MoveProviderProps<C, P>) {
    const positionsRef = React.useRef<MovePositions>({
        pointer: [ 0, 0 ],
        pointerInitial: [ 0, 0 ],
        target: [ 0, 0 ],
        drag: [ 0, 0 ],
    });

    const dragEndTimestampRef = React.useRef(0);

    const selectCtx = useSelectContextNullable();

    const [ value ] = React.useState((): MoveContext<C, P> => {

        const useMoveStore = createMoveStore<P>(initialState);

        const innerDispatch = useMoveStore.getState().dispatch;

        const drop = async function (target: MoveTargetInput<C>) {
            const initialState = useMoveStore.getState().state;
            if (initialState.status !== 'dragging')
                throw new Error('Invalid status ' + JSON.stringify(initialState, undefined, 2));

            const targetAllPositions = getTargetAllPositions(initialState.source, target);

            innerDispatch({
                type: 'DROP',
                target: {
                    targetContainerId: getContainerHash(target.targetContainer),
                    targetPosition: target.targetPosition,
                    targetAllPositions,
                    targetId: target.targetId,
                },
            });

            const state = useMoveStore.getState().state as MoveStateLoading<P>;
            const targetOutput: MoveTargetOutput<C> = {
                targetContainer: target.targetContainer,
                targetPosition: state.target.targetPosition,
                targetAllPositions: state.target.targetAllPositions,
                targetId: state.target.targetId,
            };

            await onDropSuccess(state.source, targetOutput)
                // unselect all, if was moved
                .then(() => {
                    const selectState = selectCtx?.useSelectStore.getState();

                    if (selectState?.container === state.source.containerId
                        && [ ...state.source.ids ].some(id => selectState.ids.has(id))
                    ) {
                        selectCtx?.useSelectStore.setState({
                            container: '',
                            ids: new Set(),
                        });
                    }
                })
                .finally(() => {
                    innerDispatch({
                        type: 'COMPLETE',
                    });
                });
        };

        return {
            moveContainerId,
            getContainerHash,
            getContainerValue,
            positionsRef,
            dragEndTimestampRef,
            useMoveStore,
            dragStartComputeSlotStates,
            drop,
            useFilterStartDragIds,
        };
    });

    const dispatch = value.useMoveStore.getState().dispatch;

    useGesture({
        onPointerMove: ({ event }) => {
            positionsRef.current.pointer = [ event.clientX, event.clientY ];

            if (!positionsRef.current.pointerInitial[ 0 ] && !positionsRef.current.pointerInitial[ 1 ])
                positionsRef.current.pointerInitial = positionsRef.current.pointer;

            // positionsRef.current.scroll = [ window.scrollX, window.scrollY ];
        },
        onClick: () => {
            dispatch({ type: 'CANCEL' });
        },
    }, {
        target: document,
    });

    return <moveContext.Provider value={value}>
        <MoveControlsGlobals />

        {children}
    </moveContext.Provider>;
};
