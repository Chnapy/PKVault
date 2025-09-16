import type React from 'react';
import { useSaveInfosGetAll } from '../data/sdk/save-infos/save-infos.gen';
import { useStorageGetMainPkms, useStorageGetMainPkmVersions, useStorageGetSavePkms } from '../data/sdk/storage/storage.gen';
import { Route } from '../routes/storage';
import { StorageItem } from '../ui/storage-item/storage-item';

type StorageMainItemProps = {
    pkmId: string;
};

export const StorageMainItem: React.FC<StorageMainItemProps> = ({ pkmId }) => {
    const selected = Route.useSearch({ select: (search) => search.selected });
    const saveId = Route.useSearch({ select: (search) => search.save });
    const navigate = Route.useNavigate();

    const saveInfosQuery = useSaveInfosGetAll();
    const pkmsQuery = useStorageGetMainPkms();
    const pkmVersionsQuery = useStorageGetMainPkmVersions();

    const pageSave = saveId ? saveInfosQuery.data?.data?.[ saveId ] : undefined;

    const pkm = pkmsQuery.data?.data.find(pkm => pkm.id === pkmId);

    const pkmSavePkmQuery = useStorageGetSavePkms(pkm?.saveId ?? 0);

    const allPkmVersions = pkmVersionsQuery.data?.data ?? [];
    const pkmVersions = allPkmVersions.filter((value) => value.pkmId === pkmId);
    const pkmVersionsIds = pkmVersions.map(version => version.id);

    if (!pkm || pkmVersions.length === 0) {
        return null;
    }

    const { species, isShiny, compatibleWithVersions } = pkmVersions[ 0 ];

    const saveHeldItem = pageSave && pkmVersions.find((version) => version.generation === pageSave.generation)?.heldItem;
    const heldItem = saveHeldItem ?? pkmVersions.find((version) => version.id === pkmId)?.heldItem;

    const attachedSavePkm = pkm.saveId ? pkmSavePkmQuery.data?.data.find(savePkm => savePkm.pkmVersionId && pkmVersionsIds.includes(savePkm.pkmVersionId)) : undefined;
    const attachedPkmVersion = attachedSavePkm && allPkmVersions.find(version => version.id === attachedSavePkm.pkmVersionId);
    const saveSynchronized = attachedSavePkm?.dynamicChecksum === attachedPkmVersion?.dynamicChecksum;

    const hasPkmForPageSaveGeneration = !!pageSave && pkmVersions.some(pkmVersion => pkmVersion.generation === pageSave.generation);
    const isCompatibleWithPageSave = !pageSave || compatibleWithVersions.includes(pageSave.version);
    const pkmVersionCanEvolve = pkmVersions.find(version => version.canEvolve);

    const canCreateVersion = !pkm.saveId && !!pageSave && isCompatibleWithPageSave && !hasPkmForPageSaveGeneration;
    const canMoveAttached = !pkm.saveId && hasPkmForPageSaveGeneration;
    const canEvolve = pkmVersionCanEvolve && !pkm.saveId;
    const canDetach = !!pkm.saveId;
    const canSynchronize = !!pkm.saveId && !!attachedPkmVersion && !saveSynchronized;

    return (
        <StorageItem
            storageType="main"
            pkmId={pkmId}
            species={species}
            isEgg={false}
            isShiny={isShiny}
            isShadow={false}
            heldItem={heldItem}
            warning={pkmVersions.some((value) => !value.isValid)}
            boxId={pkm.boxId}
            boxSlot={pkm.boxSlot}
            selected={selected?.type === "main" && selected.id === pkm.id}
            canCreateVersion={canCreateVersion}
            canMoveOutside={canMoveAttached}
            canEvolve={canEvolve}
            attached={canDetach}
            needSynchronize={canSynchronize}
            onClick={() =>
                navigate({
                    search: {
                        selected: selected?.type === 'main' && selected.id === pkmId
                            ? undefined
                            : {
                                type: "main",
                                id: pkmId,
                            },
                    },
                })
            }
        />
    );
};
