import type { BankDTO, BoxDTO, PkmVariantDTO } from '../../../../data/sdk/model';
import type { DropValidationResult } from '../types';
import type { ValidateRootSlot } from './validate-root';

type Pkm = Pick<PkmVariantDTO, 'id'>;

export type ValidateMainToMainSlot = ValidateRootSlot & {
    direction: 'main-to-main';
    sourcePkm: Pkm;
    targetPkm?: Pkm;
};

export type ValidateMainToMainBank = ValidateRootSlot & {
    direction: 'main-to-bank';
    sourceBox: Pick<BoxDTO, 'bankId'>;
    sourcePkm: Pkm;
    targetBank: Pick<BankDTO, 'id' | 'isExternal'>;
    targetPkm?: undefined;
};

export const validateMainToMain = (
    slotInfos: ValidateMainToMainSlot | ValidateMainToMainBank,
    attached: boolean,
): DropValidationResult => {
    if (attached) {
        return {
            canDrop: false,
            reason: 'attached-main-to-main',
            slotInfos,
        };
    }
    // if (slotInfos.targetSlot === 0 && slotInfos.sourcePkm.id === 'canMove')
    //     console.log(slotInfos.sourcePkm, slotInfos.targetPkm)
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
