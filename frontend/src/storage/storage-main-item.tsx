import { PopoverButton } from '@headlessui/react';
import React from 'react';
import { usePkmSaveVersion } from '../data/hooks/use-pkm-save-version';
import { useSaveInfosGetAll } from '../data/sdk/save-infos/save-infos.gen';
import { useStorageGetMainPkms, useStorageGetMainPkmVersions, useStorageGetSavePkms } from '../data/sdk/storage/storage.gen';
import { withErrorCatcher } from '../error/with-error-catcher';
import { useStaticData } from '../hooks/use-static-data';
import { Route } from '../routes/storage';
import { StorageItemPopover } from '../ui/storage-item/storage-item-popover';
import { filterIsDefined } from '../util/filter-is-defined';
import { StorageSelectContext } from './actions/storage-select-context';
import { StorageMainItemBase, type StorageMainItemBaseProps } from './storage-main-item-base';

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

    const getPkmSaveVersion = usePkmSaveVersion();

    if (!pkm || !pkmVersions[ 0 ]) {
        return null;
    }

    const { compatibleWithVersions, level } = pkmVersions[ 0 ];

    const hasSaveHeldItems = pageSaves.some(pageSave => pkmVersions.find((version) => version.generation === pageSave.generation)?.heldItem);
    const heldItem = hasSaveHeldItems ? pkmVersions.find((version) => version.id === pkmId)?.heldItem : undefined;

    const attachedSavePkm = pkm.saveId
        ? pkmSavePkmQuery.data?.data.find(savePkm => {
            const version = getPkmSaveVersion(savePkm.idBase, savePkm.saveId);
            return version && pkmVersionsIds.includes(version.id);
        })
        : undefined;
    const attachedPkmVersion = attachedSavePkm && getPkmSaveVersion(attachedSavePkm.idBase, attachedSavePkm.saveId);
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
    const canEvolve = pkmVersions.some(pkmVersion => {
        const staticEvolves = staticData.evolves[ pkmVersion.species ];
        const evolveSpecies = staticEvolves?.trade[ pkmVersion.version ] ?? staticEvolves?.tradeWithItem[ pkmVersion.heldItemPokeapiName ?? '' ]?.[ pkmVersion.version ];
        return !!evolveSpecies && level >= evolveSpecies.minLevel;
    });
    const canSynchronize = !!pkm.saveId && !!attachedPkmVersion && !saveSynchronized;

    return (
        <StorageItemPopover
            pkmId={pkmId}
            boxId={pkm.boxId}
            boxSlot={pkm.boxSlot}
            selected={selected && !selected.saveId && selected.id === pkm.id}
        >
            {props => <PopoverButton
                as={StorageMainItemBase}
                {...{
                    ...props,
                    pkmId,
                    heldItem,
                    canCreateVersion: canCreateVersions.length > 0,
                    canMoveOutside: canMoveAttached,
                    canEvolve,
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
                } satisfies StorageMainItemBaseProps}
            />}
        </StorageItemPopover>
    );
}));
