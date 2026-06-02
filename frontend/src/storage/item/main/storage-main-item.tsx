import React from 'react';
import { usePkmLegalityMap } from '../../../data/hooks/use-pkm-legality';
import { usePkmVariantSlotInfos } from '../../../data/hooks/use-pkm-variant-slot-infos';
import { Gender } from '../../../data/sdk/model';
import { withErrorCatcher } from '../../../error/with-error-catcher';
import { Route } from '../../../routes/storage';
import { UIStorageItemIcons } from '../../../ui-new/storage/storage-item/ui-storage-item-icons';
import { ItemImg } from '../../../ui/img/item-img';
import { StorageItem, type StorageItemProps } from '../../../ui/storage-item/storage-item';
import { BankContext } from '../../bank/bank-context';
import type { MoveContainerValue } from '../../move/state/move-select-impl-provider';

type StorageMainItemProps = Pick<StorageItemProps, 'nodeId'> & {
    pkmId: string;
};

export const StorageMainItem: React.FC<StorageMainItemProps> = withErrorCatcher(
    'item',
    React.memo(({ nodeId, pkmId }) => {
        const selected = Route.useSearch({ select: search => search.selected });
        const navigate = Route.useNavigate();

        const selectedBankBoxes = BankContext.useSelectedBankBoxes();
        const bank = selectedBankBoxes.data?.selectedBank.id;

        const variantInfos = usePkmVariantSlotInfos(pkmId);

        const variantsIds = variantInfos?.variants.map(variant => variant.id) ?? [];

        const pkmLegalityMapQuery = usePkmLegalityMap(variantsIds);
        const pkmLegalityMap = Object.values(pkmLegalityMapQuery.data?.data ?? {});

        const container = React.useMemo((): MoveContainerValue => ({
            type: 'main-item',
            bankId: bank ?? '',
            saveId: null,
            boxId: variantInfos?.mainVariant.boxId.toString() ?? '',
        }), [ bank, variantInfos?.mainVariant.boxId ]);

        if (!variantInfos) {
            return null;
        }

        const { mainVariant, variants, canDetach, canEvolveVariant, canSynchronize } = variantInfos;

        const { id, species, nickname, level, boxSlot, contextVersion, context, form, gender, isEgg, isAlpha, isShiny, isShadow, isExternal, heldItem } = mainVariant;

        return <StorageItem
            id={id}
            nodeId={nodeId}
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
                hasDisabledVariant={variants.some(pk => !pk.isEnabled)}
                attached={canDetach}
                heldItem={heldItem > 0 && <ItemImg
                    version={contextVersion}
                    item={heldItem}
                />}
                canEvolve={!!canEvolveVariant}
                needSynchronize={canSynchronize}
            />}
            onClick={() => navigate({
                search: {
                    selected:
                        selected && !selected.saveId && selected.id === pkmId
                            ? undefined
                            : {
                                saveId: undefined,
                                id: pkmId,
                            },
                },
            })}
        />;
    }),
);
