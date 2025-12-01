import { PopoverButton } from '@headlessui/react';
import React from 'react';
import { Gender as GenderType } from '../data/sdk/model';
import { useSaveInfosGetAll } from '../data/sdk/save-infos/save-infos.gen';
import { useStorageGetMainPkms, useStorageGetMainPkmVersions, useStorageGetSavePkms } from '../data/sdk/storage/storage.gen';
import { withErrorCatcher } from '../error/with-error-catcher';
import { useStaticData } from '../hooks/use-static-data';
import { Route } from '../routes/storage';
import { StorageItem, type StorageItemProps } from '../ui/storage-item/storage-item';
import { StorageItemPopover } from '../ui/storage-item/storage-item-popover';
import { filterIsDefined } from '../util/filter-is-defined';
import { StorageSelectContext } from './actions/storage-select-context';

type StorageMainItemProps = {
    pkmId: string;
};

export const StorageMainItem: React.FC<StorageMainItemProps> = withErrorCatcher('item', React.memo(({ pkmId }) => {
    const selected = Route.useSearch({ select: (search) => search.selected });
    const saves = Route.useSearch({ select: (search) => search.saves }) ?? {};
    const navigate = Route.useNavigate();

    const { checked, onCheck } = StorageSelectContext.useCheck(undefined, pkmId);

    const staticData = useStaticData();
    const saveInfosQuery = useSaveInfosGetAll();
    const pkmsQuery = useStorageGetMainPkms();
    const pkmVersionsQuery = useStorageGetMainPkmVersions();

    const pageSaves = Object.values(saves).map(save => save && saveInfosQuery.data?.data?.[ save.saveId ]).filter(filterIsDefined);

    const pkm = pkmsQuery.data?.data.find(pkm => pkm.id === pkmId);

    const pkmSavePkmQuery = useStorageGetSavePkms(pkm?.saveId ?? 0);

    const allPkmVersions = pkmVersionsQuery.data?.data ?? [];
    const pkmVersions = allPkmVersions.filter((value) => value.pkmId === pkmId);
    const pkmVersionsIds = pkmVersions.map(version => version.id);

    if (!pkm || !pkmVersions[ 0 ]) {
        return null;
    }

    const { species, context, form, gender, isAlpha, isShiny, compatibleWithVersions, level } = pkmVersions[ 0 ];

    const hasSaveHeldItems = pageSaves.some(pageSave => pkmVersions.find((version) => version.generation === pageSave.generation)?.heldItem);
    const heldItem = hasSaveHeldItems ? pkmVersions.find((version) => version.id === pkmId)?.heldItem : undefined;

    const attachedSavePkm = pkm.saveId ? pkmSavePkmQuery.data?.data.find(savePkm => savePkm.pkmVersionId && pkmVersionsIds.includes(savePkm.pkmVersionId)) : undefined;
    const attachedPkmVersion = attachedSavePkm && allPkmVersions.find(version => version.id === attachedSavePkm.pkmVersionId);
    const saveSynchronized = attachedSavePkm?.dynamicChecksum === attachedPkmVersion?.dynamicChecksum;

    const canCreateVersions = pkm.saveId
        ? []
        : [ ... new Set(pageSaves
            .filter(pageSave => {
                const hasPkmForPageSaveGeneration = pkmVersions.some(pkmVersion => pkmVersion.generation === pageSave.generation);
                const isCompatibleWithPageSave = compatibleWithVersions.includes(pageSave.version);

                return isCompatibleWithPageSave && !hasPkmForPageSaveGeneration;
            })
            .map(pageSave => pageSave.generation)) ].sort();


    const canMoveAttached = !pkm.saveId && pageSaves.some(pageSave => pkmVersions.some(pkmVersion => pkmVersion.generation === pageSave.generation));
    const canEvolve = !pkm.saveId && pkmVersions.some(pkmVersion => {
        const staticEvolves = staticData.evolves[ pkmVersion.species ];
        const evolveSpecies = staticEvolves?.trade[ pkmVersion.version ] ?? staticEvolves?.tradeWithItem[ pkmVersion.heldItemPokeapiName ?? '' ]?.[ pkmVersion.version ];
        return !!evolveSpecies && level >= evolveSpecies.minLevel;
    });
    const canDetach = !!pkm.saveId;
    const canSynchronize = !!pkm.saveId && !!attachedPkmVersion && !saveSynchronized;

    return (
        <StorageItemPopover
            pkmId={pkmId}
            boxId={pkm.boxId}
            boxSlot={pkm.boxSlot}
            selected={selected && !selected.saveId && selected.id === pkm.id}
        >
            {props => <PopoverButton
                as={StorageItem}
                {...{
                    ...props,
                    species,
                    context,
                    form,
                    isFemale: gender == GenderType.Female,
                    isEgg: false,
                    isAlpha,
                    isShiny,
                    isShadow: false,
                    heldItem,
                    warning: pkmVersions.some((value) => !value.isValid),
                    nbrVersions: pkmVersions.length,
                    canCreateVersion: canCreateVersions.length > 0,
                    canMoveOutside: canMoveAttached,
                    canEvolve,
                    attached: canDetach,
                    needSynchronize: canSynchronize,
                    onClick: props.onClick ?? (() => navigate({
                        search: {
                            selected: selected && !selected.saveId && selected.id === pkmId
                                ? undefined
                                : {
                                    saveId: undefined,
                                    id: pkmId,
                                },
                        },
                    })),
                    checked,
                    onCheck,
                } satisfies StorageItemProps}
            />}
        </StorageItemPopover>
    );
}));
