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

    const isDroppable = useMoveStore(({ state }) =>
        state.status === 'dragging' 
        && state.source.ids.size > 0
        && (
            !target.targetId
            || state.source.sourceId !== target.targetId
        ));

    const clickable = useMoveStore(({ state }) =>
        state.status === 'dragging' && state.trigger !== 'drag');

    if (!isDroppable) {
        return {
            isDroppable: false,
        };
    }

    const pointerUp = !clickable;

    const onDrop = () => drop(target);

    return {
        isDroppable: true,
        onClick: clickable ? onDrop : undefined,
        onPointerUp: pointerUp ? onDrop : undefined,
    };
};
