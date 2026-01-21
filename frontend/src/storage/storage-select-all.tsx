import React from 'react';
import { usePkmVersionIndex } from '../data/hooks/use-pkm-version-index';
import { useStorageGetSavePkms } from '../data/sdk/storage/storage.gen';
import { CheckboxInput } from '../ui/input/checkbox-input';
import { StorageSelectContext } from './actions/storage-select-context';

export const StorageSelectAll: React.FC<{
    saveId?: number;
    boxId: number;
}> = ({ saveId, boxId }) => {
    const selectContext = StorageSelectContext.useValue();

    const mainPkmsQuery = usePkmVersionIndex();
    const savePkmsQuery = useStorageGetSavePkms(saveId ?? 0);

    const pkms = saveId
        ? (savePkmsQuery.data?.data.filter(item => item.boxId === boxId) ?? [])
        : Object.values(mainPkmsQuery.data?.data.byBox[ boxId ] ?? {}).flat();

    const ids = selectContext.saveId === saveId && selectContext.boxId === boxId ? selectContext.ids : [];

    const state = ids.length === 0 ? 'unselected' : ids.length === pkms.length ? 'selected' : 'indeterminate';

    return (
        <CheckboxInput
            checked={state !== 'unselected'}
            indeterminate={state === 'indeterminate'}
            onChange={async () => {
                if (state === 'selected') {
                    selectContext.clear();
                } else {
                    selectContext.addId(
                        saveId,
                        boxId,
                        pkms.map(pkm => pkm.id),
                    );
                }
            }}
        />
    );
};
