import { useMoveContext } from '../context/use-move-context';

/**
 * Is submitting move action.
 */
export const useDragSubmitting = <C>(containerValue: C, targetId?: string) => {
    const { getContainerHash, useMoveStore } = useMoveContext();

    return useMoveStore(({state}) => {
        if (state.status !== 'loading')
            return false;

        const { source } = state;

        // Is targetId in source
        if (targetId !== undefined) {
            return source.containerId === getContainerHash(containerValue)
                && source.ids.has(targetId);
        }

        return false;
    });
};
