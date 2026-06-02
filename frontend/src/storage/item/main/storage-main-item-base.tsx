import React from 'react';
import { usePkmVariantSlotInfos } from '../../../data/hooks/use-pkm-variant-slot-infos';
import { Gender } from '../../../data/sdk/model';
import { StorageItem, type StorageItemProps } from '../../../ui/storage-item/storage-item';
import { BankContext } from '../../bank/bank-context';

export type StorageMainItemBaseProps =
    & Pick<StorageItemProps, 'label' | 'onClick' | 'icons'>
    & {
        pkmId: string;
    };

export const StorageMainItemBase: React.FC<StorageMainItemBaseProps> = React.memo(({ pkmId, ...rest }) => {
    const variantInfos = usePkmVariantSlotInfos(pkmId);

    const selectedBankBoxes = BankContext.useSelectedBankBoxes();
    const bank = selectedBankBoxes.data?.selectedBank.id;

    if (!variantInfos || !bank) {
        return null;
    }

    const { mainVariant } = variantInfos;

    const { id, species, boxId, boxSlot, context, form, gender, isEgg, isShiny, isShadow } = mainVariant;

    return (
        <StorageItem
            {...rest}
            id={id}
            species={species}
            bank={bank}
            box={boxId}
            slot={boxSlot}
            saveId={null}
            context={context}
            form={form}
            isFemale={gender === Gender.Female}
            isEgg={isEgg}
            isShiny={isShiny}
            isShadow={isShadow}
        />
    );
});
