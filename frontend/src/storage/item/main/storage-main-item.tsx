import React from 'react';
import { usePkmLegalityMap } from '../../../data/hooks/use-pkm-legality';
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

type StorageMainItemProps = Pick<StorageItemProps, 'nodeId'> & {
    pkmId: string;
};

export const StorageMainItem: React.FC<StorageMainItemProps> = withErrorCatcher(
    'item',
    React.memo(({ nodeId, pkmId }) => {
        const { storageIndex, getSelected } = useCurrentStorage();
        const navigate = Route.useNavigate();

        const selected = Route.useSearch({
            select: search => {
                const sltd = getSelected(search.selected);
                return !sltd?.saveId && sltd?.id === pkmId;
            },
        });

        const variantsQuery = usePkmVariantIndex(
            useSelectCallback(data => {
                const baseVariant = data.data.byId[ pkmId ];
                if (!baseVariant)
                    return;

                const variants = data.data.byBox[ baseVariant.boxId ]?.[ baseVariant.boxSlot ] ?? [];
                const mainVariant = variants.find(v => v.isMain);
                if (!mainVariant)
                    return;

                const attachedVariant = variants.find(variant => variant.attachedSaveId);

                const canEvolve = variants.some(variant => variant.canEvolve);
                const hasDisabledVariant = variants.some(variant => !variant.isEnabled);

                return {
                    variants: variants.map(pkm =>
                        pick(pkm, [ 'id', 'context', 'isMain' ])
                    ),
                    mainVariant: mainVariant && pick(mainVariant, [
                        'id', 'species', 'nickname', 'level', 'boxId', 'boxSlot', 'contextVersion', 'context',
                        'form', 'gender', 'isEgg', 'isAlpha', 'isShiny', 'isShadow', 'isExternal', 'heldItem',
                    ]),
                    attachedVariant: attachedVariant && pick(attachedVariant, [ 'attachedSaveId', 'attachedSavePkmIdBase', 'dynamicChecksum' ]),
                    canEvolve,
                    hasDisabledVariant,
                };
            }, [ pkmId ])
        );
        const variantInfos = variantsQuery.data;

        const canSynchronizeQuery = usePkmSaveIndex(variantInfos?.attachedVariant?.attachedSaveId ?? 0,
            useSelectCallback(data => {
                const attachedVariant = variantInfos?.attachedVariant;
                if (!attachedVariant?.attachedSavePkmIdBase)
                    return false;

                const attachedSavePkms = data.data.byIdBase[ attachedVariant.attachedSavePkmIdBase ] ?? [];
                if (attachedSavePkms.length === 0)
                    return false;

                return attachedSavePkms.every(pkm => pkm.dynamicChecksum !== attachedVariant.dynamicChecksum);
            }, [ variantInfos?.attachedVariant ])
        );
        const canSynchronize = canSynchronizeQuery.data ?? false;

        const variantsIds = variantInfos?.variants.map(variant => variant.id) ?? [];

        const pkmLegalityMapQuery = usePkmLegalityMap(variantsIds);
        const pkmLegalityMap = Object.values(pkmLegalityMapQuery.data?.data ?? {});

        const container = React.useMemo((): MoveContainerValue => ({
            type: 'main-item',
            boxId: variantInfos?.mainVariant.boxId.toString() ?? '',
        }), [ variantInfos?.mainVariant.boxId ]);

        if (!variantInfos) {
            return null;
        }

        const { mainVariant, variants, attachedVariant, hasDisabledVariant, canEvolve } = variantInfos;

        const { id, species, nickname, level, boxSlot, contextVersion, context, form, gender, isEgg, isAlpha, isShiny, isShadow, isExternal, heldItem } = mainVariant;

        return <StorageItem
            id={id}
            nodeId={nodeId}
            selected={selected}
            container={container}
            species={species}
            slot={boxSlot}
            context={context}
            form={form}
            isFemale={gender === Gender.Female}
            isEgg={isEgg}
            isShiny={isShiny}
            isShadow={isShadow}
            name={nickname}
            level={level}
            icons={<UIStorageItemIcons
                isAlpha={isAlpha}
                isShiny={isShiny}
                isExternal={isExternal}
                warning={pkmLegalityMap.some(value => !value.isValid)}
                nbrVariants={variants.length}
                hasDisabledVariant={hasDisabledVariant}
                attached={!!attachedVariant}
                heldItem={heldItem > 0 && <ItemImg
                    version={contextVersion}
                    item={heldItem}
                />}
                canEvolve={canEvolve}
                needSynchronize={canSynchronize}
            />}
            onClick={() => navigate({
                search: search => {
                    const alreadySelected = search.selected
                        && !search.selected.saveId
                        && search.selected.storage === storageIndex
                        && variants.some(variant => variant.id === search.selected!.id);
                    if (alreadySelected)
                        return {
                            selected: undefined,
                        };

                    const variant = variants.find(variant => variant.context === search.selectedContext) ?? mainVariant;

                    return {
                        selected: {
                            storage: storageIndex,
                            saveId: undefined,
                            id: variant.id,
                        },
                    };
                },
            })}
        />;
    }),
);
