import { BoxType, GameVersion } from '../../../../data/sdk/model';
import type { DropValidationResult, SlotInfos } from '../types';

export type IsItemCompatibleFn = (sourceHeldItem: number, sourceVersion: GameVersion, targetVersion: GameVersion) => boolean;

export const validateCommon = (
    slotInfos: SlotInfos,
    attached: boolean,
    isItemCompatible: IsItemCompatibleFn,
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

            if ((slotInfos.sourcePkm && (
                !slotInfos.sourcePkm.canHeldItem
                || !slotInfos.sourcePkm.canEdit
            ))
                || (slotInfos.targetPkm && (
                    !slotInfos.targetPkm.canHeldItem
                    || !slotInfos.targetPkm.canEdit
                )))
                return {
                    canDrop: false,
                    reason: 'item-not-compatible',
                    slotInfos,
                };

            const sourceVersion = slotInfos.sourceItem?.version ?? slotInfos.sourcePkm?.contextVersion;
            const sourceHeldItem = slotInfos.sourceItem?.item ?? slotInfos.sourcePkm?.heldItem;
            const targetVersion = slotInfos.targetSave?.displayedVersion ?? slotInfos.targetPkm?.contextVersion;

            if (sourceVersion && sourceHeldItem && targetVersion) {
                if (!isItemCompatible(sourceHeldItem, sourceVersion, targetVersion)) {
                    console.log({ sourceHeldItem, sourceVersion, targetVersion })
                    return {
                        canDrop: false,
                        reason: 'item-not-compatible',
                        slotInfos,
                    };
                }
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
