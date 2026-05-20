import { type Vector2, useDrag } from '@use-gesture/react';
import React from 'react';
import { useSelectContextNullable } from '../../../select/context/use-select-context';
import { useMoveContext } from '../../context/use-move-context';
import type { DraggingTrigger } from '../../state/move-state';

export const useDragTriggers = <C>(entityId: string, containerValue: C, isDragging: boolean) => {
    const ref = React.useRef<HTMLButtonElement>(null);

    const { getContainerHash, useMoveStore } = useMoveContext<C>();

    const containerHash = getContainerHash(containerValue);

    const selectCtx = useSelectContextNullable();

    const dispatch = useMoveStore(({ dispatch }) => dispatch);

    const getBasePosition = React.useCallback((): Vector2 => [
        ref.current?.offsetLeft ?? 0,
        ref.current?.offsetTop ?? 0,
    ], []);

    const getAllIds = () => {
        const set = new Set<string>([ entityId ]);
        const selectState = selectCtx?.useSelectStore.getState();
        if (selectState && selectState.container === getContainerHash(containerValue)) {
            selectState.ids.forEach(id => set.add(id));
        }
        return set;
    };

    const startDrag = (trigger: DraggingTrigger, position: Vector2, scrollPosition: Vector2) => {
        dispatch({
            type: 'START_DRAG',
            source: {
                containerId: containerHash,
                sourceId: entityId,
                ids: getAllIds(),
            },
            trigger,
            basePosition: getBasePosition(),
            position,
            scrollPosition,
        });
    };

    const startDragByDrag = (position: Vector2) => startDrag('drag', position, [window.scrollX, window.scrollY]);

    const startDragByClick = (position: Vector2) => startDrag('click', position, [window.scrollX, window.scrollY]);

    const startDragByFocus = (position: Vector2) => startDrag('focus', position, [0,0]);

    const stopDrag = () => {
        dispatch({ type: 'CANCEL' });
    };

    const toggleDragByClick = (e?: React.BaseSyntheticEvent) => {
        if (!ref.current) return;

        e?.stopPropagation?.();

        const state = useMoveStore.getState().state;

        if (state.status === 'dragging') {
            stopDrag();
        } else {
            const { left, top } = ref.current.getBoundingClientRect();

            startDragByClick([ left, top ]);
        }
    };

    const toggleDragByFocus = (e?: React.BaseSyntheticEvent) => {
        if (!ref.current) return;

        e?.stopPropagation?.();

        const state = useMoveStore.getState().state;

        if (state.status === 'dragging') {
            stopDrag();
        } else {
            const { left, top } = ref.current.getBoundingClientRect();

            startDragByFocus([ left, top ]);
        }
    };

    const updateDragPosition = (position: Vector2) => dispatch({
        type: 'UPDATE_DRAG',
        position,
    });

    const drag = useDrag(({ initial, movement, active }) => {
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

                // console.log('drag - run', active)
                if (active)
                    updateDragPosition(position);
                else
                    stopDrag();
                return;
            case 'idle':
                if (active)
                    startDragByDrag(position);
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

    const focusNode = (node: Element) => {
        const { left, top } = node.getBoundingClientRect();

        const position: Vector2 = [ left, top ];

        dispatch({
            type: 'UPDATE_FOCUS',
            position,
        });
    };

    const dragListeners = drag();

    return {
        ref,
        onPointerDown: dragListeners.onPointerDown,
        focusNode,
        startDragByClick,
        startDragByFocus,
        toggleDragByClick,
        toggleDragByFocus,
        stopDrag,
    };
};
