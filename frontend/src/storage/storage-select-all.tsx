import React from 'react';
import { usePkmSaveIndex } from '../data/hooks/use-pkm-save-index';
import { usePkmVariantIndex } from '../data/hooks/use-pkm-variant-index';
import { CheckboxInput } from '../ui/input/checkbox-input';

export const StorageSelectAll: React.FC<{
    saveId?: number;
    boxId: number;
    disabled?: boolean;
}> = ({ saveId, boxId, disabled }) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const selectContext = {} as any;//StorageSelectContext.useValue();

    const mainPkmsQuery = usePkmVariantIndex();
    const savePkmsQuery = usePkmSaveIndex(saveId ?? 0);

    const pkms = saveId ? Object.values(savePkmsQuery.data?.data.byBox[ boxId ] ?? {}) : Object.values(mainPkmsQuery.data?.data.byBox[ boxId ] ?? {}).flat();

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
            disabled={disabled}
        />
    );
};
