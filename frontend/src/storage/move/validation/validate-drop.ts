import type { PkmVariantIndexes } from '../../../data/hooks/use-pkm-variant-index';
import type { MoveState } from '../state/move-state';
import { validateRoot } from './rules/validate-root';
import { swapSlotInfos } from './slot-infos/swap-slot-infos';
import type { DropValidationResult, SlotInfos } from './types';
import { validateSlotPair } from './validate-slot-pair';

export const validateDrop = (
    moveState: Extract<MoveState, { status: 'dragging' }>,
    slotInfosList: SlotInfos[],
    pkmVariantIndexes: PkmVariantIndexes,
): DropValidationResult => {

    const rootResult = validateRoot(slotInfosList);
    if (!rootResult.canDrop) return rootResult;

    for (const info of slotInfosList) {
        const result = validateSlotPair(
            info,
            moveState.source.attached ?? false,
            pkmVariantIndexes,
        );
        if (!result.canDrop) return result;

        // swap validation if target pkm
        if (info.targetPkm) {
            const swapInfo = swapSlotInfos(info);

            const swapResult = validateSlotPair(
                swapInfo,
                moveState.source.attached ?? false,
                pkmVariantIndexes,
            );
            if (!swapResult.canDrop) return swapResult;
        }
    }

    return { canDrop: true };
}
