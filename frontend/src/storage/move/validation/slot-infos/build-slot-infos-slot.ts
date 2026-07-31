import type { PkmSaveIndexes } from '../../../../data/hooks/use-pkm-save-index';
import type { PkmVariantIndexes } from '../../../../data/hooks/use-pkm-variant-index';
import type { BoxDTO, SaveInfosDTO } from '../../../../data/sdk/model';
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
    dropBoxId: number,
    dropBoxSlot: number,
    firstSourceSlot: number,
    sourceId: string,
    sourceSaveId: number | null | undefined,
    targetSaveId: number | null | undefined,
    pkmVariantIndexes: PkmVariantIndexes | undefined,
    sourcePkmSaveIndexes: PkmSaveIndexes | undefined,
    targetPkmSaveIndexes: PkmSaveIndexes | undefined,
    savesById: Record<number, SaveInfosDTO>,
    sourceBoxes: Record<number, BoxDTO>,
    targetBoxes: Record<number, BoxDTO>,
): SlotInfosSlot[] => {
    const direction = getMoveDirection(sourceSaveId, targetSaveId);

    switch (direction) {
        case 'main-to-main': {
            const sourcePkm = pkmVariantIndexes?.byId[ sourceId ];
            if (!sourcePkm) {
                return [];
            }

            const sourceBox = sourceBoxes[ sourcePkm.boxId ];

            const targetSlot = dropBoxSlot + (sourcePkm.boxSlot - firstSourceSlot);
            const targetBox = targetBoxes[ dropBoxId ];

            const targetPkmVariants = pkmVariantIndexes.byBox[ dropBoxId ]?.[ targetSlot ] ?? [];
            const normalizedTargetPkmMains = targetPkmVariants.length === 0 ? [ undefined ] : targetPkmVariants;

            if (!sourceBox || !targetBox) {
                return [];
            }

            return normalizedTargetPkmMains.map(targetPkm => ({
                direction: 'main-to-main',
                sourcePkm,
                sourceBox,
                targetBox,
                targetSlot,
                targetPkm,
            }));
        };
        case 'main-to-save': {
            const sourcePkm = pkmVariantIndexes?.byId[ sourceId ];
            if (!sourcePkm) {
                return [];
            }

            const sourceBox = sourceBoxes[ sourcePkm.boxId ];

            const targetSlot = dropBoxSlot + (sourcePkm.boxSlot - firstSourceSlot);
            const targetSave = savesById[ targetSaveId! ];
            const targetBox = targetBoxes[ dropBoxId ];
            const targetPkm = targetPkmSaveIndexes?.byBox[ dropBoxId ]?.[ targetSlot ];

            if (!sourceBox || !targetSave || !targetBox) {
                return [];
            }

            return [ {
                direction: 'main-to-save',
                sourcePkm,
                sourceBox,
                targetSave,
                targetBox,
                targetSlot,
                targetPkm,
            } ];
        };
        case 'save-to-main': {
            const sourcePkm = sourcePkmSaveIndexes?.byId[ sourceId ];
            if (!sourcePkm || !sourceSaveId) {
                return [];
            }

            const sourceBox = sourceBoxes[ sourcePkm.boxId ];
            const sourceSave = savesById[ sourceSaveId ];

            const targetSlot = dropBoxSlot + (sourcePkm.boxSlot - firstSourceSlot);
            const targetBox = targetBoxes[ dropBoxId ];

            if (!sourceBox || !sourceSave || !targetBox) {
                return [];
            }

            const targetPkmVariants = pkmVariantIndexes?.byBox[ dropBoxId ]?.[ targetSlot ] ?? [];
            const normalizedTargetPkmMains = targetPkmVariants.length === 0 ? [ undefined ] : targetPkmVariants;

            return normalizedTargetPkmMains.map(targetPkm => ({
                direction: 'save-to-main',
                sourceSave,
                sourcePkm,
                sourceBox,
                targetBox,
                targetSlot,
                targetPkm,
            }));
        };
        case 'save-to-save': {
            const sourcePkm = sourcePkmSaveIndexes?.byId[ sourceId ];
            if (!sourcePkm || !sourceSaveId || !targetSaveId) {
                return [];
            }

            const sourceBox = sourceBoxes[ sourcePkm.boxId ];
            const sourceSave = savesById[ sourceSaveId ];

            const targetSlot = dropBoxSlot + (sourcePkm.boxSlot - firstSourceSlot);
            const targetSave = savesById[ targetSaveId ];
            const targetBox = targetBoxes[ dropBoxId ];
            const targetPkm = targetPkmSaveIndexes?.byBox[ dropBoxId ]?.[ targetSlot ];

            if (!sourceBox || !sourceSave || !targetBox || !targetSave) {
                return [];
            }

            return [ {
                direction: 'save-to-save',
                sourceSave,
                sourcePkm,
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
