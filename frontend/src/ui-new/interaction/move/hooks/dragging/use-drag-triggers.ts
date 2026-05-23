import { useDrag, type Vector2 } from '@use-gesture/react';
import React from 'react';
import { useSelectContextNullable } from '../../../select/context/use-select-context';
import { useMoveContext } from '../../context/use-move-context';
import type { DraggingTrigger } from '../../state/move-state';
import { useDragUtils, type PossibleEvent } from '../use-drag-utils';

export const useDragTriggers = <C>(entityId: string, containerValue: C, isDragging: boolean) => {
    const ref = React.useRef<HTMLButtonElement>(null);

    const { getContainerHash, useMoveStore, positionsRef, dragEndTimestampRef } = useMoveContext<C>();

    const containerHash = getContainerHash(containerValue);

    const selectCtx = useSelectContextNullable();

    const dispatch = useMoveStore(({ dispatch }) => dispatch);

    const dragUtils = useDragUtils();

    const getAllIds = () => {
        const set = new Set<string>([ entityId ]);
        const selectState = selectCtx?.useSelectStore.getState();
        if (selectState && selectState.container === getContainerHash(containerValue)) {
            selectState.ids.forEach(id => set.add(id));
        }
        return set;
    };

    const updateDragPosition = (position: Vector2) => {
        positionsRef.current.drag = position;
    };

    const startDrag = <P>(e: PossibleEvent | undefined, trigger: DraggingTrigger, position: Vector2, params: P) => {
        // pointerUp often triggers click event with exact same timeStamp
        if (e?.timeStamp && dragEndTimestampRef.current
            && e.timeStamp - dragEndTimestampRef.current < 50
        )
            return;

        const bounds = ref.current?.getBoundingClientRect();

        positionsRef.current.target = [
            bounds?.left ?? 0,
            bounds?.top ?? 0,
        ];

        updateDragPosition(position);

        dispatch({
            type: 'START_DRAG',
            source: {
                containerId: containerHash,
                sourceId: entityId,
                ids: getAllIds(),
                params,
            },
            trigger,
        });
    };

    const startDragByDrag = (e: PossibleEvent | undefined, position: Vector2) => startDrag(e, 'drag', position, null);

    const startDragByClick = <P>(e: PossibleEvent | undefined, position: Vector2, params: P) => {

        positionsRef.current.pointerInitial = position;
        positionsRef.current.pointer = position;

        startDrag(e, 'click', position, params);
    };

    const startDragByFocus = <P>(e: PossibleEvent | undefined, position: Vector2, params: P) => startDrag(e, 'focus', position, params);

    const toggleDragByClick = <P>(e: PossibleEvent | undefined, params: P) => {
        if (!ref.current) return;

        e?.stopPropagation?.();

        // console.log('drag - click')

        const state = useMoveStore.getState().state;

        if (state.status === 'dragging') {
            dragUtils.stopDrag(e);
        } else {
            const { left, top } = ref.current.getBoundingClientRect();

            startDragByClick(e, [ left, top ], params);
        }
    };

    const toggleDragByFocus = <P>(e: PossibleEvent | undefined, params: P) => {
        if (!ref.current) return;

        e?.stopPropagation?.();

        // console.log('drag - focus')

        const state = useMoveStore.getState().state;

        if (state.status === 'dragging') {
            dragUtils.stopDrag(e);
        } else {
            const { left, top } = ref.current.getBoundingClientRect();

            startDragByFocus(e, [ left, top ], params);
        }
    };

    const drag = useDrag(({ initial, movement, active, event }) => {
        // console.log(entityId, 'move', { movement, initial });

        const position: Vector2 = [
            initial[ 0 ] + movement[ 0 ],
            initial[ 1 ] + movement[ 1 ],
        ];

        // console.log(...position)

        const state = useMoveStore.getState().state;

        switch (state.status) {
            case 'dragging':
                if (!isDragging || state.trigger !== 'drag')
                    return;

                if (active)
                    updateDragPosition(position);
                else
                    dragUtils.stopDrag(event);
                return;
            case 'idle':
                if (active)
                    startDragByDrag(event, position);
                return;
            case 'loading':
                return;
        }
    }, {
        delay: 400,
        pointer: {
            // required to avoid drag-end trigger onClick
            capture: false,

            keys: false,
            lock: false,
            touch: false,
            mouse: false,
        },
    });

    const dragListeners = drag();

    return {
        ref,
        onPointerDown: dragListeners.onPointerDown,
        startDragByClick,
        startDragByFocus,
        toggleDragByClick,
        toggleDragByFocus,
        ...dragUtils,
    };
};
