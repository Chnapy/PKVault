import type React from 'react';
import { useShallow } from 'zustand/shallow';
import type { MoveTargetInput } from '../context/move-context';
import { useMoveContext } from '../context/use-move-context';
import { useDragUtils, type DragUtils } from './use-drag-utils';

export type UseDroppableReturn = DragUtils & {
    isDroppable: boolean;
    onDrop?: (e: Event | React.BaseSyntheticEvent) => Promise<unknown>;
    onClick?: (e: React.MouseEvent<never, MouseEvent>) => Promise<unknown>;
    onPointerUp?: (e: React.PointerEvent<never>) => Promise<unknown>;
};

/**
 * Estimate if given position can receive currently moving entity.
 * If no moving entity, do nothing.
 */
export const useDroppable = <C>(target: MoveTargetInput<C>): UseDroppableReturn => {
    const { useMoveStore, drop } = useMoveContext<C>();

    const dragUtils = useDragUtils();

    const { isDroppable, clickable, pointerUp } = useMoveStore(useShallow(({ state }) => {

        const isDroppable = state.status === 'dragging' 
            && state.source.ids.size > 0
            && (
                !target.targetId
                || state.source.sourceId !== target.targetId
            );
        
        return {
            isDroppable,
            clickable: isDroppable && state.trigger !== 'drag',
            pointerUp: isDroppable && state.trigger === 'drag',
        };
    }));

    if (!isDroppable) {
        return {
            ...dragUtils,
            isDroppable: false,
        };
    }

    const onDrop = () => {
        return drop(target);
    };

    return {
        ...dragUtils,
        isDroppable: true,
        onDrop,
        onClick: clickable ? onDrop : undefined,
        onPointerUp: pointerUp ? onDrop : undefined,
    };
};
