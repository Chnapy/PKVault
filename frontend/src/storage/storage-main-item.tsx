import { PopoverButton } from '@headlessui/react';
import React from 'react';
import { useSaveInfosGetAll } from '../data/sdk/save-infos/save-infos.gen';
import { useStorageGetMainPkms, useStorageGetMainPkmVersions, useStorageGetSavePkms } from '../data/sdk/storage/storage.gen';
import { Route } from '../routes/storage';
import { StorageItem } from '../ui/storage-item/storage-item';
import { StorageItemPopover } from '../ui/storage-item/storage-item-popover';
import { GenderType } from '../data/sdk/model';

type StorageMainItemProps = {
    pkmId: string;
};

export const StorageMainItem: React.FC<StorageMainItemProps> = React.memo(({ pkmId }) => {
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

    const { species, generation, form, gender, isShiny, compatibleWithVersions } = pkmVersions[ 0 ];

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
        <StorageItemPopover
            storageType="main"
            pkmId={pkmId}
            boxId={pkm.boxId}
            boxSlot={pkm.boxSlot}
            selected={selected?.type === "main" && selected.id === pkm.id}
        >
            {props => <PopoverButton
                as={StorageItem}
                {...props}
                species={species}
                generation={generation}
                form={form}
                isFemale={gender == GenderType.FEMALE}
                isEgg={false}
                isShiny={isShiny}
                isShadow={false}
                heldItem={heldItem}
                warning={pkmVersions.some((value) => !value.isValid || !value.isAttachedValid)}
                nbrVersions={pkmVersions.length}
                canCreateVersion={canCreateVersion}
                canMoveOutside={canMoveAttached}
                canEvolve={canEvolve}
                attached={canDetach}
                needSynchronize={canSynchronize}
                onClick={props.onClick ?? (() =>
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
                )}
            />}
        </StorageItemPopover>
    );
});
