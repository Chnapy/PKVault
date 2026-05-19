import React from 'react';
import { useSelectContextNullable } from '../../select/context/use-select-context';
import { useMoveContext } from '../context/use-move-context';

type UseDraggableReturn = {
    startDrag?: () => void;
    onPointerMove?: (e: React.PointerEvent) => void;
};

/**
 * Allow trigger dragging
 */
export const useDraggable = <C>(containerValue: C, itemIds: string[]): UseDraggableReturn => {
    const { getContainerHash, useMoveStore } = useMoveContext();

    const selectCtx = useSelectContextNullable();

    const dispatch = useMoveStore(({dispatch}) => dispatch);
    const statusIsIdle = useMoveStore(({state}) => state.status === 'idle');

    if (!statusIsIdle) {
        return {};
    }

    const getAllIds = () => {
        const set = new Set<string>(itemIds);
        const selectState = selectCtx?.useSelectStore.getState();
        if (selectState && selectState.container === getContainerHash(containerValue)) {
            selectState.ids.forEach(id => set.add(id));
        }
        return set;
    };

    const startDrag = itemIds.length > 0
        ? () => {
            dispatch({
                type: 'START_DRAG',
                source: {
                    containerId: getContainerHash(containerValue),
                    ids: getAllIds(),
                },
            });
        }
        : undefined;

    let enablePointerMove = true;

    return {
        startDrag,
        onPointerMove: startDrag
            ? (e: React.PointerEvent) => {
                if (enablePointerMove && e.buttons === 1) {
                    enablePointerMove = false;
                    startDrag();
                }
            }
            : undefined,
    };
};
