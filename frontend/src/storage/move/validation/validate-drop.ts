import type { PkmVariantIndexes } from '../../../data/hooks/use-pkm-variant-index';
import type { StaticData } from '../../../hooks/use-static-data';
import type { MoveParams } from '../move-container-fns';
import { validateRoot } from './rules/validate-root';
import { swapSlotInfos } from './slot-infos/swap-slot-infos';
import type { DropValidationResult, SlotInfos } from './types';
import { validateSlotPair } from './validate-slot-pair';

export const validateDrop = (
    params: MoveParams | undefined,
    slotInfosList: SlotInfos[],
    pkmVariantIndexes: PkmVariantIndexes,
    staticData: StaticData,
): DropValidationResult => {

    const rootResult = validateRoot(slotInfosList);
    if (!rootResult.canDrop) return rootResult;

    for (const info of slotInfosList) {
        const result = validateSlotPair(
            info,
            params?.attached ?? false,
            pkmVariantIndexes,
            staticData,
        );
        if (!result.canDrop) return result;

        // swap validation if target pkm
        if (info.targetPkm) {
            const swapInfo = swapSlotInfos(info);

            const swapResult = validateSlotPair(
                swapInfo,
                params?.attached ?? false,
                pkmVariantIndexes,
                staticData,
            );
            if (!swapResult.canDrop) return swapResult;
        }
    }

    return { canDrop: true };
}
