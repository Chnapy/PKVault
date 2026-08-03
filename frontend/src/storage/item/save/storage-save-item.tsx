import React from 'react';
import { usePkmLegality } from '../../../data/hooks/use-pkm-legality';
import { usePkmSaveIndex } from '../../../data/hooks/use-pkm-save-index';
import { usePkmVariantIndex } from '../../../data/hooks/use-pkm-variant-index';
import { Gender } from '../../../data/sdk/model';
import { withErrorCatcher } from '../../../error/with-error-catcher';
import { Route } from '../../../routes/storage';
import { UIStorageItemIcons } from '../../../ui/storage/storage-item/ui-storage-item-icons';
import { ItemImg } from '../../../img/item-img';
import { StorageItem, type StorageItemProps } from '../storage-item';
import { pick } from '../../../util/pick';
import { useSelectCallback } from '../../../util/use-select-callback';
import type { MoveContainerValue } from '../../move/move-container-fns';
import { useCurrentStorage } from '../../panel/storage-panel-context';

type StorageSaveItemProps = Pick<StorageItemProps, 'nodeId'> & {
    saveId: number;
    pkmId: string;
};

export const StorageSaveItem: React.FC<StorageSaveItemProps> = withErrorCatcher(
    'item',
    React.memo(({ saveId, pkmId, nodeId }) => {
        const { storageIndex, getSelected } = useCurrentStorage();
        const navigate = Route.useNavigate();

        const selected = Route.useSearch({
            select: search => {
                const value = getSelected(search.selected);
                return value?.saveId === saveId && value.id === pkmId;
            },
        });

        const savePkmsQuery = usePkmSaveIndex(saveId,
            useSelectCallback(data => {
                const pkm = data.data.byId[ pkmId ];
                if (!pkm)
                    return;

                return pick(pkm, [
                    'id', 'idBase', 'saveId', 'context', 'species', 'nickname', 'level', 'boxId', 'boxSlot',
                    'dynamicChecksum', 'form', 'gender', 'contextVersion', 'heldItem',
                    'isAlpha', 'isShiny', 'nSparkle', 'isEgg', 'isShadow', 'isStarter', 'isDuplicate', 'party',
                    'canEvolve',
                ]);
            }, [ pkmId ])
        );

        const canSynchronizeQuery = usePkmVariantIndex(
            useSelectCallback(data => {
                const savePkm = savePkmsQuery.data;
                if (!savePkm)
                    return;

                const attachedPkmVariant = data.data.byAttachedSave[ savePkm.saveId ]?.[ savePkm.idBase ];
                if (!attachedPkmVariant)
                    return;

                return {
                    isAttached: true,
                    canSynchronize: savePkm.dynamicChecksum !== attachedPkmVariant.dynamicChecksum,
                };
            }, [ savePkmsQuery.data ])
        );
        const { isAttached, canSynchronize } = canSynchronizeQuery.data ?? {};

        const pkmLegalityQuery = usePkmLegality(pkmId, saveId);
        const pkmLegality = pkmLegalityQuery.data?.data;

        const savePkm = savePkmsQuery.data;

        const container = React.useMemo((): MoveContainerValue => ({
            type: 'save-item',
            saveId,
            boxId: savePkm?.boxId.toString() ?? '',
        }), [ saveId, savePkm?.boxId ]);

        if (!savePkm) {
            return null;
        }

        const { id, species, nickname, level, boxSlot, form, gender, contextVersion, isAlpha, isShiny, nSparkle, isEgg, isShadow, canEvolve } = savePkm;

        return <StorageItem
            id={id}
            nodeId={nodeId}
            selected={selected}
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
                search: search => {
                    const alreadySelected = search.selected
                        && !!search.selected.saveId
                        && search.selected.storage === storageIndex
                        && search.selected.id === pkmId;

                    return {
                        selected: alreadySelected
                            ? undefined
                            : {
                                storage: storageIndex,
                                saveId,
                                id: pkmId,
                            },
                    };
                },
            })}
            icons={<UIStorageItemIcons
                isAlpha={isAlpha}
                isShiny={isShiny}
                isN={nSparkle}
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
                attached={isAttached}
                needSynchronize={canSynchronize}
            />}
        />;
    }),
);
