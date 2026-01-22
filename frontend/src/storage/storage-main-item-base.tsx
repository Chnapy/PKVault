import React from 'react';
import { usePkmLegalityMap } from '../data/hooks/use-pkm-legality';
import { usePkmVersionSlotInfos } from '../data/hooks/use-pkm-version-slot-infos';
import { Gender as GenderType } from '../data/sdk/model';
import type { ButtonLikeProps } from '../ui/button/button-like';
import { StorageItem, type StorageItemProps } from '../ui/storage-item/storage-item';

export type StorageMainItemBaseProps = ButtonLikeProps &
    Pick<
        StorageItemProps,
        'anchor' | 'helpTitle' | 'small' | 'checked' | 'onCheck' | 'heldItem' | 'canCreateVersion' | 'canMoveOutside' | 'canEvolve' | 'needSynchronize'
    > & {
        pkmId: string;
    };

export const StorageMainItemBase: React.FC<StorageMainItemBaseProps> = React.memo(({ pkmId, ...rest }) => {
    const versionInfos = usePkmVersionSlotInfos(pkmId);

    const versionsIds = versionInfos?.versions.map(version => version.id) ?? [];

    const pkmLegalityMapQuery = usePkmLegalityMap(versionsIds);
    const pkmLegalityMap = Object.values(pkmLegalityMapQuery.data?.data ?? {});

    if (!versionInfos) {
        return null;
    }

    const { mainVersion, versions, canDetach } = versionInfos;

    const { species, context, form, gender, isAlpha, isShiny } = mainVersion;

    return (
        <StorageItem
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
                warning: pkmLegalityMap.some(value => !value.isValid),
                nbrVersions: versions.length,
                hasDisabledVersion: versions.some(pk => !pk.isEnabled),
                attached: canDetach,
            }}
        />
    );
});
