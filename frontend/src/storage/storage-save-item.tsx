import type React from 'react';
import { useStorageGetMainPkmVersions, useStorageGetSavePkms } from '../data/sdk/storage/storage.gen';
import { Route } from '../routes/storage';
import { StorageItem } from '../ui/storage-item/storage-item';

type StorageSaveItemProps = {
    saveId: number;
    pkmId: string;
};

export const StorageSaveItem: React.FC<StorageSaveItemProps> = ({ saveId, pkmId }) => {
    const selected = Route.useSearch({ select: (search) => search.selected });
    const navigate = Route.useNavigate();

    const pkmVersionsQuery = useStorageGetMainPkmVersions();
    const savePkmsQuery = useStorageGetSavePkms(saveId);

    const savePkm = savePkmsQuery.data?.data.find(pkm => pkm.id === pkmId);

    // const pkmSavePkmQuery = useStorageGetSavePkms(pkm?.saveId ?? -1);

    const allPkmVersions = pkmVersionsQuery.data?.data ?? [];
    // const pkmVersions = allPkmVersions.filter((value) => value.pkmId === pkmId);
    // const pkmVersionsIds = pkmVersions.map(version => version.id);

    if (!savePkm) {
        return null;
    }

    const { species, isShiny, isEgg, isShadow } = savePkm;

    // const attachedVersionPkm = savePkm.pkmVersionId ? allPkmVersions.find(savePkm => savePkm.pkmVersionId && pkmVersionsIds.includes(savePkm.pkmVersionId)) : undefined;
    const attachedPkmVersion = savePkm.pkmVersionId ? allPkmVersions.find(version => version.id === savePkm.pkmVersionId) : undefined;
    const saveSynchronized = savePkm.dynamicChecksum === attachedPkmVersion?.dynamicChecksum;

    const canMoveAttached = !savePkm.pkmVersionId && !isEgg && !isShadow;
    const canEvolve = savePkm.canEvolve && !savePkm.pkmVersionId;
    const canDetach = !!savePkm.pkmVersionId;
    const canSynchronize = !!savePkm.pkmVersionId && !!attachedPkmVersion && !saveSynchronized;

    return (
        <StorageItem
            storageType="save"
            pkmId={pkmId}
            species={species}
            isEgg={isEgg}
            isShiny={isShiny}
            isShadow={isShadow}
            heldItem={savePkm.heldItem}
            warning={!savePkm.isValid}
            canCreateVersion={false}
            canMoveOutside={canMoveAttached}
            canEvolve={canEvolve}
            attached={canDetach}
            needSynchronize={canSynchronize}
            boxSlot={savePkm.boxSlot}
            selected={selected?.type === "save" && selected.id === pkmId}
            onClick={() =>
                navigate({
                    search: {
                        selected: selected?.type === 'save' && selected.id === pkmId
                            ? undefined
                            : {
                                type: "save",
                                id: pkmId,
                            },
                    },
                })
            }
        />
    );
};
