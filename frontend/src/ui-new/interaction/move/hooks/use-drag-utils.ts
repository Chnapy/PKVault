import { type Vector2 } from '@use-gesture/react';
import React from 'react';
import { useMoveContext } from '../context/use-move-context';

export type PossibleEvent = Partial<Pick<React.BaseSyntheticEvent, 'stopPropagation' | 'timeStamp'>>;

export type DragUtils = {
    focusNode: (node: Element) => void;
    stopDrag: (e: PossibleEvent | undefined) => void;
};

export const useDragUtils = () => {
    const { useMoveStore, positionsRef, dragEndTimestampRef } = useMoveContext();

    const dispatch = useMoveStore(({ dispatch }) => dispatch);

    const updateDragPosition = (position: Vector2) => {
        positionsRef.current.drag = position;
    };

    const stopDrag = (e: PossibleEvent | undefined) => {
        dragEndTimestampRef.current = e?.timeStamp ?? 0;
        dispatch({ type: 'CANCEL' });
    };

    const focusNode = (node: Element) => {
        const { left, top, width, height } = node.getBoundingClientRect();

        const position: Vector2 = [ left + width, top + height ];

        updateDragPosition(position);

        dispatch({ type: 'UPDATE_FOCUS' });
    };

    return {
        focusNode,
        stopDrag,
    };
};
