import { Group } from '@mantine/core';
import React from 'react';
import { useStorageMode } from '../../ui/inventory/context/storage-mode-context';
import { EditPkmButton } from './actions/edit-pkm-button';
import { EvolvePkmButton } from './actions/evolve-pkm-button';
import { MoveAttachedButton } from './actions/move-attached-button';
import { MoveButton, type MoveButtonProps } from './actions/move-button';
import { ReleasePkmButton, type ReleasePkmButtonProps } from './actions/release-pkm-button';

type DetailsActionsProps =
    & Pick<MoveButtonProps, 'isInventory' | 'focusOnMount'>
    & Pick<ReleasePkmButtonProps, 'deleteAllRelatedVariants'>
    & {
        ids: string[];
        saveId: number | null;
    };

export const DetailsActions: React.FC<DetailsActionsProps> = ({ focusOnMount, ids, saveId, isInventory, deleteAllRelatedVariants }) => {
    const storageMode = useStorageMode().state;

    return <Group>
        <MoveButton
            id={ids[ 0 ] ?? ''}
            saveId={saveId}
            focusOnMount={focusOnMount}
            isInventory={isInventory}
        />

        {storageMode === 'default' && <>
            <MoveAttachedButton
                pkmIds={ids}
                saveId={saveId}
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
                deleteAllRelatedVariants={deleteAllRelatedVariants}
            />
        </>}
    </Group>;
};
