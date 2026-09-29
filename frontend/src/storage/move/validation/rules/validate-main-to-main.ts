import type { BankDTO, BoxDTO, InventoryItemDTO, PkmVariantDTO } from '../../../../data/sdk/model';
import type { DropValidationResult } from '../types';
import type { ValidateRootSlot } from './validate-root';

type Pkm = Pick<PkmVariantDTO, 'id'>;

export type ValidateMainToMainSlot = ValidateRootSlot & {
    direction: 'main-to-main';
    sourcePkm?: Pkm;
    sourceItem?: Pick<InventoryItemDTO, 'id' | 'item' | 'version' | 'count'>;
    targetPkm?: Pkm;
};

export type ValidateMainToMainBank = ValidateRootSlot & {
    direction: 'main-to-bank';
    sourceBox: Pick<BoxDTO, 'bankId'>;
    sourcePkm?: Pkm;
    sourceItem?: Pick<InventoryItemDTO, 'id' | 'item' | 'version' | 'count'>;
    targetBank: Pick<BankDTO, 'id' | 'isExternal'>;
    targetPkm?: undefined;
};

export const validateMainToMain = (
    slotInfos: ValidateMainToMainSlot | ValidateMainToMainBank,
    attached: boolean,
): DropValidationResult => {
    switch (slotInfos.mode) {
        case 'inventory':
            break;
        case 'default':
            if (attached) {
                return {
                    canDrop: false,
                    reason: 'attached-main-to-main',
                    slotInfos,
                };
            }
            break;
    }

    if (slotInfos.sourcePkm && slotInfos.sourcePkm.id === slotInfos.targetPkm?.id) {
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
