import type { DropValidationResult, SlotInfos } from '../types';

export const validateMainToMain = (
    slotInfos: Extract<SlotInfos, { sourceType: 'main' }>,
    attached: boolean,
): DropValidationResult => {
    if (attached) {
        return {
            canDrop: false,
            reason: 'attached-main-to-main',
            slotInfos,
        };
    }

    if (slotInfos.sourcePkm.id === slotInfos.targetPkm?.id) {
        return {
            canDrop: false,
            reason: 'same-pkm-id',
            slotInfos,
        };
    }

    if (slotInfos.direction === 'main-to-bank') {
        if (slotInfos.sourceBox.bankId === slotInfos.targetBank.id) {
            return {
                canDrop: false,
                reason: 'main-to-same-bank',
                slotInfos,
            };
        }
    }

    return { canDrop: true };
};
