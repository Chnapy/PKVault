import type { DropValidationResult, SlotInfos } from '../types';

export const validateCommon = (
    slotInfos: SlotInfos,
    attached: boolean,
): DropValidationResult => {
    if (attached && slotInfos.targetPkm) {
        return {
            canDrop: false,
            reason: 'attached-target-occupied',
            slotInfos,
        };
    }

    if (!slotInfos.sourcePkm.canMove) {
        return {
            canDrop: false,
            reason: 'pkm-cannot-move',
            slotInfos,
        };
    }

    if (slotInfos.direction === 'main-to-bank'
        || slotInfos.direction === 'save-to-bank'
    ) {
        if (slotInfos.targetBank.isExternal) {
            return {
                canDrop: false,
                reason: 'bank-external',
                slotInfos,
            };
        }
    }

    return { canDrop: true };
};
