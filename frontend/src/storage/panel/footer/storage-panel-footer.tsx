import React from 'react';
import { usePkmIndex } from '../../../data/hooks/use-pkm-index';
import { UIStoragePanelFooter } from '../../../ui/storage/storage-panel/ui-storage-panel-footer';
import { useCurrentStorageWithFallback } from '../hooks/use-current-storage-with-fallback';

export const StoragePanelFooter: React.FC = () => {
    const storage = useCurrentStorageWithFallback();
    const { saveId = null, boxId, box } = storage.data ?? {};

    // console.log('render box list ' + saveId);

    const pkmCountQuery = usePkmIndex(
        saveId,
        data => Object.keys(data.data.byBox[ boxId ?? -1 ] ?? {}).length,
    );

    const pkmTotalCountQuery = usePkmIndex(
        saveId,
        data => Object.values<Record<number, unknown>>(data.data.byBox).reduce<number>((acc, box) => acc + Object.keys(box).length, 0),
    );

    return <UIStoragePanelFooter
        boxSize={box?.slotCount ?? 0}
        pkmCount={pkmCountQuery.data ?? 0}
        pkmTotalCount={pkmTotalCountQuery.data ?? 0}
    />;
};
