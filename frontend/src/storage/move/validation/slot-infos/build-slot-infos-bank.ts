import type { PkmSaveIndexes } from '../../../../data/hooks/use-pkm-save-index';
import type { PkmVariantIndexes } from '../../../../data/hooks/use-pkm-variant-index';
import type { BankDTO, BoxDTO, SaveInfosDTO, StorageGetInventoryItems200 } from '../../../../data/sdk/model';
import type { StorageMode } from '../../../../ui/inventory/context/storage-mode-context';
import type { ValidateMainToMainBank } from '../rules/validate-main-to-main';
import type { ValidateSaveToMainBank } from '../rules/validate-save-to-main';

export type SlotInfosBank =
    | ValidateMainToMainBank
    | ValidateSaveToMainBank;

type MoveDirectionBank = SlotInfosBank[ 'direction' ];

export const buildSlotInfosBank = (
    mode: StorageMode,
    dropBankId: string,
    sourceId: string,
    sourceSaveId: number | undefined | null,
    pkmVariantIndexes: PkmVariantIndexes | undefined,
    sourcePkmSaveIndexes: PkmSaveIndexes | undefined,
    sourceInventory: StorageGetInventoryItems200 | undefined,
    savesById: Record<number, SaveInfosDTO>,
    sourceBoxes: Record<number, BoxDTO>,
    targetBanks: Record<string, BankDTO>,
): SlotInfosBank[] => {
    const direction = getMoveDirection(sourceSaveId);

    switch (direction) {
        case 'main-to-bank': {
            const sourcePkm = pkmVariantIndexes?.byId[ sourceId ];
            const sourceItem = sourceInventory?.[ sourceId ];
            const source = sourcePkm ?? sourceItem;
            if (!source) {
                return [];
            }

            const sourceBox = sourceBoxes[ source.boxId ];

            const targetBank = targetBanks[ dropBankId ];

            if (!sourceBox || !targetBank) {
                return [];
            }

            return [ {
                mode,
                direction: 'main-to-bank',
                sourcePkm,
                sourceBox,
                targetBank,
            } ];
        };
        case 'save-to-bank': {
            const sourcePkm = sourcePkmSaveIndexes?.byId[ sourceId ];
            const sourceItem = sourceInventory?.[ sourceId ];
            const source = sourcePkm ?? sourceItem;
            if (!source || !sourceSaveId) {
                return [];
            }

            const sourceBox = sourceBoxes[ source.boxId ];
            const sourceSave = savesById[ sourceSaveId ];

            const targetBank = targetBanks[ dropBankId ];

            if (!sourceBox || !sourceSave || !targetBank) {
                return [];
            }

            return [ {
                mode,
                direction: 'save-to-bank',
                sourceSave,
                sourcePkm,
                sourceBox,
                targetBank,
            } ];
        };
    }
};

const getMoveDirection = (sourceSaveId: number | undefined | null): MoveDirectionBank => {
    const fromSave = !!sourceSaveId;

    if (!fromSave) return 'main-to-bank';
    return 'save-to-bank';
};
