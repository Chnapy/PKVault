import { PopoverButton } from '@headlessui/react';
import React from 'react';
import { usePkmVariantSlotInfos } from '../../../data/hooks/use-pkm-variant-slot-infos';
import { withErrorCatcher } from '../../../error/with-error-catcher';
import { Route } from '../../../routes/storage';
import { StorageItemPopover } from '../../../ui/storage-item/storage-item-popover';
import { StorageSelectContext } from '../../actions/storage-select-context';
import { StorageMainItemBase, type StorageMainItemBaseProps } from './storage-main-item-base';

type StorageMainItemProps = {
    pkmId: string;
};

export const StorageMainItem: React.FC<StorageMainItemProps> = withErrorCatcher(
    'item',
    React.memo(({ pkmId }) => {
        const selected = Route.useSearch({ select: search => search.selected });
        const navigate = Route.useNavigate();

        const { checked, onCheck } = StorageSelectContext.useCheck(undefined, pkmId);

        const variantInfos = usePkmVariantSlotInfos(pkmId);

        if (!variantInfos) {
            return null;
        }

        const { mainVariant, canCreateVariants, canEvolveVariant, canSynchronize, canMoveAttached } = variantInfos;

        const { heldItem } = mainVariant;

        return (
            <StorageItemPopover
                pkmId={pkmId}
                boxId={mainVariant.boxId}
                boxSlot={mainVariant.boxSlot}
                selected={selected && !selected.saveId && selected.id === pkmId}
            >
                {props => (
                    <PopoverButton
                        as={StorageMainItemBase}
                        {...({
                            ...props,
                            pkmId,
                            heldItem,
                            canCreateVariant: canCreateVariants.length > 0,
                            canMoveOutside: canMoveAttached,
                            canEvolve: !!canEvolveVariant,
                            needSynchronize: canSynchronize,
                            onClick:
                                props.onClick ??
                                (() =>
                                    navigate({
                                        search: {
                                            selected:
                                                selected && !selected.saveId && selected.id === pkmId
                                                    ? undefined
                                                    : {
                                                        saveId: undefined,
                                                        id: pkmId,
                                                    },
                                        },
                                    })),
                            checked,
                            onCheck,
                        } satisfies StorageMainItemBaseProps)}
                    />
                )}
            </StorageItemPopover>
        );
    }),
);
