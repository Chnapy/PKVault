import { useShallow } from 'zustand/shallow';
import type { MoveTargetInput } from '../context/move-context';
import { useMoveContext } from '../context/use-move-context';

export type UseMoveDroppableReturn = {
    isDroppable: boolean;
    onClick?: () => Promise<unknown>;
    onPointerUp?: () => Promise<unknown>;
};

/**
 * Estimate if given position can receive currently moving entity.
 * If no moving entity, do nothing.
 */
export const useDroppable = <C>(target: MoveTargetInput<C>): UseMoveDroppableReturn => {
    const { useMoveStore, drop } = useMoveContext<C>();

    const { isDroppable, clickable, pointerUp } = useMoveStore(useShallow(({ state }) => {

        const isDroppable = state.status === 'dragging' 
            && state.source.ids.size > 0
            && (
                !target.targetId
                || state.source.sourceId !== target.targetId
            );
        
        return ({
            isDroppable,
            clickable: isDroppable && state.trigger !== 'drag',
            pointerUp: isDroppable && state.trigger === 'drag',
        });
    }));

    if (!isDroppable) {
        return {
            isDroppable: false,
        };
    }

    const onDrop = () => drop(target);

    return {
        isDroppable: true,
        onClick: clickable ? onDrop : undefined,
        onPointerUp: pointerUp ? onDrop : undefined,
    };
};
