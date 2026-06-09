import { useMoveContext } from '../context/use-move-context';
import { useDragTriggers } from './dragging/use-drag-triggers';

export type UseDraggingReturn = ReturnType<typeof useDragging>;

/**
 * Translate item rendering following given entity moving state.
 * If entity is not moving, do nothing.
 */
export const useDragging = function <C>(entityId: string, containerValue: C, isCurrentTarget: boolean = true) {
    const { getContainerHash, useMoveStore } = useMoveContext<C>();

    const containerHash = getContainerHash(containerValue);

    const isDragging = useMoveStore(({ state }) =>
        state.status === 'dragging'
        && state.source.containerId === containerHash
        && state.source.ids.has(entityId));

    const { ref, ...triggers } = useDragTriggers(entityId, containerValue, isCurrentTarget, isDragging);

    return {
        ref,
        ...triggers,
        isDragging,
    };
};
