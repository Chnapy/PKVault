import type { PkmSaveIndexes } from '../../../../data/hooks/use-pkm-save-index';
import type { PkmVariantIndexes } from '../../../../data/hooks/use-pkm-variant-index';
import type { BoxDTO, SaveInfosDTO, StorageGetInventoryItems200 } from '../../../../data/sdk/model';
import type { StorageMode } from '../../../../ui/inventory/context/storage-mode-context';
import type { ValidateMainToMainSlot } from '../rules/validate-main-to-main';
import type { ValidateMainToSaveSlot } from '../rules/validate-main-to-save';
import type { ValidateSaveToMainSlot } from '../rules/validate-save-to-main';
import type { ValidateSaveToSaveSlot } from '../rules/validate-save-to-save';

export type SlotInfosSlot =
    | ValidateMainToMainSlot
    | ValidateMainToSaveSlot
    | ValidateSaveToMainSlot
    | ValidateSaveToSaveSlot;

type MoveDirectionSlot = SlotInfosSlot[ 'direction' ];

export const buildSlotInfosSlot = (
    mode: StorageMode,
    dropBoxId: number,
    dropBoxSlot: number,
    firstSourceSlot: number,
    sourceId: string,
    sourceSaveId: number | null | undefined,
    targetSaveId: number | null | undefined,
    pkmVariantIndexes: PkmVariantIndexes | undefined,
    sourcePkmSaveIndexes: PkmSaveIndexes | undefined,
    sourceInventory: StorageGetInventoryItems200 | undefined,
    targetPkmSaveIndexes: PkmSaveIndexes | undefined,
    savesById: Record<number, SaveInfosDTO>,
    sourceBoxes: Record<number, BoxDTO>,
    targetBoxes: Record<number, BoxDTO>,
): SlotInfosSlot[] => {
    const direction = getMoveDirection(sourceSaveId, targetSaveId);

    switch (direction) {
        case 'main-to-main': {
            const sourcePkm = pkmVariantIndexes?.byId[ sourceId ];
            const sourceItem = sourceInventory?.[ sourceId ];
            const source = sourcePkm ?? sourceItem;
            if (!source) {
                return [];
            }

            const sourceBox = sourceBoxes[ source.boxId ];

            const targetSlot = dropBoxSlot + (source.boxSlot - firstSourceSlot);
            const targetBox = targetBoxes[ dropBoxId ];

            const targetPkmVariants = pkmVariantIndexes?.byBox[ dropBoxId ]?.[ targetSlot ] ?? [];
            const normalizedTargetPkmMains = targetPkmVariants.length === 0 ? [ undefined ] : targetPkmVariants;

            if (!sourceBox || !targetBox) {
                return [];
            }

            return normalizedTargetPkmMains.map(targetPkm => ({
                mode,
                direction: 'main-to-main',
                sourcePkm,
                sourceItem,
                sourceBox,
                targetBox,
                targetSlot,
                targetPkm,
            }));
        };
        case 'main-to-save': {
            const sourcePkm = pkmVariantIndexes?.byId[ sourceId ];
            const sourceItem = sourceInventory?.[ sourceId ];
            const source = sourcePkm ?? sourceItem;
            if (!source) {
                return [];
            }

            const sourceBox = sourceBoxes[ source.boxId ];

            const targetSlot = dropBoxSlot + (source.boxSlot - firstSourceSlot);
            const targetSave = savesById[ targetSaveId! ];
            const targetBox = targetBoxes[ dropBoxId ];
            const targetPkm = targetPkmSaveIndexes?.byBox[ dropBoxId ]?.[ targetSlot ];

            if (!sourceBox || !targetSave || !targetBox) {
                return [];
            }

            return [ {
                mode,
                direction: 'main-to-save',
                sourcePkm,
                sourceItem,
                sourceBox,
                targetSave,
                targetBox,
                targetSlot,
                targetPkm,
            } ];
        };
        case 'save-to-main': {
            const sourcePkm = sourcePkmSaveIndexes?.byId[ sourceId ];
            const sourceItem = sourceInventory?.[ sourceId ];
            const source = sourcePkm ?? sourceItem;
            if (!source || !sourceSaveId) {
                return [];
            }

            const sourceBox = sourceBoxes[ source.boxId ];
            const sourceSave = savesById[ sourceSaveId ];

            const targetSlot = dropBoxSlot + (source.boxSlot - firstSourceSlot);
            const targetBox = targetBoxes[ dropBoxId ];

            if (!sourceBox || !sourceSave || !targetBox) {
                return [];
            }

            const targetPkmVariants = pkmVariantIndexes?.byBox[ dropBoxId ]?.[ targetSlot ] ?? [];
            const normalizedTargetPkmMains = targetPkmVariants.length === 0 ? [ undefined ] : targetPkmVariants;

            return normalizedTargetPkmMains.map(targetPkm => ({
                mode,
                direction: 'save-to-main',
                sourceSave,
                sourcePkm,
                sourceItem,
                sourceBox,
                targetBox,
                targetSlot,
                targetPkm,
            }));
        };
        case 'save-to-save': {
            const sourcePkm = sourcePkmSaveIndexes?.byId[ sourceId ];
            const sourceItem = sourceInventory?.[ sourceId ];
            const source = sourcePkm ?? sourceItem;
            if (!source || !sourceSaveId || !targetSaveId) {
                return [];
            }

            const sourceBox = sourceBoxes[ source.boxId ];
            const sourceSave = savesById[ sourceSaveId ];

            const targetSlot = dropBoxSlot + (source.boxSlot - firstSourceSlot);
            const targetSave = savesById[ targetSaveId ];
            const targetBox = targetBoxes[ dropBoxId ];
            const targetPkm = targetPkmSaveIndexes?.byBox[ dropBoxId ]?.[ targetSlot ];

            if (!sourceBox || !sourceSave || !targetBox || !targetSave) {
                return [];
            }

            return [ {
                mode,
                direction: 'save-to-save',
                sourceSave,
                sourcePkm,
                sourceItem,
                sourceBox,
                targetSave,
                targetBox,
                targetPkm,
                targetSlot,
            } ];
        };
    }
};

const getMoveDirection = (sourceSaveId: number | null | undefined, targetSaveId: number | null | undefined): MoveDirectionSlot => {
    const fromSave = !!sourceSaveId;
    const toSave = !!targetSaveId;

    if (!fromSave && !toSave) return 'main-to-main';
    if (!fromSave && toSave) return 'main-to-save';
    if (fromSave && !toSave) return 'save-to-main';
    return 'save-to-save';
};
