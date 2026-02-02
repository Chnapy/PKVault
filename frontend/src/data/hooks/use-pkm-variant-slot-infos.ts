import { useSearch } from '@tanstack/react-router';
import { filterIsDefined } from '../../util/filter-is-defined';
import { useSaveInfosGetAll } from '../sdk/save-infos/save-infos.gen';
import { usePkmSaveIndex } from './use-pkm-save-index';
import { usePkmVariantIndex } from './use-pkm-variant-index';

/**
 * Gives infos from a pkm-variant ID and all others pkms from its position.
 */
export const usePkmVariantSlotInfos = (baseVariantId: string | undefined) => {
    const saves = useSearch({ from: '/storage', select: search => search.saves, shouldThrow: false }) ?? {};

    const pkmVariantsQuery = usePkmVariantIndex();
    const saveInfosQuery = useSaveInfosGetAll();

    const pkmVariantIndex = pkmVariantsQuery.data?.data;
    const baseVariant = baseVariantId !== undefined ? pkmVariantIndex?.byId?.[ baseVariantId ] : undefined;
    const variants = baseVariant ? (pkmVariantIndex?.byBox?.[ baseVariant.boxId ]?.[ baseVariant.boxSlot ] ?? []) : [];
    const mainVariant = variants.find(variant => variant.isMain);

    const attachedVariant = variants.find(variant => variant.attachedSaveId);

    const pkmSavePkmQuery = usePkmSaveIndex(attachedVariant?.attachedSaveId ?? 0);

    if (!mainVariant) {
        return;
    }

    const pageSaves = Object.values(saves)
        .map(save => save && saveInfosQuery.data?.data?.[ save.saveId ])
        .filter(filterIsDefined);

    const { compatibleWithVersions } = mainVariant;

    const attachedSavePkm = attachedVariant ? pkmSavePkmQuery.data?.data.byIdBase[ attachedVariant.attachedSavePkmIdBase! ]?.[ 0 ] : undefined;

    const canCreateVariants =
        attachedVariant || !mainVariant.isEnabled
            ? []
            : [
                ...new Set(
                    pageSaves
                        .filter(pageSave => {
                            const hasPkmForPageSaveGeneration = variants.some(variant => variant.generation === pageSave.generation);
                            const isCompatibleWithPageSave = compatibleWithVersions.includes(pageSave.version);

                            return isCompatibleWithPageSave && !hasPkmForPageSaveGeneration;
                        })
                        .map(pageSave => pageSave.generation),
                ),
            ].sort();

    const canEditAll = variants.every(variant => variant.canEdit);

    const canMoveAttached =
        !attachedVariant && pageSaves.some(pageSave => variants.some(variant => variant.canMoveAttachedToSave && variant.generation === pageSave.generation));
    const canEvolveVariant = variants.find(variant => variant.canEvolve);
    const canSynchronize = !!attachedSavePkm && !!attachedVariant && attachedSavePkm.dynamicChecksum !== attachedVariant.dynamicChecksum;

    const canDetach = !!attachedVariant;
    const canGoToSave = !!attachedVariant;

    const canRemoveVariants = variants.filter(variant => variant.canDelete);

    return {
        pageSaves,
        variants,
        baseVariant,
        mainVariant,
        attachedVariant,
        attachedSavePkm,
        canEditAll,
        canCreateVariants,
        canMoveAttached,
        canEvolveVariant,
        canSynchronize,
        canDetach,
        canGoToSave,
        canRemoveVariants,
    };
};
