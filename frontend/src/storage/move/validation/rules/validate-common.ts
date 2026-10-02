import { BoxType } from '../../../../data/sdk/model';
import type { StaticData } from '../../../../hooks/use-static-data';
import type { DropValidationResult, SlotInfos } from '../types';

export const validateCommon = (
    slotInfos: SlotInfos,
    attached: boolean,
    staticData: StaticData,
): DropValidationResult => {
    switch (slotInfos.mode) {
        case 'inventory': {
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

            const sourceVersion = slotInfos.sourceItem?.version ?? slotInfos.sourcePkm?.contextVersion;
            const sourceHeldItem = slotInfos.sourceItem?.item ?? slotInfos.sourcePkm?.heldItem;
            const targetVersion = slotInfos.targetSave?.version ?? slotInfos.targetPkm?.contextVersion;

            if (sourceVersion && sourceHeldItem && targetVersion) {
                const itemKey = staticData.getItemKey(sourceVersion, sourceHeldItem);
                const isItemCompatible = !itemKey || staticData.isItemCompatible(targetVersion, itemKey);

                if (!isItemCompatible)
                    return {
                        canDrop: false,
                        reason: 'item-not-compatible',
                        slotInfos,
                    };
            }
            break;
        }
        case 'default':
            if (slotInfos.targetBox?.type === BoxType.Inventory)
                return {
                    canDrop: false,
                    reason: 'pkm-to-inventory',
                    slotInfos,
                };

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
