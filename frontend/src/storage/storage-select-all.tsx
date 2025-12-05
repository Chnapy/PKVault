import React from 'react';
import { useStorageGetMainPkms, useStorageGetSavePkms } from '../data/sdk/storage/storage.gen';
import { CheckboxInput } from '../ui/input/checkbox-input';
import { StorageSelectContext } from './actions/storage-select-context';

export const StorageSelectAll: React.FC<{
    saveId?: number;
    boxId: number;
}> = ({ saveId, boxId }) => {
    const selectContext = StorageSelectContext.useValue();

    const mainPkmsQuery = useStorageGetMainPkms();
    const savePkmsQuery = useStorageGetSavePkms(saveId ?? 0);

    const pkms = saveId
        ? savePkmsQuery.data?.data.filter(item => item.boxId === boxId) ?? []
        : mainPkmsQuery.data?.data.filter(item => item.boxId === boxId) ?? [];

    const ids = selectContext.saveId === saveId && selectContext.boxId === boxId ? selectContext.ids : [];

    const state = ids.length === 0
        ? 'unselected'
        : (
            ids.length === pkms.length
                ? 'selected'
                : 'indeterminate'
        );

    return <CheckboxInput
        checked={state !== 'unselected'}
        indeterminate={state === 'indeterminate'}
        onChange={async () => {
            if (state === 'selected') {
                selectContext.clear();
            } else {
                selectContext.addId(saveId, boxId, pkms.map(pkm => pkm.id))
            }
        }}
    />;
};
