import React from 'react';
import { usePkmLegality } from '../data/hooks/use-pkm-legality';
import { usePkmVersionIndex } from '../data/hooks/use-pkm-version-index';
import { Gender as GenderType } from '../data/sdk/model';
import { useStorageGetSavePkms } from '../data/sdk/storage/storage.gen';
import type { ButtonLikeProps } from '../ui/button/button-like';
import { StorageItem, type StorageItemProps } from '../ui/storage-item/storage-item';

export type StorageSaveItemBaseProps = ButtonLikeProps &
    Pick<StorageItemProps, 'anchor' | 'helpTitle' | 'small' | 'checked' | 'onCheck'> & {
        saveId: number;
        pkmId: string;
    };

export const StorageSaveItemBase: React.FC<StorageSaveItemBaseProps> = React.memo(({ saveId, pkmId, ...rest }) => {
    const savePkmsQuery = useStorageGetSavePkms(saveId);

    const pkmVersionIndex = usePkmVersionIndex();

    const pkmLegalityQuery = usePkmLegality(pkmId, saveId);
    const pkmLegality = pkmLegalityQuery.data?.data;

    const savePkm = savePkmsQuery.data?.data.find(pkm => pkm.id === pkmId);

    if (!savePkm) {
        return null;
    }

    const { species, form, gender, isAlpha, isShiny, isEgg, isShadow, canEvolve } = savePkm;

    const attachedPkmVersion = pkmVersionIndex.data?.data.byAttachedSave[ savePkm.saveId ]?.[ savePkm.idBase ];
    const saveSynchronized = savePkm.dynamicChecksum === attachedPkmVersion?.dynamicChecksum;

    const canMoveAttached = !attachedPkmVersion && !isEgg && !isShadow;
    const canDetach = !!attachedPkmVersion;
    const canSynchronize = !!attachedPkmVersion && !saveSynchronized;

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
            canCreateVersion={false}
            canMoveOutside={canMoveAttached}
            canEvolve={canEvolve}
            attached={canDetach}
            needSynchronize={canSynchronize}
            onClick={rest.onClick}
        />
    );
});
