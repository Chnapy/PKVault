import { Checkbox } from '@mantine/core';
import { useQueryClient } from '@tanstack/react-query';
import React from 'react';
import { getCachedPkmIndex } from '../data/hooks/use-pkm-index';
import { getCachedPkmSaveIndex } from '../data/hooks/use-pkm-save-index';
import { getCachedPkmVariantIndex } from '../data/hooks/use-pkm-variant-index';
import { useSelectContext, useSelectContextActions } from '../ui-new/interaction/select/context/use-select-context';
import { filterIsDefined } from '../util/filter-is-defined';
import type { MoveContainerValue } from './move/move-container-fns';

export const StorageSelectCheckbox: React.FC<{
    saveId: number | null;
    boxId: number;
    disabled?: boolean;
} & Checkbox.Props> = ({ saveId, boxId, disabled, ...rest }) => {
    const queryClient = useQueryClient();

    const { useSelectStore } = useSelectContext<MoveContainerValue>();
    const { addId, clear } = useSelectContextActions<MoveContainerValue>();

    const container: MoveContainerValue = saveId
        ? {
            type: 'save-item',
            saveId,
            boxId: String(boxId),
        }
        : {
            type: 'main-item',
            boxId: String(boxId),
        };

    const state = useSelectStore(({ ids }): 'none' | 'none-disabled' | 'all' | 'intermediate' => {
        if (ids.size === 0)
            return 'none';

        const pkmsIndex = getCachedPkmIndex(queryClient, saveId);
        if (!pkmsIndex?.data)
            return 'none-disabled';

        const boxPkmsCount = Object.values(pkmsIndex.data.byBox[ boxId ] ?? {}).length;
        if (boxPkmsCount === 0)
            return 'none-disabled';

        return boxPkmsCount === ids.size
            ? 'all'
            : 'intermediate';
    });

    disabled ||= state === 'none-disabled';

    return (
        <Checkbox
            {...rest}
            checked={state === 'all' || state === 'intermediate'}
            indeterminate={state === 'intermediate'}
            onChange={async () => {
                switch (state) {
                    case 'none-disabled':
                        break;
                    case 'none':
                    case 'intermediate': {
                        const boxPkms = saveId
                            ? Object.values(getCachedPkmSaveIndex(queryClient, saveId)?.data?.byBox[ boxId ] ?? {})
                            : Object.values(getCachedPkmVariantIndex(queryClient)?.data?.byBox[ boxId ] ?? {})
                                .map(variants => variants.find(v => v.isMain))
                                .filter(filterIsDefined);

                        const ids = boxPkms.map(pkm => pkm.id);

                        addId(container, ids);
                        break;
                    }
                    case 'all':
                        clear();
                        break;
                }
            }}
            disabled={disabled}
        />
    );
};
