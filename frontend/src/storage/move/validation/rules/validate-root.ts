import { BoxType, type BoxDTO, type InventoryItemDTO, type PkmBaseDTO, type SaveInfosDTO } from '../../../../data/sdk/model';
import type { StorageMode } from '../../../../ui/inventory/context/storage-mode-context';
import type { DropValidationResult } from '../types';

type Box = Pick<BoxDTO, 'id' | 'type' | 'name' | 'slotCount'>;
type Pkm = Pick<PkmBaseDTO, 'boxSlot' | 'canMove' | 'nickname' | 'context' | 'contextVersion' | 'heldItem' | 'canHeldItem' | 'canEdit'>;
type Save = Pick<SaveInfosDTO, 'id' | 'displayedVersion'>;

export type ValidateRootSlot = {
    mode: StorageMode;
    sourceSave?: Save;
    sourceBox?: Box;
    sourcePkm?: Pkm;
    sourceItem?: Pick<InventoryItemDTO, 'boxSlot' | 'id' | 'item' | 'version' | 'count' | 'canBeHeld'>;
    targetSave?: Save;
    targetBox?: Box;
    targetPkm?: Pkm;
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
