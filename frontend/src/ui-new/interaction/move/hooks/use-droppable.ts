import { useMoveContext } from '../context/use-move-context';
import type { MoveSource } from '../state/move-state';

export type UseMoveDroppableReturn = {
    isDragging: boolean;
    onClick?: () => Promise<void>;
    onPointerUp?: () => Promise<void>;
};

/**
 * Estimate if given position can receive currently moving entity.
 * If no moving entity, do nothing.
 */
export const useDroppable = <T>(
    target: T,
    onDropSuccess?: (source: MoveSource) => Promise<unknown>,
): UseMoveDroppableReturn => {
    const { useMoveStore } = useMoveContext();

    const dispatch = useMoveStore(({ dispatch }) => dispatch);
    const isDragging = useMoveStore(({ state }) =>
        state.status === 'dragging'
        && state.source.ids.size > 0);

    if (!isDragging) {
        return {
            isDragging: false,
        };
    }

    const onDrop = onDropSuccess
        ? async () => {
            const state = useMoveStore.getState().state;
            if (state.status !== 'dragging')
                throw new Error('Invalid status');

            dispatch({
                type: 'DROP',
                target,
            });

            await onDropSuccess(state.source)
                .finally(() => {
                    dispatch({
                        type: 'COMPLETE',
                    });
                });
        }
        : undefined;

    return {
        isDragging: true,
        onClick: onDrop,
        onPointerUp: onDrop,
    };
};
