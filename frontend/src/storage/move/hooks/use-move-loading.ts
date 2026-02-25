import { MoveContext } from '../context/move-context';

/**
 * Is submitting move action to backend for given position/pkm.
 */
export const useMoveLoading = (saveId: number | undefined, boxId: number, boxSlot: number, pkmId?: string) => {
    const { state } = MoveContext.useValue();

    if (state.status !== 'loading') {
        return false;
    }

    const { source, target } = state;

    return (
        source.saveId === saveId && !!pkmId && source.ids.includes(pkmId)
    ) || (
            target.type === 'slot' && target.saveId === saveId && target.boxId === boxId && target.boxSlots.includes(boxSlot)
        );
};
