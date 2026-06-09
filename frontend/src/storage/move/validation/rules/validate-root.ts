import type { BoxDTO, PkmBaseDTO } from '../../../../data/sdk/model';
import type { DropValidationResult } from '../types';

export type ValidateRootSlot = {
    sourceBox?: Pick<BoxDTO, 'slotCount'>;
    sourcePkm: Pick<PkmBaseDTO, 'boxSlot' | 'canMove'>;
    targetBox?: Pick<BoxDTO, 'slotCount'>;
    targetPkm?: Pick<PkmBaseDTO, 'boxSlot' | 'canMove'>;
    targetSlot?: number;
};

export const validateRoot = (slotInfosList: ValidateRootSlot[]): DropValidationResult => {
    if (slotInfosList.length === 0) {
        return { canDrop: false, reason: 'empty-slot-infos', slotInfos: undefined };
    }

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

    return { canDrop: true };
};
