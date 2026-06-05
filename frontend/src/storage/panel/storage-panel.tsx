import type React from 'react';
import { useStorageGetBoxes } from '../../data/sdk/storage/storage.gen';
import { Route } from '../../routes/storage';
import type { PopoverTargetChildProps } from '../../ui-new/interaction/focus-controls/components/popover/popover-with-controls';
import { UIStoragePanel } from '../../ui-new/storage/storage-panel/ui-storage-panel';
import { StorageBoxBackgroundsPrefetch } from '../box/storage-box-backgrounds-prefetch';
import { getBoxBackgroundUrl } from '../box/util/get-box-background-url';
import { StoragePanelBoxList } from './box-list/storage-panel-box-list';
import { StoragePanelFooter } from './footer/storage-panel-footer';
import { StoragePanelGameList } from './game-list/storage-panel-game-list';
import { StoragePanelItems } from './items/storage-panel-items';
import { useCurrentStorage } from './storage-panel-context';

export const StoragePanel: React.FC<PopoverTargetChildProps> = (popoverProps) => {
    const { getStorage } = useCurrentStorage();
    const saveId = Route.useSearch({ select: (search) => getStorage(search.storages)?.saveId });
    const hasStorage = saveId !== undefined;

    const saveBoxesQuery = useStorageGetBoxes({ saveId: saveId ?? undefined }, { query: { enabled: !!saveId } });
    const boxId = Route.useSearch({ select: (search) => getStorage(search.storages)?.boxId })
        ?? saveBoxesQuery.data?.data[ 0 ]?.idInt ?? -1;

    const saveBox = saveBoxesQuery.data?.data.find(box => box.idInt === boxId);

    const backgroundImageUrl = saveBox?.wallpaperName
        ? getBoxBackgroundUrl(saveBox.wallpaperName)
        : undefined;

    console.log('render panel')

    return <UIStoragePanel
        gameTabs={<StoragePanelGameList
        />}
        header={hasStorage && <>
            <StoragePanelBoxList />
            {saveId && <StorageBoxBackgroundsPrefetch saveId={saveId} />}
        </>}
        footer={<StoragePanelFooter />}
        backgroundImageUrl={backgroundImageUrl}
        {...popoverProps}
    >
        {hasStorage && <StoragePanelItems />}
    </UIStoragePanel>;
};
