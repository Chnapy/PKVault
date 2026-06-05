import React from 'react';
import { usePkmIndex } from '../../../data/hooks/use-pkm-index';
import { useStorageDeleteMainBox, useStorageGetBoxes } from '../../../data/sdk/storage/storage.gen';
import { Route } from '../../../routes/storage';
import { UIBoxExpanded, type UIBoxExpandedProps } from '../../../ui-new/storage/storage-panel/box-list/ui-box-expanded';
import { StorageBoxEdit } from '../../box/storage-box-edit';
import { useCurrentStorage } from '../storage-panel-context';

export type BoxExpandedProps = Pick<UIBoxExpandedProps, 'id' | 'label' | 'selected' | 'onSelect'>;

export const BoxExpanded: React.FC<BoxExpandedProps> = ({ id, label, selected, onSelect }) => {
    const { getStorage } = useCurrentStorage();
    const saveId = Route.useSearch({ select: (search) => getStorage(search.storages)?.saveId ?? null });

    const boxDeleteMutation = useStorageDeleteMainBox();

    const boxesQuery = useStorageGetBoxes({ saveId: saveId ?? undefined });

    const boxes = boxesQuery.data?.data ?? [];
    const box = boxes.find(box => box.id === id);

    const pkmsQuery = usePkmIndex(
        saveId,
        React.useCallback(data => box && data.data.byBox[ box.idInt ], [ box ]),
    );

    const boxPkms = pkmsQuery.data;

    const slotsStates = box
        ? new Array(box.slotCount).fill(0).map((_, i) => !!boxPkms?.[ i ])
        : [];

    const editPanelContent = saveId
        ? undefined
        : <StorageBoxEdit boxId={id} />;

    const canDelete = !saveId && boxes.length > 1;

    return <UIBoxExpanded
        id={id}
        label={label}
        slotsStates={slotsStates}
        selected={selected}
        onSelect={onSelect}
        onDelete={canDelete
            ? (() => boxDeleteMutation.mutateAsync({ boxId: id }))
            : undefined}
        editDropdown={editPanelContent}
    />;
};
