import React from 'react';
import { usePkmLegality } from '../../../data/hooks/use-pkm-legality';
import { usePkmSaveIndex } from '../../../data/hooks/use-pkm-save-index';
import { usePkmVariantIndex } from '../../../data/hooks/use-pkm-variant-index';
import { Gender as GenderType } from '../../../data/sdk/model';
import type { ButtonLikeProps } from '../../../ui/button/button-like';
import { StorageItem, type StorageItemProps } from '../../../ui/storage-item/storage-item';

export type StorageSaveItemBaseProps = ButtonLikeProps &
    Pick<StorageItemProps, 'anchor' | 'helpTitle' | 'small' | 'checked' | 'onCheck'> & {
        saveId: number;
        pkmId: string;
    };

export const StorageSaveItemBase: React.FC<StorageSaveItemBaseProps> = React.memo(({ saveId, pkmId, ...rest }) => {
    const savePkmsQuery = usePkmSaveIndex(saveId);

    const pkmVariantIndex = usePkmVariantIndex();

    const pkmLegalityQuery = usePkmLegality(pkmId, saveId);
    const pkmLegality = pkmLegalityQuery.data?.data;

    const savePkm = savePkmsQuery.data?.data.byId[ pkmId ];

    if (!savePkm) {
        return null;
    }

    const { species, form, gender, isAlpha, isShiny, isEgg, isShadow, canEvolve } = savePkm;

    const attachedPkmVariant = pkmVariantIndex.data?.data.byAttachedSave[ savePkm.saveId ]?.[ savePkm.idBase ];
    const saveSynchronized = savePkm.dynamicChecksum === attachedPkmVariant?.dynamicChecksum;

    const canMoveAttached = !attachedPkmVariant && !isEgg && !isShadow;
    const canDetach = !!attachedPkmVariant;
    const canSynchronize = !!attachedPkmVariant && !saveSynchronized;

    return (
        <StorageItem
            {...rest}
            species={species}
            context={savePkm.context}
            form={form}
            isFemale={gender == GenderType.Female}
            isEgg={isEgg}
            isAlpha={isAlpha}
            isShiny={isShiny}
            isShadow={isShadow}
            isStarter={savePkm.isStarter}
            heldItem={savePkm.heldItem}
            warning={!!pkmLegality && !pkmLegality.isValid}
            level={savePkm.level}
            party={savePkm.party >= 0 ? savePkm.party : undefined}
            canCreateVariant={false}
            canMoveOutside={canMoveAttached}
            canEvolve={canEvolve}
            attached={canDetach}
            needSynchronize={canSynchronize}
            onClick={rest.onClick}
        />
    );
});
