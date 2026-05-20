import { useGesture, useScroll } from '@use-gesture/react';
import React from 'react';
import type { MoveSource, MoveStateLoading } from '../state/move-state';
import { createMoveStore, moveContext, type MoveContext, type MoveTargetInput, type MoveTargetOutput } from './move-context';

type MoveProviderProps<C> = Pick<MoveContext<C>, 'moveContainerId' | 'getContainerHash' | 'getContainerValue'> & {
    getTargetAllPositions: (source: MoveSource, target: MoveTargetInput<C>) => Record<string, number>;
    onDrop: (source: MoveSource, target: MoveTargetOutput<C>) => Promise<unknown>;
    children: React.ReactNode;
};

export const MoveProvider = function <C>({
    moveContainerId, getContainerHash, getContainerValue,
    onDrop: onDropSuccess, getTargetAllPositions,
    children
}: MoveProviderProps<C>) {
    const [ value ] = React.useState((): MoveContext<C> => {

        const useMoveStore = createMoveStore();

        const innerDispatch = useMoveStore.getState().dispatch;

        const drop = async function (target: MoveTargetInput<C>) {
            const initialState = useMoveStore.getState().state;
            if (initialState.status !== 'dragging')
                throw new Error('Invalid status');

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

            const state = useMoveStore.getState().state as MoveStateLoading;
            const targetOutput: MoveTargetOutput<C> = {
                targetContainer: target.targetContainer,
                targetPosition: state.target.targetPosition,
                targetAllPositions: state.target.targetAllPositions,
                targetId: state.target.targetId,
            };

            await onDropSuccess(state.source, targetOutput)
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
            useMoveStore,
            drop,
        };
    });

    const dispatch = value.useMoveStore.getState().dispatch;

    useScroll(({ initial, movement }) => {
        dispatch({
            type: 'UPDATE_SCROLL',
            position: [
                initial[ 0 ] + movement[ 0 ],
                initial[ 1 ] + movement[ 1 ],
            ],
        });
    }, {
        target: window,
    });

    useGesture({
        onPointerMove: ({ event }) => {
            dispatch({
                type: 'UPDATE_POINTER',
                position: [ event.clientX, event.clientY ],
                scrollPosition: [ window.scrollX, window.scrollY ],
            });
        },
        onClick: () => {
            dispatch({ type: 'CANCEL' });
        },
    }, {
        target: document,
    });

    return <moveContext.Provider value={value}>{children}</moveContext.Provider>;
};
