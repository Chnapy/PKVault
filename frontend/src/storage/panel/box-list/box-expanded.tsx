import React from 'react';
import { usePkmIndex } from '../../../data/hooks/use-pkm-index';
import { BoxType } from '../../../data/sdk/model';
import { useStorageDeleteMainBox } from '../../../data/sdk/storage/storage.gen';
import { Route } from '../../../routes/storage';
import { UIBoxExpanded, type UIBoxExpandedProps } from '../../../ui/storage/storage-panel/box-list/ui-box-expanded';
import { useSelectCallback } from '../../../util/use-select-callback';
import { StorageBoxEdit } from '../../box/storage-box-edit';
import { useFilteredBoxes } from '../hooks/use-filtered-boxes';
import { useCurrentStorage } from '../storage-panel-context';
import { getBoxTypeColor } from './utils/get-box-type-color';

export type BoxExpandedProps = Pick<UIBoxExpandedProps, 'id' | 'label' | 'selected' | 'onSelect'>;

export const BoxExpanded: React.FC<BoxExpandedProps> = ({ id, label, selected, onSelect }) => {
    const { getStorage } = useCurrentStorage();
    const saveId = Route.useSearch({ select: (search) => getStorage(search.storages)?.saveId ?? null });

    const boxDeleteMutation = useStorageDeleteMainBox();

    const boxesQuery = useFilteredBoxes(saveId);
    const boxes = boxesQuery.data?.data ?? [];
    const box = boxes.find(box => box.id === id);

    const pkmsQuery = usePkmIndex(
        saveId,
        useSelectCallback(data => {
            if (!box?.idInt)
                return;

            return Object.fromEntries(
                Object.entries(data.data.byBox[ box.idInt ] ?? {}).map(([ slot, pkm ]) => [ slot, !!pkm ])
            );
        }, [ box?.idInt ]),
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
        color={getBoxTypeColor(box?.type ?? BoxType.Box)}
    />;
};
