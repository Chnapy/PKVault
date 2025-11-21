import { useSearch } from '@tanstack/react-router';
import React from 'react';
import { Gender as GenderType } from '../data/sdk/model';
import { useStorageGetMainPkmVersions, useStorageGetSavePkms } from '../data/sdk/storage/storage.gen';
import { useStaticData } from '../hooks/use-static-data';
import { Route } from '../routes/storage';
import type { ButtonLikeProps } from '../ui/button/button-like';
import { StorageItem, type StorageItemProps } from '../ui/storage-item/storage-item';
import { getSaveOrder } from './util/get-save-order';

export type StorageSaveItemBaseProps = ButtonLikeProps & Pick<StorageItemProps, 'anchor' | 'helpTitle' | 'small' | 'checked' | 'onCheck'> & {
    saveId: number;
    pkmId: string;
};

export const StorageSaveItemBase: React.FC<StorageSaveItemBaseProps> = React.memo(({ saveId, pkmId, ...rest }) => {
    const selected = useSearch({ from: '/storage', select: (search) => search.selected, shouldThrow: false });
    const navigate = Route.useNavigate();

    const staticData = useStaticData();

    const pkmVersionsQuery = useStorageGetMainPkmVersions();
    const savePkmsQuery = useStorageGetSavePkms(saveId);

    const savePkm = savePkmsQuery.data?.data.find(pkm => pkm.id === pkmId);

    const allPkmVersions = pkmVersionsQuery.data?.data ?? [];

    if (!savePkm) {
        return null;
    }

    const { species, version, form, gender, isShiny, isEgg, isShadow, heldItemPokeapiName } = savePkm;

    const staticEvolves = staticData.evolves[ species ];
    const evolveSpecies = staticEvolves?.trade[ version ] ?? staticEvolves?.tradeWithItem[ heldItemPokeapiName ?? '' ]?.[ version ];

    // const attachedVersionPkm = savePkm.pkmVersionId ? allPkmVersions.find(savePkm => savePkm.pkmVersionId && pkmVersionsIds.includes(savePkm.pkmVersionId)) : undefined;
    const attachedPkmVersion = savePkm.pkmVersionId ? allPkmVersions.find(version => version.id === savePkm.pkmVersionId) : undefined;
    const saveSynchronized = savePkm.dynamicChecksum === attachedPkmVersion?.dynamicChecksum;

    const canMoveAttached = !savePkm.pkmVersionId && !isEgg && !isShadow;
    const canEvolve = !savePkm.pkmVersionId && !!evolveSpecies;
    const canDetach = !!savePkm.pkmVersionId;
    const canSynchronize = !!savePkm.pkmVersionId && !!attachedPkmVersion && !saveSynchronized;

    return (
        <StorageItem
            {...rest}
            species={species}
            context={savePkm.context}
            form={form}
            isFemale={gender == GenderType.Female}
            isEgg={isEgg}
            isShiny={isShiny}
            isShadow={isShadow}
            isStarter={savePkm.isStarter}
            heldItem={savePkm.heldItem}
            warning={!savePkm.isValid}
            level={savePkm.level}
            party={savePkm.party >= 0 ? savePkm.party : undefined}
            canCreateVersion={false}
            canMoveOutside={canMoveAttached}
            canEvolve={canEvolve}
            attached={canDetach}
            needSynchronize={canSynchronize}
            onClick={rest.onClick ?? (() => navigate({
                to: '/storage',
                search: ({ saves }) => ({
                    selected: selected?.saveId && selected.id === pkmId
                        ? undefined
                        : {
                            saveId,
                            id: pkmId,
                        },
                    saves: {
                        ...saves,
                        [ saveId ]: {
                            saveId,
                            saveBoxIds: [ savePkm.boxId ],
                            order: getSaveOrder(saves, saveId),
                        }
                    }
                }),
            }))}
        />
    );
});
