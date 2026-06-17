import type React from 'react';
import { useStorageGetBoxes } from '../../data/sdk/storage/storage.gen';
import type { PopoverTargetChildProps } from '../../ui-new/popover/target-open-popover';
import { UIStoragePanel } from '../../ui-new/storage/storage-panel/ui-storage-panel';
import { StorageBoxBackgroundsPrefetch } from '../box/storage-box-backgrounds-prefetch';
import { getBoxBackgroundUrl } from '../box/util/get-box-background-url';
import { StoragePanelBoxList } from './box-list/storage-panel-box-list';
import { StoragePanelFooter } from './footer/storage-panel-footer';
import { StoragePanelGameList } from './game-list/storage-panel-game-list';
import { useCurrentStorageWithFallback } from './hooks/use-current-storage-with-fallback';
import { StoragePanelItems } from './items/storage-panel-items';

export const StoragePanel: React.FC<PopoverTargetChildProps> = (popoverProps) => {
    const storage = useCurrentStorageWithFallback();
    const { saveId, boxId } = storage.data ?? {};
    const hasStorage = saveId !== undefined;

    const saveBoxesQuery = useStorageGetBoxes({ saveId: saveId ?? undefined }, { query: { enabled: !!saveId } });
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
        footer={hasStorage && <StoragePanelFooter />}
        backgroundImageUrl={backgroundImageUrl}
        {...popoverProps}
    >
        {hasStorage && <StoragePanelItems />}
    </UIStoragePanel>;
};
