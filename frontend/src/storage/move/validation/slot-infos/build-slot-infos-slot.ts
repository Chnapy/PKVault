import type { PkmSaveIndexes } from '../../../../data/hooks/use-pkm-save-index';
import type { PkmVariantIndexes } from '../../../../data/hooks/use-pkm-variant-index';
import type { BoxDTO, PkmSaveDTO, PkmVariantDTO, SaveInfosDTO } from '../../../../data/sdk/model';

export type SlotInfosSlot =
    | {
        direction: 'main-to-main';
        sourceType: 'main';
        sourcePkm: PkmVariantDTO;
        sourceBox: BoxDTO;
        targetBox: BoxDTO;
        targetSlot: number;
        targetPkm?: PkmVariantDTO;
    }
    | {
        direction: 'main-to-save';
        sourceType: 'main';
        sourcePkm: PkmVariantDTO;
        sourceBox: BoxDTO;
        targetSave: SaveInfosDTO;
        targetBox: BoxDTO;
        targetSlot: number;
        targetPkm?: PkmSaveDTO;
    }
    | {
        direction: 'save-to-main';
        sourceType: 'save';
        sourcePkm: PkmSaveDTO;
        sourceSave: SaveInfosDTO;
        sourceBox: BoxDTO;
        targetBox: BoxDTO;
        targetSlot: number;
        targetPkm?: PkmVariantDTO;
    }
    | {
        direction: 'save-to-save';
        sourceType: 'save';
        sourcePkm: PkmSaveDTO;
        sourceSave: SaveInfosDTO;
        sourceBox: BoxDTO;
        targetSave: SaveInfosDTO;
        targetBox: BoxDTO;
        targetSlot: number;
        targetPkm?: PkmSaveDTO;
    };

type MoveDirectionSlot = SlotInfosSlot[ 'direction' ];

export const buildSlotInfosSlot = (
    dropBoxId: number,
    dropBoxSlot: number,
    firstSourceSlot: number,
    sourceId: string,
    sourceSaveId: number | undefined,
    targetSaveId: number | undefined,
    pkmVariantIndexes: PkmVariantIndexes,
    sourcePkmSaveIndexes: PkmSaveIndexes,
    targetPkmSaveIndexes: PkmSaveIndexes,
    savesById: Record<number, SaveInfosDTO>,
    sourceBoxes: Record<number, BoxDTO>,
    targetBoxes: Record<number, BoxDTO>,
): SlotInfosSlot[] => {
    const direction = getMoveDirection(sourceSaveId, targetSaveId);

    switch (direction) {
        case 'main-to-main': {
            const sourcePkm = pkmVariantIndexes.byId[ sourceId ];
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
                sourceType: 'main',
                sourcePkm,
                sourceBox,
                targetBox,
                targetSlot,
                targetPkm,
            }));
        };
        case 'main-to-save': {
            const sourcePkm = pkmVariantIndexes.byId[ sourceId ];
            if (!sourcePkm) {
                return [];
            }
            const sourceBox = sourceBoxes[ sourcePkm.boxId ];

            const targetSlot = dropBoxSlot + (sourcePkm.boxSlot - firstSourceSlot);
            const targetSave = savesById[ targetSaveId! ];
            const targetBox = targetBoxes[ dropBoxId ];
            const targetPkm = targetPkmSaveIndexes.byBox[ dropBoxId ]?.[ targetSlot ];

            if (!sourceBox || !targetSave || !targetBox) {
                return [];
            }

            return [ {
                direction: 'main-to-save',
                sourceType: 'main',
                sourcePkm,
                sourceBox,
                targetSave,
                targetBox,
                targetSlot,
                targetPkm,
            } ];
        };
        case 'save-to-main': {
            const sourcePkm = sourcePkmSaveIndexes.byId[ sourceId ];
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

            const targetPkmVariants = pkmVariantIndexes.byBox[ dropBoxId ]?.[ targetSlot ] ?? [];
            const normalizedTargetPkmMains = targetPkmVariants.length === 0 ? [ undefined ] : targetPkmVariants;

            return normalizedTargetPkmMains.map(targetPkm => ({
                direction: 'save-to-main',
                sourceType: 'save',
                sourceSave,
                sourcePkm,
                sourceBox,
                targetBox,
                targetSlot,
                targetPkm,
            }));
        };
        case 'save-to-save': {
            const sourcePkm = sourcePkmSaveIndexes.byId[ sourceId ];
            if (!sourcePkm || !sourceSaveId || !targetSaveId) {
                return [];
            }
            const sourceBox = sourceBoxes[ sourcePkm.boxId ];
            const sourceSave = savesById[ sourceSaveId ];

            const targetSlot = dropBoxSlot + (sourcePkm.boxSlot - firstSourceSlot);
            const targetSave = savesById[ targetSaveId ];
            const targetBox = targetBoxes[ dropBoxId ];
            const targetPkm = targetPkmSaveIndexes.byBox[ dropBoxId ]?.[ targetSlot ];

            if (!sourceBox || !sourceSave || !targetBox || !targetSave) {
                return [];
            }

            return [ {
                direction: 'save-to-save',
                sourceType: 'save',
                sourceSave,
                sourcePkm,
                sourceBox,
                targetSave,
                targetBox,
                targetSlot,
                targetPkm,
            } ];
        };
    }
};

const getMoveDirection = (sourceSaveId: number | undefined, targetSaveId: number | undefined): MoveDirectionSlot => {
    const fromSave = !!sourceSaveId;
    const toSave = !!targetSaveId;

    if (!fromSave && !toSave) return 'main-to-main';
    if (!fromSave && toSave) return 'main-to-save';
    if (fromSave && !toSave) return 'save-to-main';
    return 'save-to-save';
};
