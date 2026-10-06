import { Group } from '@mantine/core';
import React from 'react';
import { usePkmIndex } from '../../data/hooks/use-pkm-index';
import { useStorageGetInventoryItems } from '../../data/sdk/storage/storage.gen';
import type { UIButtonProps } from '../../ui/form/button/ui-button';
import { useDragging } from '../../ui/interaction/move/hooks/use-dragging';
import { useStorageMode } from '../../ui/inventory/context/storage-mode-context';
import { pick } from '../../util/pick';
import { useSelectCallback } from '../../util/use-select-callback';
import type { MoveContainerValue } from '../move/move-container-fns';
import { EditPkmButton } from './actions/edit-pkm-button';
import { EvolvePkmButton } from './actions/evolve-pkm-button';
import { MoveAttachedButton } from './actions/move-attached-button';
import { MoveButton } from './actions/move-button';
import { ReleasePkmButton, type ReleasePkmButtonProps } from './actions/release-pkm-button';

type DetailsActionsProps =
    & Pick<UIButtonProps, 'focusOnMount'>
    & Pick<ReleasePkmButtonProps, 'deleteAllRelatedVariants'>
    & {
        ids: string[];
        saveId: number | null;
        isInventory?: boolean;
    };

export const DetailsActions: React.FC<DetailsActionsProps> = ({ focusOnMount, ids, saveId, isInventory, deleteAllRelatedVariants }) => {
    const storageMode = useStorageMode().state;

    const firstId = ids[ 0 ] ?? '';

    const pkmIndexQuery = usePkmIndex(saveId ?? null,
        useSelectCallback(data => {
            const pkm = data.data.byId[ firstId ];
            return pkm && pick(pkm, [ 'id', 'boxId' ]);
        }, [ firstId ]),
        { enabled: !isInventory });

    const inventoryQuery = useStorageGetInventoryItems({ saveId }, {
        query: {
            select: useSelectCallback(data => data.data[ firstId ], [ firstId ]),
            enabled: isInventory,
        },
    });

    const item = isInventory
        ? inventoryQuery.data
        : pkmIndexQuery.data;

    const boxId = item?.boxId;

    const container = React.useMemo((): MoveContainerValue => isInventory
        ? {
            type: 'inventory-item',
            saveId: saveId ?? undefined,
            boxId: boxId?.toString() ?? '',
        }
        : saveId
            ? {
                type: 'save-item',
                saveId,
                boxId: boxId?.toString() ?? '',
            }
            : {
                type: 'main-item',
                boxId: boxId?.toString() ?? '',
            }, [ boxId, isInventory, saveId ]);

    const dragging = useDragging(item?.id ?? '', container, false);

    return <Group>
        <MoveButton
            // eslint-disable-next-line react-hooks/refs
            ref={dragging.ref}
            // eslint-disable-next-line react-hooks/refs
            useDrag={dragging.useDrag}
            focusOnMount={focusOnMount}
        />

        {storageMode === 'default' && <>
            <MoveAttachedButton
                pkmIds={ids}
                saveId={saveId}
                // eslint-disable-next-line react-hooks/refs
                useDrag={dragging.useDrag}
            />

            <EditPkmButton
                pkmIds={ids}
                saveId={saveId}
            />

            <EvolvePkmButton
                pkmIds={ids}
                saveId={saveId}
            />

            <ReleasePkmButton
                pkmIds={ids}
                saveId={saveId}
                container={container}
                deleteAllRelatedVariants={deleteAllRelatedVariants}
            />
        </>}
    </Group>;
};
