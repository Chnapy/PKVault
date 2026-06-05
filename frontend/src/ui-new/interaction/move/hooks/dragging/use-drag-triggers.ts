import { useDrag, type Vector2 } from '@use-gesture/react';
import React from 'react';
import { useSelectContextNullable } from '../../../select/context/use-select-context';
import { useMoveContext } from '../../context/use-move-context';
import type { DraggingTrigger, MoveSource } from '../../state/move-state';
import { useDragUtils, type PossibleEvent } from '../use-drag-utils';

export const useDragTriggers = <C>(entityId: string, containerValue: C, isDragging: boolean) => {
    const ref = React.useRef<HTMLButtonElement>(null);

    const { getContainerHash, useMoveStore, useFilterStartDragIds, positionsRef, dragEndTimestampRef } = useMoveContext<C>();

    const containerHash = getContainerHash(containerValue);

    const selectCtx = useSelectContextNullable();

    const dispatch = useMoveStore(({ dispatch }) => dispatch);

    const dragUtils = useDragUtils();

    const selectIds = selectCtx?.useSelectStore(s => s.ids.has(entityId) && s.container === containerHash
        ? s.ids
        : undefined);

    const getAllIds = () => {
        const set = new Set<string>([ entityId ]);
        selectIds?.forEach(id => set.add(id));
        return set;
    };

    const filterStartDragIds = useFilterStartDragIds(containerValue, [ ...getAllIds() ]);

    const enabled = filterStartDragIds().size > 0;

    const updateDragPosition = (position: Vector2) => {
        positionsRef.current.drag = position;
    };

    const startDrag = <P>(e: PossibleEvent | undefined, trigger: DraggingTrigger, position: Vector2, params: P): boolean => {
        // pointerUp often triggers click event with exact same timeStamp
        if (e?.timeStamp && dragEndTimestampRef.current
            && e.timeStamp - dragEndTimestampRef.current < 50
        )
            return false;

        const source: MoveSource = {
            containerId: containerHash,
            sourceId: entityId,
            ids: getAllIds(),
            params,
        };

        source.ids = filterStartDragIds(params);

        if (source.ids.size === 0) {
            return false;
        }

        const bounds = ref.current?.getBoundingClientRect();

        positionsRef.current.target = [
            bounds?.left ?? 0,
            bounds?.top ?? 0,
        ];

        updateDragPosition(position);

        dispatch({
            type: 'START_DRAG',
            source,
            trigger,
        });
        return true;
    };

    const startDragByDrag = (e: PossibleEvent | undefined, position: Vector2) => startDrag(e, 'drag', position, undefined);

    const drag = useDrag(({ initial, movement, active, event, cancel }) => {
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
                    break;

                if (active)
                    updateDragPosition(position);
                else
                    dragUtils.stopDrag(event);
                return;
            case 'idle':
                if (active) {
                    const dragStarted = startDragByDrag(event, position);
                    if (dragStarted)
                        return;
                }
                break;
            case 'loading':
                break;
        }
        cancel();
    }, {
        enabled,
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

    const useDragFn = <P>(params?: P) => {
        const filteredIds = useFilterStartDragIds(
            containerValue,
            [ ...getAllIds() ]
        )(params);

        const enabled = filteredIds.size > 0;

        const startDragByClick = (e: PossibleEvent | undefined, position: Vector2) => {

            positionsRef.current.pointerInitial = position;
            positionsRef.current.pointer = position;

            return startDrag(e, 'click', position, params);
        };

        const startDragByFocus = (e: PossibleEvent | undefined, position: Vector2) => startDrag(e, 'focus', position, params);

        const toggleDragByClick = (e: PossibleEvent | undefined) => {
            if (!ref.current) return;

            e?.stopPropagation?.();

            // console.log('drag - click')

            const state = useMoveStore.getState().state;

            if (state.status === 'dragging') {
                dragUtils.stopDrag(e);
            } else {
                const { left, top } = ref.current.getBoundingClientRect();

                startDragByClick(e, [ left, top ]);
            }
        };

        const toggleDragByFocus = (e: PossibleEvent | undefined) => {
            if (!ref.current) return;

            e?.stopPropagation?.();

            // console.log('drag - focus')

            const state = useMoveStore.getState().state;

            if (state.status === 'dragging') {
                dragUtils.stopDrag(e);
            } else {
                const { left, top } = ref.current.getBoundingClientRect();

                startDragByFocus(e, [ left, top ]);
            }
        };

        const listeners = filteredIds.size > 0
            ? {
                startDragByClick,
                startDragByFocus,
                toggleDragByClick,
                toggleDragByFocus,
            }
            : undefined;

        return {
            enabled,
            filteredIds,
            ...listeners,
        };
    };

    return {
        ref,
        getAllIds,
        useDrag: useDragFn,
        onPointerDown: enabled ? dragListeners.onPointerDown : undefined,
        ...dragUtils,
    };
};
