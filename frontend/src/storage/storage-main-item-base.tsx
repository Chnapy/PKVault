import React from 'react';
import { usePkmLegalityMap } from '../data/hooks/use-pkm-legality';
import { Gender as GenderType } from '../data/sdk/model';
import { useStorageGetMainPkms, useStorageGetMainPkmVersions } from '../data/sdk/storage/storage.gen';
import type { ButtonLikeProps } from '../ui/button/button-like';
import { StorageItem, type StorageItemProps } from '../ui/storage-item/storage-item';

export type StorageMainItemBaseProps = ButtonLikeProps & Pick<StorageItemProps,
    'anchor' | 'helpTitle' | 'small' | 'checked' | 'onCheck' | 'heldItem' | 'canCreateVersion' | 'canMoveOutside' | 'canEvolve' | 'needSynchronize'
> & {
    pkmId: string;
};

export const StorageMainItemBase: React.FC<StorageMainItemBaseProps> = React.memo(({ pkmId, ...rest }) => {
    const pkmsQuery = useStorageGetMainPkms();
    const pkmVersionsQuery = useStorageGetMainPkmVersions();

    const pkm = pkmsQuery.data?.data.find(pkm => pkm.id === pkmId);

    const allPkmVersions = pkmVersionsQuery.data?.data ?? [];
    const pkmVersions = allPkmVersions.filter((value) => value.pkmId === pkmId);
    const pkmVersionsIds = pkmVersions.map(pkmVersion => pkmVersion.id);

    const pkmLegalityMapQuery = usePkmLegalityMap(pkmVersionsIds);
    const pkmLegalityMap = Object.values(pkmLegalityMapQuery.data?.data ?? {});

    if (!pkm || !pkmVersions[ 0 ]) {
        return null;
    }

    const { species, context, form, gender, isAlpha, isShiny } = pkmVersions[ 0 ];

    const canDetach = !!pkm.saveId;

    return <StorageItem
        {...{
            ...rest,
            species,
            context,
            form,
            isFemale: gender === GenderType.Female,
            isEgg: false,
            isAlpha,
            isShiny,
            isShadow: false,
            warning: pkmLegalityMap.some((value) => !value.isValid),
            nbrVersions: pkmVersions.length,
            hasDisabledVersion: pkmVersions.some(pk => !pk.isEnabled),
            attached: canDetach,
        }}
    />;
});
