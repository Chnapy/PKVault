import type React from 'react';
import { Route } from '../../routes/storage';
import { UIStoragePanel } from '../../ui-new/storage/storage-panel/ui-storage-panel';
import { StoragePanelBoxList } from './box-list/storage-panel-box-list';
import { StoragePanelFooter } from './footer/storage-panel-footer';
import { StoragePanelGameList } from './game-list/storage-panel-game-list';
import { StoragePanelItems } from './items/storage-panel-items';
import { useCurrentStorage } from './storage-panel-context';

export const StoragePanel: React.FC = () => {
    const { getStorage } = useCurrentStorage();
    const hasStorage = Route.useSearch({ select: (search) => getStorage(search.storages) !== undefined });
    console.log('render panel')
    return <UIStoragePanel
        gameTabs={<StoragePanelGameList
        />}
        header={hasStorage && <StoragePanelBoxList />}
        footer={<StoragePanelFooter />}
    >
        {hasStorage && <StoragePanelItems />}
    </UIStoragePanel>;
};
