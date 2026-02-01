import { useSearch } from '@tanstack/react-router';
import { filterIsDefined } from '../../util/filter-is-defined';
import { useSaveInfosGetAll } from '../sdk/save-infos/save-infos.gen';
import { usePkmSaveIndex } from './use-pkm-save-index';
import { usePkmVersionIndex } from './use-pkm-version-index';

/**
 * Gives infos from a pkm-version ID and all others pkms from its position.
 */
export const usePkmVersionSlotInfos = (baseVersionId: string | undefined) => {
    const saves = useSearch({ from: '/storage', select: search => search.saves, shouldThrow: false }) ?? {};

    const pkmVersionsQuery = usePkmVersionIndex();
    const saveInfosQuery = useSaveInfosGetAll();

    const pkmVersionIndex = pkmVersionsQuery.data?.data;
    const baseVersion = baseVersionId !== undefined ? pkmVersionIndex?.byId?.[ baseVersionId ] : undefined;
    const versions = baseVersion ? (pkmVersionIndex?.byBox?.[ baseVersion.boxId ]?.[ baseVersion.boxSlot ] ?? []) : [];
    const mainVersion = versions.find(version => version.isMain);

    const attachedVersion = versions.find(version => version.attachedSaveId);

    const pkmSavePkmQuery = usePkmSaveIndex(attachedVersion?.attachedSaveId ?? 0);

    if (!mainVersion) {
        return;
    }

    const pageSaves = Object.values(saves)
        .map(save => save && saveInfosQuery.data?.data?.[ save.saveId ])
        .filter(filterIsDefined);

    const { compatibleWithVersions } = mainVersion;

    const attachedSavePkm = attachedVersion ? pkmSavePkmQuery.data?.data.byIdBase[ attachedVersion.attachedSavePkmIdBase! ]?.[ 0 ] : undefined;

    const canCreateVersions =
        attachedVersion || !mainVersion.isEnabled
            ? []
            : [
                ...new Set(
                    pageSaves
                        .filter(pageSave => {
                            const hasPkmForPageSaveGeneration = versions.some(version => version.generation === pageSave.generation);
                            const isCompatibleWithPageSave = compatibleWithVersions.includes(pageSave.version);

                            return isCompatibleWithPageSave && !hasPkmForPageSaveGeneration;
                        })
                        .map(pageSave => pageSave.generation),
                ),
            ].sort();

    const canEditAll = versions.every(version => version.canEdit);

    const canMoveAttached =
        !attachedVersion && pageSaves.some(pageSave => versions.some(version => version.canMoveAttachedToSave && version.generation === pageSave.generation));
    const canEvolveVersion = versions.find(version => version.canEvolve);
    const canSynchronize = !!attachedSavePkm && !!attachedVersion && attachedSavePkm.dynamicChecksum !== attachedVersion.dynamicChecksum;

    const canDetach = !!attachedVersion;
    const canGoToSave = !!attachedVersion;

    const canRemoveVersions = versions.filter(version => version.canDelete);

    return {
        pageSaves,
        versions,
        baseVersion,
        mainVersion,
        attachedVersion,
        attachedSavePkm,
        canEditAll,
        canCreateVersions,
        canMoveAttached,
        canEvolveVersion,
        canSynchronize,
        canDetach,
        canGoToSave,
        canRemoveVersions,
    };
};
