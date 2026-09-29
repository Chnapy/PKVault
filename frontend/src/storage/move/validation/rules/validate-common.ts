import { BoxType } from '../../../../data/sdk/model';
import type { DropValidationResult, SlotInfos } from '../types';

export const validateCommon = (
    slotInfos: SlotInfos,
    attached: boolean,
): DropValidationResult => {
    switch (slotInfos.mode) {
        case 'inventory':
            if (slotInfos.sourceBox?.id === slotInfos.targetBox?.id
                && slotInfos.sourceBox?.type === BoxType.Inventory)
                return {
                    canDrop: false,
                    reason: 'item-same-inventory',
                    slotInfos,
                };

            if ((slotInfos.sourcePkm && !slotInfos.sourcePkm.canHeldItem)
                || (slotInfos.targetPkm && !slotInfos.targetPkm.canHeldItem))
                return {
                    canDrop: false,
                    reason: 'item-cannot-be-held',
                    slotInfos,
                };
            break;
        case 'default':
            if (attached && slotInfos.targetPkm) {
                return {
                    canDrop: false,
                    reason: 'attached-target-occupied',
                    slotInfos,
                };
            }

            if (slotInfos.sourcePkm && !slotInfos.sourcePkm.canMove) {
                return {
                    canDrop: false,
                    reason: 'pkm-cannot-move',
                    slotInfos,
                };
            }
            break;

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
