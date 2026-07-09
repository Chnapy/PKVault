import { Tabs, Text } from '@mantine/core';
import React from 'react';
import { useStorageCreateMainBox } from '../../../data/sdk/storage/storage.gen';
import { Route } from '../../../routes/storage';
import { UIStoragePanelBoxList, type UIBoxData } from '../../../ui-new/storage/storage-panel/box-list/ui-storage-panel-box-list';
import { DexSyncAdvancedAction } from '../../advanced-actions/dex-sync-advanced-action';
import { SortAdvancedAction } from '../../advanced-actions/sort-advanced-action';
import { StorageSelectCheckbox } from '../../storage-select-checkbox';
import { useCurrentStorageWithFallback } from '../hooks/use-current-storage-with-fallback';
import { useFilteredBoxes } from '../hooks/use-filtered-boxes';
import { useCurrentStorage } from '../storage-panel-context';
import { BoxExpanded } from './box-expanded';
import { getBoxTypeColor } from './utils/get-box-type-color';

export const StoragePanelBoxList: React.FC = () => {
    const { setStorage } = useCurrentStorage();
    const storage = useCurrentStorageWithFallback();
    const { saveId = null, boxId, bankId } = storage.data ?? {};
    const navigate = Route.useNavigate();

    const boxCreateMutation = useStorageCreateMainBox();

    const boxesQuery = useFilteredBoxes(saveId);

    const boxes = (boxesQuery.data?.data ?? []).sort((b1, b2) => b1.order < b2.order ? -1 : 1);

    const isLoading = [ storage, boxesQuery ].some(query => query.isLoading);
    if (isLoading || boxId === undefined)
        return null;

    const onSelect = (id: string) => {
        navigate({
            search: search => {
                return {
                    ...search,
                    storages: setStorage(search.storages, { boxId: Number(id) }),
                };
            },
        });
    };

    return <UIStoragePanelBoxList
        value={boxId.toString()}
        data={boxes.map(({ id, name, type }): UIBoxData => ({
            id,
            label: name,
            type,
        }))}
        onSelect={onSelect}
        onCreate={saveId || !bankId
            ? undefined
            : (() => boxCreateMutation.mutateAsync({ params: { bankId } }))
        }
        renderTab={({ item, selected }, { reduce }) => <Tabs.Tab
            key={item.id}
            value={item.id}
            onClick={reduce}
            disabled={storage.data?.disabledBoxId === item.id}
            color={getBoxTypeColor(item.type)}
            py={0}
            style={{ gap: 4 }}
            rightSection={selected && <StorageSelectCheckbox
                saveId={saveId}
                boxId={boxId}
                size='xs'
            />}
        >
            <Text component={selected ? 'b' : undefined} textWrap='nowrap'>{item.label}</Text>
        </Tabs.Tab>}
        renderExpanded={(data, { reduce }) => data.map(({ item, selected }) => <BoxExpanded
            key={item.id}
            id={item.id}
            label={item.label}
            selected={selected}
            onSelect={storage.data?.disabledBoxId === item.id
                ? undefined
                : (() => {
                    onSelect(item.id);
                    reduce();
                })}
        />)}
        advancedActionSort={<SortAdvancedAction saveId={saveId} boxId={boxId} />}
        advancedDexSync={<DexSyncAdvancedAction saveId={saveId ?? 0} />}
    />;
};
