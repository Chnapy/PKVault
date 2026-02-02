import React from 'react';
import { usePkmLegalityMap } from '../../../data/hooks/use-pkm-legality';
import { usePkmVariantSlotInfos } from '../../../data/hooks/use-pkm-variant-slot-infos';
import { Gender as GenderType } from '../../../data/sdk/model';
import type { ButtonLikeProps } from '../../../ui/button/button-like';
import { StorageItem, type StorageItemProps } from '../../../ui/storage-item/storage-item';

export type StorageMainItemBaseProps = ButtonLikeProps &
    Pick<
        StorageItemProps,
        'anchor' | 'helpTitle' | 'small' | 'checked' | 'onCheck' | 'heldItem' | 'canCreateVariant' | 'canMoveOutside' | 'canEvolve' | 'needSynchronize'
    > & {
        pkmId: string;
    };

export const StorageMainItemBase: React.FC<StorageMainItemBaseProps> = React.memo(({ pkmId, ...rest }) => {
    const variantInfos = usePkmVariantSlotInfos(pkmId);

    const variantsIds = variantInfos?.variants.map(variant => variant.id) ?? [];

    const pkmLegalityMapQuery = usePkmLegalityMap(variantsIds);
    const pkmLegalityMap = Object.values(pkmLegalityMapQuery.data?.data ?? {});

    if (!variantInfos) {
        return null;
    }

    const { mainVariant, variants, canDetach } = variantInfos;

    const { species, context, form, gender, isAlpha, isShiny } = mainVariant;

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
                nbrVariants: variants.length,
                hasDisabledVariant: variants.some(pk => !pk.isEnabled),
                attached: canDetach,
            }}
        />
    );
});
