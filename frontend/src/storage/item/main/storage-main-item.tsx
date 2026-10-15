import React from 'react';
import { usePkmAttachState } from '../../../data/hooks/use-pkm-attach-state';
import { usePkmLegalityMap } from '../../../data/hooks/use-pkm-legality';
import { usePkmVariantIndex } from '../../../data/hooks/use-pkm-variant-index';
import { Gender } from '../../../data/sdk/model';
import { withErrorCatcher } from '../../../error/with-error-catcher';
import { Route } from '../../../routes/storage';
import { UIStorageItemIcons } from '../../../ui/storage/storage-item/ui-storage-item-icons';
import { pick } from '../../../util/pick';
import { useSelectCallback } from '../../../util/use-select-callback';
import type { MoveContainerValue } from '../../move/move-container-fns';
import { useCurrentStorage } from '../../panel/storage-panel-context';
import { StorageItem, type StorageItemProps } from '../storage-item';
import { StorageItemHeldItem } from '../storage-item-held-item';

type StorageMainItemProps = Pick<StorageItemProps, 'nodeId' | 'selectFromPreviousSelected'> & {
    pkmId: string;
};

export const StorageMainItem: React.FC<StorageMainItemProps> = withErrorCatcher(
    'item',
    React.memo(({ pkmId, ...rest }) => {
        const { storageIndex, getSelected } = useCurrentStorage();
        const navigate = Route.useNavigate();

        const variantsQuery = usePkmVariantIndex(
            useSelectCallback(data => {
                const baseVariant = data.data.byId[ pkmId ];
                if (!baseVariant)
                    return;

                const variants = data.data.byBox[ baseVariant.boxId ]?.[ baseVariant.boxSlot ] ?? [];
                const mainVariant = variants.find(v => v.isMain);
                if (!mainVariant)
                    return;

                const canEvolve = variants.some(variant => variant.canEvolve);
                const hasDisabledVariant = variants.some(variant => !variant.isEnabled);

                return {
                    variants: variants.map(pkm =>
                        pick(pkm, [ 'id', 'context', 'isMain' ])
                    ),
                    mainVariant: mainVariant && pick(mainVariant, [
                        'id', 'species', 'nickname', 'level', 'boxId', 'boxSlot', 'contextVersion', 'context',
                        'form', 'gender', 'isEgg', 'isAlpha', 'isShiny', 'nSparkle', 'isShadow', 'isExternal', 'heldItem',
                    ]),
                    canEvolve,
                    hasDisabledVariant,
                };
            }, [ pkmId ])
        );
        const variantInfos = variantsQuery.data;

        const selected = Route.useSearch({
            select: search => {
                const value = getSelected(search.selected);
                return !value?.saveId && variantInfos?.variants.some(v => v.id === value?.id);
            },
        });

        const attachStateQuery = usePkmAttachState(null, pkmId);
        const { isAttached, canSynchronize, attachBroken } = attachStateQuery.data ?? {};

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

        const { mainVariant, variants, hasDisabledVariant, canEvolve } = variantInfos;

        const { id, species, nickname, level, boxSlot, contextVersion, context, form, gender, isEgg, isAlpha, isShiny, nSparkle, isShadow, isExternal, heldItem } = mainVariant;

        const heldItemNode = <StorageItemHeldItem
            heldItem={heldItem} contextVersion={contextVersion}
            container={container} slot={boxSlot} id={id}
        />;

        return <StorageItem
            id={id}
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
            {...rest}
            icons={<UIStorageItemIcons
                isAlpha={isAlpha}
                isShiny={isShiny}
                isN={nSparkle}
                isExternal={isExternal}
                warning={pkmLegalityMap.some(value => !value.isValid)}
                nbrVariants={variants.length}
                hasDisabledVariant={hasDisabledVariant}
                attached={isAttached}
                heldItem={heldItemNode}
                canEvolve={canEvolve}
                needSynchronize={canSynchronize}
                attachBroken={attachBroken}
            />}
            heldItem={heldItemNode}
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
