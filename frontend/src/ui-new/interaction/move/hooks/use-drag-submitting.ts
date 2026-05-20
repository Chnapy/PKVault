import { useMoveContext } from '../context/use-move-context';

/**
 * Is submitting move action.
 */
export const useDragSubmitting = <C>(containerValue: C, pos: number, id?: string) => {
    const { getContainerHash, useMoveStore } = useMoveContext();

    return useMoveStore(({ state }) => {
        if (state.status !== 'loading')
            return false;

        const { source, target } = state;

        const containerHash = getContainerHash(containerValue);

        const isIdInSource = id !== undefined
            && source.containerId === containerHash
            && source.ids.has(id);
        if (isIdInSource)
            return true;

        const isPosInTarget = target.targetContainerId === containerHash
            && Object.values(target.targetAllPositions).includes(pos);

        return isPosInTarget;
    });
};
