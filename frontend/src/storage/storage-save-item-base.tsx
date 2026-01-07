import React from 'react';
import { usePkmSaveDuplicate } from '../data/hooks/use-pkm-save-duplicate';
import { usePkmSaveVersion } from '../data/hooks/use-pkm-save-version';
import { Gender as GenderType } from '../data/sdk/model';
import { useStorageGetSavePkms } from '../data/sdk/storage/storage.gen';
import { useStaticData } from '../hooks/use-static-data';
import type { ButtonLikeProps } from '../ui/button/button-like';
import { StorageItem, type StorageItemProps } from '../ui/storage-item/storage-item';

export type StorageSaveItemBaseProps = ButtonLikeProps & Pick<StorageItemProps, 'anchor' | 'helpTitle' | 'small' | 'checked' | 'onCheck'> & {
    saveId: number;
    pkmId: string;
};

export const StorageSaveItemBase: React.FC<StorageSaveItemBaseProps> = React.memo(({ saveId, pkmId, ...rest }) => {
    const staticData = useStaticData();

    const savePkmsQuery = useStorageGetSavePkms(saveId);

    const getPkmSaveDuplicate = usePkmSaveDuplicate();
    const getPkmSaveVersion = usePkmSaveVersion();

    const savePkm = savePkmsQuery.data?.data.find(pkm => pkm.id === pkmId);

    if (!savePkm) {
        return null;
    }

    const { species, version, form, gender, isAlpha, isShiny, isEgg, isShadow, heldItemPokeapiName, level } = savePkm;

    const staticEvolves = staticData.evolves[ species ];
    const evolveSpecies = staticEvolves?.trade[ version ] ?? staticEvolves?.tradeWithItem[ heldItemPokeapiName ?? '' ]?.[ version ];

    // const attachedVersionPkm = savePkm.pkmVersionId ? allPkmVersions.find(savePkm => savePkm.pkmVersionId && pkmVersionsIds.includes(savePkm.pkmVersionId)) : undefined;
    const attachedPkmVersion = getPkmSaveVersion(savePkm.idBase, savePkm.saveId);
    const saveSynchronized = savePkm.dynamicChecksum === attachedPkmVersion?.dynamicChecksum;

    const canMoveAttached = !attachedPkmVersion && !isEgg && !isShadow;
    const canEvolve = !!evolveSpecies && level >= evolveSpecies.minLevel;
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
            warning={!getPkmSaveDuplicate(savePkm).isValid}
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
