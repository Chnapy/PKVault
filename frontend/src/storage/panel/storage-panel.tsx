import React from 'react';
import { BoxType } from '../../data/sdk/model';
import { useStorageGetBoxes } from '../../data/sdk/storage/storage.gen';
import { Route } from '../../routes/storage';
import type { PopoverTargetChildProps } from '../../ui/popover/target-open-popover';
import { UIStoragePanel } from '../../ui/storage/storage-panel/ui-storage-panel';
import { StorageBoxBackgroundsPrefetch } from '../box/storage-box-backgrounds-prefetch';
import { getBoxBackgroundUrl } from '../box/util/get-box-background-url';
import { StoragePanelBoxList } from './box-list/storage-panel-box-list';
import { StoragePanelFooter } from './footer/storage-panel-footer';
import { StoragePanelGameList } from './game-list/storage-panel-game-list';
import { useCurrentStorageWithFallback } from './hooks/use-current-storage-with-fallback';
import { StoragePanelInventoryItems } from './items/storage-panel-inventory-items';
import { StoragePanelItems } from './items/storage-panel-items';

export const StoragePanel: React.FC<PopoverTargetChildProps> = (popoverProps) => {
    const storage = useCurrentStorageWithFallback();
    const { saveId, boxId } = storage.data ?? {};
    const hasStorage = saveId !== undefined;

    const navigate = Route.useNavigate();

    const boxesQuery = useStorageGetBoxes({ saveId });
    const box = boxesQuery.data?.data.find(box => box.idInt === boxId);

    const backgroundImageUrl = box?.wallpaperName
        ? getBoxBackgroundUrl(box.wallpaperName)
        : undefined;

    const storageWithoutBox = !(storage.isPending && storage.isEnabled) && saveId !== undefined && boxId === undefined;

    React.useEffect(() => {
        if (storageWithoutBox)
            navigate({
                search: search => {
                    const otherStorage = search.storages?.[ (storage.storageIndex + 1) % 2 ];
                    return {
                        storages: otherStorage ? [ otherStorage ] : [],
                    };
                },
            });
    }, [ navigate, storageWithoutBox, storage.storageIndex ]);

    // console.log('render panel')

    return <UIStoragePanel
        gameTabs={<StoragePanelGameList
        />}
        header={hasStorage && <>
            <StoragePanelBoxList />
            {saveId && <StorageBoxBackgroundsPrefetch saveId={saveId} />}
        </>}
        footer={hasStorage && <StoragePanelFooter />}
        backgroundImageUrl={backgroundImageUrl}
        {...popoverProps}
    >
        {hasStorage && box && (
            box.type === BoxType.Inventory
                ? <StoragePanelInventoryItems />
                : <StoragePanelItems />
        )}
    </UIStoragePanel>;
};
