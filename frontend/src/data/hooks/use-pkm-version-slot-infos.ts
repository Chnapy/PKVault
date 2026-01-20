import { Route } from "../../routes/storage";
import { filterIsDefined } from "../../util/filter-is-defined";
import { useSaveInfosGetAll } from "../sdk/save-infos/save-infos.gen";
import {
    useStorageGetMainPkmVersions,
    useStorageGetSavePkms,
} from "../sdk/storage/storage.gen";

export const usePkmVersionSlotInfos = (baseVersionId: string | undefined) => {
    const saves = Route.useSearch({ select: (search) => search.saves }) ?? {};

    const pkmVersionsQuery = useStorageGetMainPkmVersions();
    const saveInfosQuery = useSaveInfosGetAll();

    const pkmVersionsData = pkmVersionsQuery.data?.data ?? [];
    const baseVersion =
        baseVersionId !== undefined
            ? pkmVersionsData.find((version) => version.id === baseVersionId)
            : undefined;
    const versions = baseVersion
        ? pkmVersionsData.filter((version) => version.boxKey === baseVersion.boxKey)
        : [];
    const mainVersion = versions.find((version) => version.isMain);

    const attachedVersion = versions.find((version) => version.attachedSaveId);

    const pkmSavePkmQuery = useStorageGetSavePkms(
        attachedVersion?.attachedSaveId ?? 0,
    );

    if (!mainVersion) {
        return;
    }

    const pageSaves = Object.values(saves)
        .map((save) => save && saveInfosQuery.data?.data?.[ save.saveId ])
        .filter(filterIsDefined);

    const { compatibleWithVersions } = mainVersion;

    const attachedSavePkm = attachedVersion
        ? pkmSavePkmQuery.data?.data.find(
            (savePkm) => savePkm.idBase === attachedVersion.attachedSavePkmIdBase,
        )
        : undefined;

    const canCreateVersions =
        attachedVersion || !mainVersion.isEnabled
            ? []
            : [
                ...new Set(
                    pageSaves
                        .filter((pageSave) => {
                            const hasPkmForPageSaveGeneration = versions.some(
                                (version) => version.generation === pageSave.generation,
                            );
                            const isCompatibleWithPageSave =
                                compatibleWithVersions.includes(pageSave.version);

                            return isCompatibleWithPageSave && !hasPkmForPageSaveGeneration;
                        })
                        .map((pageSave) => pageSave.generation),
                ),
            ].sort();

    const canEditAll = versions.every((version) => version.canEdit);

    const canMoveAttached =
        !attachedVersion &&
        pageSaves.some((pageSave) =>
            versions.some(
                (version) =>
                    version.canMoveAttachedToSave &&
                    version.generation === pageSave.generation,
            ),
        );
    const canEvolveVersion = versions.find((version) => version.canEvolve);
    const canSynchronize =
        !!attachedSavePkm &&
        !!attachedVersion &&
        attachedSavePkm.dynamicChecksum !== attachedVersion.dynamicChecksum;

    const canDetach = !!attachedVersion;
    const canGoToSave = !!attachedVersion;

    const canRemoveVersions = versions.filter((version) => version.canDelete);

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
