import { BoxType, type BoxDTO, type InventoryItemDTO, type PkmBaseDTO, type SaveInfosDTO } from '../../../../data/sdk/model';
import type { StorageMode } from '../../../../ui/inventory/context/storage-mode-context';
import type { DropValidationResult } from '../types';

export type ValidateRootSlot = {
    mode: StorageMode;
    sourceBox?: Pick<BoxDTO, 'id' | 'type' | 'name' | 'slotCount'>;
    sourcePkm?: Pick<PkmBaseDTO, 'boxSlot' | 'canMove' | 'nickname' | 'context' | 'contextVersion' | 'heldItem' | 'canHeldItem' | 'canEdit'>;
    sourceItem?: Pick<InventoryItemDTO, 'boxSlot' | 'id' | 'item' | 'version' | 'count'>;
    targetSave?: Pick<SaveInfosDTO, 'version'>;
    targetBox?: Pick<BoxDTO, 'id' | 'type' | 'name' | 'slotCount'>;
    targetPkm?: Pick<PkmBaseDTO, 'boxSlot' | 'canMove' | 'nickname' | 'context' | 'contextVersion' | 'heldItem' | 'canHeldItem' | 'canEdit'>;
    targetSlot?: number;
};

export const validateRoot = (slotInfosList: ValidateRootSlot[]): DropValidationResult => {
    if (slotInfosList.length === 0) {
        return { canDrop: false, reason: 'empty-slot-infos', slotInfos: undefined };
    }

    switch (slotInfosList[ 0 ]?.mode ?? 'default') {
        case "default": {
            const targetBox = slotInfosList[ 0 ]?.targetBox;
            if (targetBox) {

                // Bounds check
                const slotCount = (targetBox?.slotCount ?? 0) - 1;
                if (slotInfosList.some(info => typeof info.targetSlot === 'number'
                    && (info.targetSlot < 0 || info.targetSlot > slotCount)
                )) {
                    return { canDrop: false, reason: 'out-of-bounds', slotInfos: undefined };
                }
            }
            break;
        }
        case "inventory": {
            if (slotInfosList.length > 1
                && slotInfosList.some(infos => infos.targetPkm)
            ) {
                return { canDrop: false, reason: 'multiple-items-to-pkm', slotInfos: undefined };
            }

            if (slotInfosList.some(infos => infos.targetBox?.type !== BoxType.Inventory
                && !infos.targetPkm
            )) {
                return { canDrop: false, reason: 'items-to-pkm-empty-slot', slotInfos: undefined };
            }
            break;
        }
    }

    return { canDrop: true };
};
