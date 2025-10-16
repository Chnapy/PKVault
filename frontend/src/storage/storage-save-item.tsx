import { PopoverButton } from '@headlessui/react';
import React from 'react';
import { useStorageGetSavePkms } from '../data/sdk/storage/storage.gen';
import { Route } from '../routes/storage';
import { StorageItemPopover } from '../ui/storage-item/storage-item-popover';
import { StorageSaveItemBase } from './storage-save-item-base';

type StorageSaveItemProps = {
    saveId: number;
    pkmId: string;
};

export const StorageSaveItem: React.FC<StorageSaveItemProps> = React.memo(({ saveId, pkmId }) => {
    const selected = Route.useSearch({ select: (search) => search.selected });
    const navigate = Route.useNavigate();

    const savePkmsQuery = useStorageGetSavePkms(saveId);

    const savePkm = savePkmsQuery.data?.data.find(pkm => pkm.id === pkmId);

    if (!savePkm) {
        return null;
    }

    return (
        <StorageItemPopover
            saveId={saveId}
            pkmId={pkmId}
            boxId={savePkm.box}
            boxSlot={savePkm.boxSlot}
            selected={!!selected?.saveId && selected.id === pkmId}
        >
            {props => <PopoverButton
                as={StorageSaveItemBase}
                saveId={saveId}
                pkmId={pkmId}
                {...props}
                // Note: onClick is required here because of PopoverButton
                onClick={props.onClick ?? (() =>
                    navigate({
                        search: {
                            selected: !!selected?.saveId && selected.id === pkmId
                                ? undefined
                                : {
                                    saveId,
                                    id: pkmId,
                                },
                        },
                    })
                )}
            />}
        </StorageItemPopover>
    );
});
