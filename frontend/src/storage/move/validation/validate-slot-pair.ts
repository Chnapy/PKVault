import type { PkmVariantIndexes } from '../../../data/hooks/use-pkm-variant-index';
import { validateCommon } from './rules/validate-common';
import { validateMainToMain } from './rules/validate-main-to-main';
import { validateMainToSave } from './rules/validate-main-to-save';
import { validateSaveToMain } from './rules/validate-save-to-main';
import { validateSaveToSave } from './rules/validate-save-to-save';
import type { DropValidationResult, SlotInfos } from './types';

export const validateSlotPair = (
    info: SlotInfos,
    attached: boolean,
    pkmVariantIndexes: PkmVariantIndexes,
): DropValidationResult => {

    const commonResult = validateCommon(
        info,
        attached,
    );
    if (!commonResult.canDrop) return commonResult;

    switch (info.direction) {
        case 'save-to-save': {
            return validateSaveToSave(info, attached);
        }

        case 'main-to-save': {
            const relatedPkmVariants = pkmVariantIndexes.byBox[ info.sourcePkm.boxId ]?.[ info.sourcePkm.boxSlot ] ?? [];
            const generation = info.targetPkm?.generation ?? info.targetSave.generation;

            const sourceForGeneration = relatedPkmVariants.find(variant => variant.generation === generation);
            const sourceAttached = relatedPkmVariants.find(variant => variant.attachedSaveId);

            return validateMainToSave(
                info,
                sourceForGeneration,
                sourceAttached,
                attached,
            );
        }

        case 'main-to-bank':
        case 'main-to-main': {
            return validateMainToMain(info, attached);
        }

        case 'save-to-bank':
        case 'save-to-main': {
            const existingPkmVariant = pkmVariantIndexes.byId[ info.sourcePkm.idBase ];
            return validateSaveToMain(
                info,
                attached,
                existingPkmVariant,
            );
        }
    }
};
