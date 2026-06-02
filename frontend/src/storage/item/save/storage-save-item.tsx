import React from 'react';
import { usePkmLegality } from '../../../data/hooks/use-pkm-legality';
import { usePkmSaveIndex } from '../../../data/hooks/use-pkm-save-index';
import { usePkmVariantIndex } from '../../../data/hooks/use-pkm-variant-index';
import { Gender } from '../../../data/sdk/model';
import { withErrorCatcher } from '../../../error/with-error-catcher';
import { Route } from '../../../routes/storage';
import { UIStorageItemIcons } from '../../../ui-new/storage/storage-item/ui-storage-item-icons';
import { ItemImg } from '../../../ui/img/item-img';
import { StorageItem, type StorageItemProps } from '../../../ui/storage-item/storage-item';
import type { MoveContainerValue } from '../../move/state/move-select-impl-provider';

type StorageSaveItemProps = Pick<StorageItemProps, 'nodeId'> & {
    saveId: number;
    pkmId: string;
};

export const StorageSaveItem: React.FC<StorageSaveItemProps> = withErrorCatcher(
    'item',
    React.memo(({ saveId, pkmId, nodeId }) => {
        const selected = Route.useSearch({ select: search => search.selected });
        const navigate = Route.useNavigate();

        const savePkmsQuery = usePkmSaveIndex(saveId);

        const pkmVariantIndex = usePkmVariantIndex();

        const pkmLegalityQuery = usePkmLegality(pkmId, saveId);
        const pkmLegality = pkmLegalityQuery.data?.data;

        const savePkm = savePkmsQuery.data?.data.byId[ pkmId ];

        const container = React.useMemo((): MoveContainerValue => ({
            type: 'save-item',
            bankId: '',
            saveId,
            boxId: savePkm?.boxId.toString() ?? '',
        }), [ saveId, savePkm?.boxId ]);

        if (!savePkm) {
            return null;
        }

        const { id, species, nickname, level, boxSlot, form, gender, contextVersion, isAlpha, isShiny, isEgg, isShadow, canEvolve } = savePkm;

        const attachedPkmVariant = pkmVariantIndex.data?.data.byAttachedSave[ savePkm.saveId ]?.[ savePkm.idBase ];
        const saveSynchronized = savePkm.dynamicChecksum === attachedPkmVariant?.dynamicChecksum;

        const canDetach = !!attachedPkmVariant;
        const canSynchronize = !!attachedPkmVariant && !saveSynchronized;

        return <StorageItem
            id={id}
            nodeId={nodeId}
            species={species}
            container={container}
            slot={boxSlot}
            context={savePkm.context}
            form={form}
            isFemale={gender == Gender.Female}
            isEgg={isEgg}
            isShiny={isShiny}
            isShadow={isShadow}
            name={nickname}
            level={level}
            onClick={() => navigate({
                search: {
                    selected:
                        !!selected?.saveId && selected.id === pkmId
                            ? undefined
                            : {
                                saveId,
                                id: pkmId,
                            },
                },
            })}
            icons={<UIStorageItemIcons
                isAlpha={isAlpha}
                isShiny={isShiny}
                isStarter={savePkm.isStarter}
                isDuplicate={savePkm.isDuplicate}
                heldItem={savePkm.heldItem > 0 && <ItemImg
                    version={contextVersion}
                    item={savePkm.heldItem}
                />}
                warning={!!pkmLegality && !pkmLegality.isValid}
                level={savePkm.level}
                party={savePkm.party >= 0 ? savePkm.party : undefined}
                canEvolve={canEvolve}
                attached={canDetach}
                needSynchronize={canSynchronize}
            />}
        />;
    }),
);
