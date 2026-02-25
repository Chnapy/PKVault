import type { PkmSaveIndexes } from '../../../../data/hooks/use-pkm-save-index';
import type { PkmVariantIndexes } from '../../../../data/hooks/use-pkm-variant-index';
import type { BankDTO, BoxDTO, PkmSaveDTO, PkmVariantDTO, SaveInfosDTO } from '../../../../data/sdk/model';

export type SlotInfosBank =
    | {
        direction: 'main-to-bank';
        sourceType: 'main';
        sourcePkm: PkmVariantDTO;
        sourceBox: BoxDTO;
        targetBank: BankDTO;
        targetBox?: undefined;
        targetSlot?: undefined;
        targetPkm?: undefined;
    }
    | {
        direction: 'save-to-bank';
        sourceType: 'save';
        sourcePkm: PkmSaveDTO;
        sourceSave: SaveInfosDTO;
        sourceBox: BoxDTO;
        targetBank: BankDTO;
        targetBox?: undefined;
        targetSlot?: undefined;
        targetPkm?: undefined;
    };

type MoveDirectionBank = SlotInfosBank[ 'direction' ];

export const buildSlotInfosBank = (
    dropBankId: string,
    sourceId: string,
    sourceSaveId: number | undefined,
    pkmVariantIndexes: PkmVariantIndexes,
    sourcePkmSaveIndexes: PkmSaveIndexes,
    savesById: Record<number, SaveInfosDTO>,
    sourceBoxes: Record<number, BoxDTO>,
    targetBanks: Record<string, BankDTO>,
): SlotInfosBank[] => {
    const direction = getMoveDirection(sourceSaveId);

    switch (direction) {
        case 'main-to-bank': {
            const sourcePkm = pkmVariantIndexes.byId[ sourceId ];
            if (!sourcePkm) {
                return [];
            }
            const sourceBox = sourceBoxes[ sourcePkm.boxId ];

            const targetBank = targetBanks[ dropBankId ];

            if (!sourceBox || !targetBank) {
                return [];
            }

            return [ {
                direction: 'main-to-bank',
                sourceType: 'main',
                sourcePkm,
                sourceBox,
                targetBank,
            } ];
        };
        case 'save-to-bank': {
            const sourcePkm = sourcePkmSaveIndexes.byId[ sourceId ];
            if (!sourcePkm || !sourceSaveId) {
                return [];
            }
            const sourceBox = sourceBoxes[ sourcePkm.boxId ];
            const sourceSave = savesById[ sourceSaveId ];

            const targetBank = targetBanks[ dropBankId ];

            if (!sourceBox || !sourceSave || !targetBank) {
                return [];
            }

            return [ {
                direction: 'save-to-bank',
                sourceType: 'save',
                sourceSave,
                sourcePkm,
                sourceBox,
                targetBank,
            } ];
        };
    }
};

const getMoveDirection = (sourceSaveId: number | undefined): MoveDirectionBank => {
    const fromSave = !!sourceSaveId;

    if (!fromSave) return 'main-to-bank';
    return 'save-to-bank';
};
